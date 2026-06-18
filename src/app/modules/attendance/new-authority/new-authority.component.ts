import {AfterViewInit, Component, ElementRef, Inject, Injector, OnDestroy, OnInit, QueryList, signal, ViewChildren} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MessageService, SelectItem} from 'primeng/api';
import {faCheckCircle, faCircle, faIdBadge} from '@fortawesome/free-regular-svg-icons';
import {
  faBullhorn,
  faCheck,
  faHourglass,
  faHourglassStart,
  faQrcode,
  faSearch,
  faTimes,
  faUserTie,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

import {AttendanceModel, AuthTypeEnum} from '@app/shared/models/AttendanceModel';
import {Locality} from '@app/shared/models/locality';
import {LocalityService} from '@app/shared/services/locality.service';
import {AuthService} from '@app/shared/services/auth.service';
import { IAttendee } from '@app/shared/interface/IAttendee';
import { faIconAllowAnnounce, faIconAnnounced, faIconScreening } from '@app/shared/util/CustomIconDefenition';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';
import {ParticipationService} from '@app/shared/services/participation.service';
import {IOptionOrganization} from '@app/shared/interface/IOptionOrganization';
import {AutoComplete, AutoCompleteSelectEvent} from 'primeng/autocomplete';
import {PersonsListItems} from '@app/shared/services/person.service';

@Component({
  selector: 'app-edit',
  templateUrl: './new-authority.component.html',
  styleUrls: ['./new-authority.component.scss']
})
export class NewAuthorityComponent extends AttendanceModel implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('toAnnounceToggle', {read: ElementRef}) toAnnounceToggleElems!: QueryList<ElementRef>;

  iconSearch = faSearch;

// Nome, Ordem de Chegada, Tipo de Participante, Credenciamento e Presença, Situação da nominata, órgão
  // iconPreRegister = faQrcode;
  optionsOrderBy: SelectItem[] = [
    {label: 'name', value: 'name'},
    {label: 'attendance.arrival', value: 'checkedInDate'},
    {label: 'attendance.participationType', value: 'participationType'},
    {label: 'attendance.credentialPresence', value: 'credentialPresence'},
    {label: 'attendance.namingStatus', value: 'namingStatus'},
    {label: 'attendance.organization', value: 'organization'},
  ];
  resultSearchCounty: Locality[];

  optionsParticipantes: SelectItem[] = [
    {label: 'Todos', value: 'all'},
    {label: 'Representantes', value: 'repr'},
    {label: 'Representantes não equipe de governo', value: 'repr-not-equipe'},
    {label: 'Representantes equipe de governo', value: 'repr-equipe'},
    {label: 'Público', value: 'pub'}
  ];

  optionsFilterBy: SelectItem[] = [
    {label: 'Presentes', value: 'pres'},
    {label: 'Pré-credenciados', value: 'prereg'},
    {label: 'Pré-credenciados presentes', value: 'prereg_pres'},
    {label: 'Pré-credenciados ausentes', value: 'prereg_notpres'},
    {label: 'Presentes não pré-credenciados', value: 'notprereg_pres'},
  ];
  optionsFilterByStatus: SelectItem[] = [
    // value = [toAnnounce, announced]
    {label: 'Todos', value: 'all'},
    {label: 'Em Triagem', value: 'screening'},
    {label: 'Anunciar', value: 'toAnnounce'},
    {label: 'Anunciado', value: 'announced'}
  ];

  filteredOrganizations = signal(this.meetingSrv.organizationList()) ;
  filteredNames = signal<PersonsListItems[]>([]) ;


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

  ngOnInit() {
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

  }

  ngAfterViewInit() {


    this.searchByName();
  }

  selectAttendeeWithFilter(attendee: IAttendee, evt: MouseEvent, isEdit?: boolean): Promise<void> {

    if (this.toAnnounceToggleElems.some(
      (el) => el.nativeElement.contains(evt.target)
    ) ) { return; }

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
    } = this.form.value;

    const {success, result} = await this.save();
    if (success) {
      if (this.authorityTouched) {
        const now = new Date();
        const timeZone = now.toString().split(' ')[5];

        const params: any = {
          meetingId: this.idMeeting,
          personId: this.selectedAttende?.personId,
          timeZone,
          isAuthority: isAuthority ?? false,
        };
        if (isAuthority){
          params.isTeam = isTeam;
          params.organization = (typeof(organization) === 'string' ? {name: organization} : organization) as IOptionOrganization;
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
              organization: (typeof(organization) === 'string' ? {name: organization} : organization) as IOptionOrganization,
              role
            })
          };
          await this.checkIn(newAttendee, true);
        } else if (this.presentBefore && !isPresent) {
          await this.uncheckIn();

          this.cleanListAtendees();
          await this.setActionBar();
        }
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



  async checkIn(attendee: IAttendee, fromSaveAccount: boolean = false ) {
    this.form.markAllAsTouched();

    attendee.checkingIn = true;

    if (!fromSaveAccount){
      const { isAuthority, organization, role, isTeam } = this.form.controls;
      attendee.isAuthority = isAuthority.value;
      if (attendee.isAuthority) {
        attendee.isTeam = isTeam.value;
        attendee.organization = organization.value;
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
    }

    const result = await this.meetingSrv.postCheckIn(params);

    if (result) {
      attendee.checkedIn = true;
      attendee.checkedInDate = result.time;
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.checkin', {name: result.meeting.name.toUpperCase()}),
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
    if (attendee.isAuthority && !attendee.toAnnounce) {
      return 'screening';
    } else if (attendee.toAnnounce && !attendee.isAnnounced) {
      return 'announce';
    } else if (attendee.isAuthority && attendee.isAnnounced) {
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
    if (attendee.isAuthority && !attendee.toAnnounce) {
      return 'Triagem';
    } else if (attendee.toAnnounce && !attendee.isAnnounced) {
      return 'Anunciar';
    } else if (attendee.isAuthority && attendee.isAnnounced) {
      return 'Anunciado';
    } else { return undefined; }
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
      this.searchByName();

  }

  handleSearchCounty({query}) {
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

  loadNames(evt: AutoCompleteSelectEvent){
    const {value} = evt as {value: IOptionOrganization};

    this.personSrv.findPersonsOrganization(value.guid).then(names => this.personSrv.allNames = names);

  }

  filterNames(autoComplete?: AutoComplete) {
    const search = clean(this.form.controls['name'].value.toLowerCase().trim()) ?? '';

    const regex = new RegExp(
      search
        .split(/\s+/)
        .filter(Boolean)
        .map(escapeRegExp)
        .join('.*'),
      'i'
    );

    this.filteredNames.set(
      this.personSrv.allNames.filter(person =>
        regex.test(clean(person.name)) // ou person.label, depende do teu modelo
      )
    );

    if (autoComplete) {
      setTimeout(() => autoComplete.show());
    }
  }

  onTyping() {
    this.filteredNames.set(this.filteredNames())
  }

  filterOrganization(evt: any) {
    const query = evt.query.toLowerCase();


    this.filteredOrganizations.set(this.meetingSrv.organizationList()
      .filter(org => org.name.toLowerCase().includes(query) || org.shortName.toLowerCase().includes(query)));

  }

}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clean(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                 // separa acentos
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9]/g, '');       // remove tudo que não é alfanumérico
}
