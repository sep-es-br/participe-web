import { AfterViewInit, Component, ElementRef, Inject, Injector, OnDestroy, OnInit, QueryList, signal, ViewChildren, HostListener } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MenuItem, MessageService, SelectItem, PrimeNGConfig } from 'primeng/api';
import { faCheckCircle, faCircle, faIdBadge } from '@fortawesome/free-regular-svg-icons';
import { faBullhorn, faCheck, faEllipsisV, faHourglass, faHourglassStart, faQrcode, faSitemap, faTimes, faUserCheck, faUserTie, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { AttendanceModel, AuthTypeEnum } from '@app/shared/models/AttendanceModel';
import { Locality } from '@app/shared/models/locality';
import { LocalityService } from '@app/shared/services/locality.service';
import { AuthService } from '@app/shared/services/auth.service';
import { IAttendee } from '@app/shared/interface/IAttendee';
import { faIconAllowAnnounce, faIconAnnounced, faIconScreening } from '@app/shared/util/CustomIconDefenition';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';
import { IOptionOrganization } from '@app/shared/interface/IOptionOrganization';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AttendanceModel implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('toAnnounceToggle', { read: ElementRef }) toAnnounceToggleElems!: QueryList<ElementRef>;

  iconChecked = faCheckCircle;
  iconCircle = faCircle;
  iconRemove = faTimes;
  iconAuthority = faUserTie;
  iconTeam = faIdBadge;
  iconToAnnounce = faBullhorn;
  iconScreening = faIconScreening;
  iconAnnounced = faIconAnnounced;
  iconAllowAnnouce = faIconAllowAnnounce;
  iconEllipsis = faEllipsisV;
  iconOrg = faSitemap;

  menuItems: MenuItem[] = [];
  selectedAttendeeForMenu: IAttendee;

  // Nome, Ordem de Chegada, Tipo de Participante, Credenciamento e Presença, Situação da nominata, órgão
  // iconPreRegister = faQrcode;
  optionsOrderBy: SelectItem[] = [
    { label: 'Nome', value: 'nome' },
    { label: 'Tipo de participante', value: 'participante' },
    { label: 'Ordem de Chegada', value: 'ordemChegada' },
    { label: 'Cred. e presença', value: 'credPresence' },
    { label: 'Status da nominata', value: 'status' },
    { label: 'Órgão', value: 'orgao' }
  ];
  resultSearchCounty: Locality[];

  optionsParticipantes: SelectItem[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Representantes', value: 'repr' },
    { label: 'Representantes não equipe de governo', value: 'repr-not-equipe' },
    { label: 'Representantes equipe de governo', value: 'repr-equipe' },
    { label: 'Público', value: 'pub' }
  ];

  optionsFilterBy: SelectItem[] = [
    { label: 'Presentes', value: 'pres' },
    { label: 'Pré-credenciados', value: 'prereg' },
    { label: 'Pré-credenciados presentes', value: 'prereg_pres' },
    { label: 'Pré-credenciados ausentes', value: 'prereg_notpres' },
    { label: 'Presentes não pré-credenciados', value: 'notprereg_pres' },
  ];
  optionsFilterByStatus: SelectItem[] = [
    // value = [toAnnounce, announced]
    { label: 'Todos', value: 'all' },
    { label: 'Em Triagem', value: 'screening' },
    { label: 'Anunciar', value: 'toAnnounce' },
    { label: 'Anunciado', value: 'announced' }
  ];

  filteredOrganizations = signal(this.meetingSrv.organizationList());
  filteredNames = signal<string[]>([]);

  tempParticipante = 'all';
  tempFilterBy = 'prereg';
  tempFilterByStatus = 'all';
  tempOrganization: any = undefined;
  tempNameSearch = '';
  selectedOrderBy: string = 'nome';
  tempCounty: any = undefined;



  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  constructor(
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: UntypedFormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector,
    private authcSrv: AuthorityCredentialService,
    private primengConfig: PrimeNGConfig
  ) {
    super(injector, true);
  }

  ngOnInit(): void {
    this.primengConfig.zIndex = {
      modal: 1100,
      overlay: 99999999,
      menu: 1000,
      tooltip: 1100
    };
    this.authTypeChangeSub = this.form.controls.authType.valueChanges.subscribe(change => this.handleChangeAuthType(change));
    this.handleChangeAuthType(AuthTypeEnum.CPF);

    this.form.get('toAnnounce').valueChanges.subscribe(
      value => {
        if (!value) {
          this.form.get('announced').patchValue(false);
        }
      }
    );

    this.form.get('announced').valueChanges.subscribe(
      value => {
        if (value) {
          this.form.get('toAnnounce').patchValue(true);
        }
      }
    );

    this.tempParticipante = this.selectedParticipante;
    this.tempFilterBy = this.selectedFilterBy;
    this.tempFilterByStatus = this.selectedFilterByStatus;
    this.tempOrganization = this.selectedOrganization;
    this.tempNameSearch = this.nameSearch;
    this.tempCounty = this.selectedCounty;

    this.initializeMenu();
  }

  initializeMenu() {
    const attendee = this.selectedAttendeeForMenu;

    if (!attendee) return;

    this.menuItems = [
      {
        label: `${attendee.locality} - ${attendee.superLocality}`,
        icon: 'pi pi-map-marker',
        disabled: true
      },
      {
        separator: true
      },
      {
        label: 'Triagem',
        icon: 'pi pi-search',
        visible: !attendee.toAnnounce,
        command: () => this.toggleToAnnounce(attendee)
      },
      {
        label: !attendee.toAnnounce ? 'Autorizar' : (attendee.isAnnounced ? 'Anunciado' : 'Anunciar'),
        icon: 'custom-allow-announce',
        command: () => this.toggleToAnnounce(attendee)
      },
      {
        label: 'Pré-credenciamento',
        icon: 'assets/layout/images/icons/preregister_phone.svg',
        visible: !!attendee.preRegistered,
        command: () => {
          this.messageSrv.add({
            severity: 'info',
            summary: 'Pré-credenciamento',
            detail: `Participante pré-credenciado em ${attendee.preRegisteredDate}`
          });
        }
      }
    ];
  }

  openMenu(event: Event, attendee: IAttendee, menu: any) {
    event.stopPropagation();
    this.selectedAttendeeForMenu = attendee;
    this.initializeMenu();
    menu.toggle(event);
  }

  openTriagem(attendee: IAttendee, event?: Event) {
    if (event) { event.stopPropagation(); }
    // Reaproveita a ação de 'Triagem' do menu
    this.toggleToAnnounce(attendee);
  }

  openPreCredenciamento(attendee: IAttendee, event?: Event) {
    if (event) { event.stopPropagation(); }
    if (attendee && attendee.preRegistered) {
      this.messageSrv.add({
        severity: 'info',
        summary: 'Pré-credenciamento',
        detail: `Participante pré-credenciado em ${attendee.preRegisteredDate}`
      });
    }
  }

  authorizeLocality(attendee: IAttendee) {
    this.selectAttendeeWithFilter(attendee, null, true);
    this.messageSrv.add({
      severity: 'info',
      summary: 'Localidade',
      detail: `Autorizando localidade para ${attendee.name}`
    });
  }

  ngAfterViewInit() {

    this.searchByName();
  }

  override async setActionBar() {
    await super.setActionBar();

    this.actionbarSrv.setItems([
      {
        position: 'LEFT',
        handle: () => this.showSelectMeeting = !this.showSelectMeeting,
        icon: 'change.svg',
      },
      {
        position: 'RIGHT',
        handle: () => this.router.navigate(['new-authority'], { relativeTo: this.thisRoute }),
        icon: 'user-plus-solid.svg',
        label: `Novo`
      },
      {
        position: 'RIGHT',
        handle: () => { },
        icon: 'user-solid.svg',
        label: `${this.totalCheckedIn} ${this.translate.instant('attendance.attendant')}`,
      },
      {
        position: 'RIGHT',
        handle: () => { },
        icon: 'preregister_phone.svg',
        label: `${this.totalPreRegistered} Pré-credenciados`
      }
    ]);
  }

  selectAttendeeWithFilter(attendee: IAttendee, evt: MouseEvent, isEdit?: boolean): Promise<void> {

    if (this.toAnnounceToggleElems.some(
      (el) => el.nativeElement.contains(evt.target)
    )) { return; }

    this.meetingSrv.getCanEditIsTeam().then(val => val ? this.form.get('isTeam').enable() : this.form.get('isTeam').disable());

    return super.selectAttendee(attendee, isEdit);
  }

  ngOnDestroy(): void {
    this.authTypeChangeSub.unsubscribe();
    if (this.valueChangeCPFSub !== null) {
      this.valueChangeCPFSub.unsubscribe();
    }
    this.actionbarSrv.setItems([]);
  }

  async saveEdit() {

    const {
      isPresent,
      isAuthority,
      isTeam,
      organization,
      role,
      toAnnounce,
      announced
    } = this.form.getRawValue();

    const { success, result } = await this.save();
    if (success) {
      const now = new Date();
      const timeZone = now.toString().split(' ')[5];

      const params: any = {
        meetingId: this.idMeeting,
        personId: this.selectedAttende?.personId,
        timeZone,
        isAuthority: isAuthority ?? false,
      };
      if (isAuthority) {
        params.isTeam = isTeam;
        params.organization = (typeof (organization) === 'string' ? { name: organization } : organization) as IOptionOrganization;
        params.role = role;
        params.toAnnounce = toAnnounce;
        params.announced = announced;
      }
      await this.meetingSrv.editCheckIn(params);
      if (!this.presentBefore && isPresent) {
        const newAttendee: IAttendee = {
          personId: result.id,
          checkInId: undefined,
          name: result.name,
          email: result.email,
          checkedIn: false,
          checkingIn: false,
          authName: result.authName,
          isAuthority,
          ...(isAuthority && {
            isTeam,
            organization: (typeof (organization) === 'string' ? { name: organization } : organization) as IOptionOrganization,
            role,
            toAnnounce,
            isAnnounced: announced ?? false,
          })
        };
        await this.checkIn(newAttendee, true);
      } else if (this.presentBefore && !isPresent) {
        await this.uncheckIn();

        this.cleanListAtendees();
        await this.setActionBar();
      }

      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.saveAccount')
      });
      this.toggleSelectedAttendee();
      this.searchByName();
    }
    return;
  }



  async checkIn(attendee: IAttendee, fromSaveAccount: boolean = false): Promise<void> {
    this.form.markAllAsTouched();

    attendee.checkingIn = true;

    if (!fromSaveAccount) {
      const { isAuthority, organization, role, isTeam } = this.form.controls;
      attendee.isAuthority = isAuthority.value;
      if (attendee.isAuthority) {
        attendee.isTeam = isTeam.value;
        attendee.organization = (typeof (organization.value) === 'string'
          ? { name: organization.value } : organization.value) as IOptionOrganization;
        attendee.role = role.value;
      } else {
        attendee.isTeam = null;
        attendee.organization = null;
        attendee.role = null;
      }
    }

    const now = new Date();
    const timeZone = now.toString().split(' ')[5];

    const params: any = {
      meetingId: this.idMeeting,
      personId: attendee.personId,
      timeZone,
      isAuthority: attendee.isAuthority ?? false,
    };

    if (attendee.isAuthority) {
      params.organization = attendee.organization;
      params.role = attendee.role;
      params.isTeam = attendee.isTeam;
      params.toAnnounce = attendee.toAnnounce;
      params.announced = attendee.isAnnounced;
    }

    const result = await this.meetingSrv.postCheckIn(params);

    if (result) {
      attendee.checkedIn = true;
      attendee.checkedInDate = result.time;
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.checkin', { name: result.meeting.name.toUpperCase() }),
        life: 10000
      });

      this.cleanListAtendees();
      await this.setActionBar();
    } else {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.failedToCheckIn')
      });
    }
    this.lastPage = true;
    attendee.checkingIn = false;
  }

  getAuthStatus(attendee: IAttendee): string {
    if (!attendee?.toAnnounce) {
      return 'screening';
    } else if (attendee?.toAnnounce && !attendee?.isAnnounced) {
      return 'announce';
    } else if (attendee?.isAnnounced) {
      return 'announced';
    } else { return undefined; }
  }

  getAuthIcon(attendee: IAttendee): IconDefinition {
    if (attendee.isAuthority && !attendee.toAnnounce) {
      return faIconScreening;
    } else if (attendee.toAnnounce && !attendee.isAnnounced) {
      return faBullhorn;
    } else if (attendee.isAuthority && attendee.isAnnounced) {
      return faIconAnnounced;
    } else { return undefined; }
  }

  getAuthLabel(attendee: IAttendee): string {
    if (!attendee?.toAnnounce) {
      return 'Triagem';
    } else if (attendee?.toAnnounce && !attendee?.isAnnounced) {
      return 'Autorizar';
    } else if (attendee?.isAnnounced) {
      return 'Anunciado';
    } else { return undefined; }
  }

  private isValidShortName(shortName: string | undefined): boolean {
    if (!shortName) return false;
    const trimmed = shortName.trim();
    if (!trimmed || trimmed === '-' || trimmed === '--' || trimmed === '.') return false;
    return true;
  }

  getOrganizationShortName(attendee: IAttendee): string {
    if (!attendee || !attendee.organization) return '';
    const org = attendee.organization;
    const orgList = this.meetingSrv.organizationList() || [];

    if (typeof org === 'object' && this.isValidShortName(org.shortName)) {
      return org.shortName.trim();
    }

    const found = this.findOrganization(org, orgList);
    if (found && this.isValidShortName(found.shortName)) {
      return found.shortName.trim();
    }

    const displayName = this.getOrganizationDisplay(attendee);
    let shortName = displayName.split(' - ')[0].trim();
    if (shortName.startsWith('-')) {
      shortName = shortName.substring(1).trim();
    }
    return shortName;
  }

  getOrganizationDisplay(attendee: IAttendee): string {
    const org = attendee?.organization;
    if (!org) return '';

    if (typeof org === 'object' && this.isValidShortName(org.shortName)) {
      return `${org.shortName.trim()} - ${org.name}`;
    }
    const orgList = this.meetingSrv.organizationList() || [];
    const found = this.findOrganization(org, orgList);

    if (found) {
      return this.formatOrganizationDisplay(found);
    }

    if (typeof org === 'object') {
      const sigla = org.shortName?.trim() || '';
      return this.isValidShortName(sigla) ? `${sigla} - ${org.name}` : (org.name || '');
    }

    let display = String(org).trim();
    if (display.startsWith('-')) {
      display = display.substring(1).trim();
    }
    return display;
  }

  private findOrganization(org: any, orgList: any[]): any | undefined {
    const searchVal = (typeof org === 'object' ? (org.guid || org.name || '') : org)
      .toString().trim().toLowerCase();

    if (!searchVal) return undefined;

    return orgList.find(o => {
      const name = o.name?.toLowerCase().trim();
      const short = o.shortName?.toLowerCase().trim();
      const guid = o.guid?.toLowerCase();

      return (guid === searchVal) ||
        (name === searchVal) ||
        (short === searchVal) ||
        (name && name.includes(searchVal)) ||
        (short && short.includes(searchVal) && searchVal.length < 10);
    });
  }

  private formatOrganizationDisplay(org: { name?: string; shortName?: string }): string {
    let displayName = org.name?.trim() || '';
    const sigla = org.shortName?.trim() || '';

    if (this.isValidShortName(sigla) && displayName.toUpperCase().endsWith(sigla.toUpperCase())) {
      const lastIndex = displayName.toUpperCase().lastIndexOf(sigla.toUpperCase());
      displayName = displayName.substring(0, lastIndex).trim();
      displayName = displayName.replace(/[\/\-\s]+$/, '').trim();
    }

    return this.isValidShortName(sigla) ? `${sigla} - ${displayName}` : displayName;
  }

  async uncheckIn() {
    const attendee = this.selectedAttende;
    const result = await this.meetingSrv.deleteCheckIn(this.idMeeting, attendee.personId);

    if (result) {
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.uncheckin')
      });
      this.listAttendees.splice(this.listAttendees.findIndex(att => att === attendee), 1);
      await this.setActionBar();
    } else {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.couldNotUncheck')
      });
    }
  }

  async toggleToAnnounce(attendee: IAttendee) {
    const {
      toAnnounce
    } = await this.authcSrv.toggleToAnnounce(attendee.checkInId);
    attendee.toAnnounce = toAnnounce;

    this.initializeMenu();

    this.searchByName();
  }

  executarComando(event: Event, item: any, menu: any) {
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }
    menu.hide();
  }

  handleSearchCounty({ query }) {
    // const result = await this.localitySrv.listAllByNameType(query, 1020);
    const search = this.toStandardText(query);
    this.resultSearchCounty = this.localities.filter(l => this.toStandardText(l.name).indexOf(search) !== -1);
  }

  toStandardText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  getTooltipRemoveText() {
    const name = this.form.value.name;
    if (!name) {
      return this.translate.instant('attendance.tooltipLabelUnchecking');
    }
    const names = name.trim().split(' ');
    const customName = names.length > 2 ? `${names[0]} ${names[names.length - 1]}` : names.join(' ');
    return this.translate.instant('attendance.tooltipLabelUnchecking') + customName;
  }

  onOrganizationSelected(event: any) {
    this.tempOrganization = event.value;
  }

  filterOrganization(evt: any) {
    const query = evt.query.toLowerCase();

    this.filteredOrganizations.set(this.meetingSrv.organizationList()
      .filter(org => org.name.toLowerCase().includes(query) || org.shortName.toLowerCase().includes(query)));
  }

  filterNames(evt: any) {
    const query = evt.query;

    const search: any = {
      name: query,
      size: 10,
      page: 0,
      sort: this.selectedOrderBy || 'nome',
      filterBy: this.tempFilterBy || 'pres',
      ...this.tempCounty ? { localities: this.tempCounty.id } : {},
      ...this.tempParticipante !== 'all' ? { tipoParticipante: this.tempParticipante } : {},
      ...this.tempFilterByStatus ? { filterByStatus: this.tempFilterByStatus } : {},
      ...(this.tempOrganization && this.tempOrganization.name?.trim().length > 0)
        ? { filterByOrganization: this.tempOrganization.name } : {},
    };

    this.meetingSrv.getListAttendees(this.idMeeting, { search }).then(res => {
      if (res && res.content) {
        const names = res.content.map(att => att.name).filter(Boolean);
        this.filteredNames.set([...new Set(names)]);
      } else {
        this.filteredNames.set([]);
      }
    }).catch(err => {
      console.error('filterNames error:', err);
      this.filteredNames.set([]);
    });
  }

  markAuthorityTouched() {
    this.form.get('isAuthority').markAsTouched();
    this.form.get('organization').markAsTouched();
    this.form.get('role').markAsTouched();
  }

  async loadACRole(event: any) {
    if (!event.checked) {
      this.form.get('organization').patchValue(null);
      this.form.get('role').patchValue(null);
      this.form.get('toAnnounce').patchValue(false);
      this.form.get('announced').patchValue(false);
    }
  }

  isScrolled = false;
  showFilters = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  closeFilterModal() {
    this.showFilters = false;
  }

  openFilterModal() {
    this.showFilters = true;
    this.tempParticipante = this.selectedParticipante;
    this.tempFilterBy = this.selectedFilterBy;
    this.tempFilterByStatus = this.selectedFilterByStatus;
    this.tempOrganization = this.selectedOrganization;
    this.tempNameSearch = this.nameSearch;
    this.tempCounty = this.selectedCounty;
    this.selectedOrderBy = this.selectedOrderBy;
  }

  resetFilters() {
    this.selectedParticipante = 'all';
    this.selectedFilterBy = 'prereg';
    this.selectedFilterByStatus = 'all';
    this.selectedOrganization = undefined;
    this.nameSearch = '';
    this.selectedCounty = undefined;
    this.selectedOrderBy = 'nome';

    this.tempParticipante = 'all';
    this.tempFilterBy = 'prereg';
    this.tempFilterByStatus = 'all';
    this.tempOrganization = undefined;
    this.tempNameSearch = '';
    this.tempCounty = undefined;

    this.searchByName();
  }

  filtrar(event?: any) {
    if (event) {
      event.preventDefault();
    }
    this.selectedParticipante = this.tempParticipante;
    this.selectedFilterBy = this.tempFilterBy;
    this.selectedFilterByStatus = this.tempFilterByStatus;
    this.selectedOrganization = this.tempOrganization;
    this.nameSearch = this.tempNameSearch;
    this.selectedCounty = this.tempCounty;
    this.selectedOrderBy = this.selectedOrderBy;

    this.searchByName();
  }

  removeFilter(key: string) {
    if (key === 'participante') {
      this.selectedParticipante = 'all';
      this.tempParticipante = 'all';
    } else if (key === 'filterBy') {
      this.selectedFilterBy = 'pres';
      this.tempFilterBy = 'pres';
    } else if (key === 'filterByStatus') {
      this.selectedFilterByStatus = 'all';
      this.tempFilterByStatus = 'all';
    } else if (key === 'organization') {
      this.selectedOrganization = undefined;
      this.tempOrganization = undefined;
    } else if (key === 'nameSearch') {
      this.nameSearch = '';
      this.tempNameSearch = '';
    } else if (key === 'county') {
      this.selectedCounty = undefined;
      this.tempCounty = undefined;
    }
    this.searchByName();
  }

  get activeFilters(): any[] {
    const tags: any[] = [];

    if (this.selectedOrderBy) {
      const found = this.optionsOrderBy.find(opt => opt.value === this.selectedOrderBy);
      if (found) {
        tags.push({
          key: 'ordenar',
          label: 'Ordenar',
          displayValue: [{ name: "Ordenado por: " + found.label }]
        });
      }
    }

    if (this.selectedParticipante && this.selectedParticipante !== 'all') {
      const found = this.optionsParticipantes.find(opt => opt.value === this.selectedParticipante);
      if (found) {
        tags.push({
          key: 'participante',
          label: 'Participante',
          displayValue: [{ name: found.label }]
        });
      }
    }

    if (this.selectedFilterBy) {
      const found = this.optionsFilterBy.find(opt => opt.value === this.selectedFilterBy);
      if (found) {
        tags.push({
          key: 'filterBy',
          label: 'Presença',
          displayValue: [{ name: found.label }]
        });
      }
    }

    if (this.selectedFilterByStatus && this.selectedFilterByStatus !== 'all') {
      const found = this.optionsFilterByStatus.find(opt => opt.value === this.selectedFilterByStatus);
      if (found) {
        tags.push({
          key: 'filterByStatus',
          label: 'Nominata',
          displayValue: [{ name: found.label }]
        });
      }
    }

    if (this.selectedOrganization && this.selectedOrganization.name?.trim().length > 0) {
      tags.push({
        key: 'organization',
        label: 'Organização',
        displayValue: [{ name: this.selectedOrganization.name }]
      });
    }

    if (this.nameSearch && this.nameSearch.trim().length > 0) {
      tags.push({
        key: 'nameSearch',
        label: 'Busca',
        displayValue: [{ name: this.nameSearch }]
      });
    }

    if (this.selectedCounty) {
      tags.push({
        key: 'county',
        label: 'Município',
        displayValue: [{ name: this.selectedCounty.name }]
      });
    }

    return tags;
  }

}
