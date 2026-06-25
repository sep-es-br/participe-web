import { AfterViewInit, Component, ElementRef, Inject, Injector, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { faCheckCircle, faCircle, faIdBadge } from '@fortawesome/free-regular-svg-icons';
import { faBullhorn, faCheck, faEllipsisV, faHourglass, faHourglassStart, faQrcode, faSitemap, faTimes, faUserCheck, faUserTie, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { AttendanceModel, AuthTypeEnum } from '@app/shared/models/AttendanceModel';
import { Locality } from '@app/shared/models/locality';
import { LocalityService } from '@app/shared/services/locality.service';
import { AuthService } from '@app/shared/services/auth.service';
import { IAttendee } from '@app/shared/interface/IAttendee';
import { faIconAllowAnnounce, faIconAnnounced, faIconScreening } from '@app/shared/util/CustomIconDefenition';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';
import { ParticipationService } from '@app/shared/services/participation.service';
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
    { label: 'name', value: 'name' },
    { label: 'attendance.arrival', value: 'checkedInDate' },
    { label: 'attendance.participationType', value: 'participationType' },
    { label: 'attendance.credentialPresence', value: 'credentialPresence' },
    { label: 'attendance.namingStatus', value: 'namingStatus' },
    { label: 'attendance.organization', value: 'organization' },
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



  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  constructor(
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: UntypedFormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector,
    private authcSrv: AuthorityCredentialService
  ) {
    super(injector, true);
  }

  ngOnInit(): void {
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

  getOrganizationShortName(attendee: IAttendee): string {
    if (!attendee || !attendee.organization) return '';
    const org = attendee.organization;
    const orgList = this.meetingSrv.organizationList() || [];

    if (typeof org === 'object' && org.shortName?.trim()) {
      return org.shortName;
    }

    const found = this.findOrganization(org, orgList);
    if (found && found.shortName?.trim()) {
      return found.shortName;
    }

    const displayName = this.getOrganizationDisplay(attendee);
    return displayName.split(' - ')[0].trim();
  }

  getOrganizationDisplay(attendee: IAttendee): string {
    const org = attendee?.organization;
    if (!org) return '';

    if (typeof org === 'object' && org.shortName?.trim()) {
      return `${org.shortName} - ${org.name}`;
    }
    const orgList = this.meetingSrv.organizationList() || [];
    const found = this.findOrganization(org, orgList);

    if (found) {
      return this.formatOrganizationDisplay(found);
    }

    if (typeof org === 'object') {
      return org.shortName ? `${org.shortName} - ${org.name}` : (org.name || '');
    }

    return String(org);
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
        (name && searchVal.includes(name)) ||
        (short && searchVal.includes(short) && searchVal.length < 10);
    });
  }

  private formatOrganizationDisplay(org: { name?: string; shortName?: string }): string {
    let displayName = org.name || '';
    const sigla = org.shortName || '';

    if (sigla && displayName.toUpperCase().endsWith(sigla.toUpperCase())) {
      const lastIndex = displayName.toUpperCase().lastIndexOf(sigla.toUpperCase());
      displayName = displayName.substring(0, lastIndex).trim();
      displayName = displayName.replace(/[\/\-\s]+$/, '').trim();
    }

    return sigla ? `${sigla} - ${displayName}` : displayName;
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
    this.selectedOrganization = event.value;
    this.searchByName();
  }

  filterOrganization(evt: any) {
    const query = evt.query.toLowerCase();

    this.filteredOrganizations.set(this.meetingSrv.organizationList()
      .filter(org => org.name.toLowerCase().includes(query) || org.shortName.toLowerCase().includes(query)));
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

}
