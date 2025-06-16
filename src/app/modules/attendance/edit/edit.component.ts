import {AfterViewInit, Component, ElementRef, Inject, Injector, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MessageService, SelectItem} from 'primeng/api';
import {faCheckCircle, faCircle} from '@fortawesome/free-regular-svg-icons';
import {faBullhorn, faCheck, faHourglass, faHourglassStart, faQrcode, faTimes, faUserTie, IconDefinition} from '@fortawesome/free-solid-svg-icons';

import {AttendanceModel, AuthTypeEnum} from '@app/shared/models/AttendanceModel';
import {Locality} from '@app/shared/models/locality';
import {LocalityService} from '@app/shared/services/locality.service';
import {AuthService} from '@app/shared/services/auth.service';
import { IAttendee } from '@app/shared/interface/IAttendee';
import { faIconAllowAnnounce, faIconAnnounced, faIconScreening } from '@app/shared/util/CustomIconDefenition';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AttendanceModel implements OnInit, OnDestroy {

  @ViewChildren('toAnnounceToggle', {read: ElementRef}) toAnnounceToggleElems! : QueryList<ElementRef>;

  iconChecked = faCheckCircle;
  iconCircle = faCircle;
  iconRemove = faTimes;
  iconAuthority = faUserTie;
  iconToAnnounce = faBullhorn;
  iconScreening = faHourglass;
  iconAnnounced = faIconAnnounced;
  iconAllowAnnouce = faIconAllowAnnounce;


  // iconPreRegister = faQrcode;
  optionsOrderBy: SelectItem[] = [
    {label: 'name', value: 'name'},
    {label: 'attendance.arrival', value: 'checkedInDate'},
    {label: 'attendance.status', value: 'status'},
  ];
  resultSearchCounty: Locality[];

  optionsFilterBy: SelectItem[] = [
    {label: 'Presentes', value: 'pres'},
    {label: 'Pré-credenciados', value: 'prereg'},
    {label: 'Pré-credenciados e Presentes', value: 'prereg_pres'},
    {label: 'Pré-credenciados e Ausentes', value: 'prereg_notpres'},
    {label: 'Presentes não Pré-credenciados', value: 'notprereg_pres'},
  ]

  optionsFilterByIsAuthority: SelectItem[] = [
    {label: 'Representantes ou não', value: 'all'},
    {label: 'Apenas representantes', value: true},
    {label: 'Exceto representantes', value: false}
  ]

  optionsFilterByStatus: SelectItem[] = [
    // value = [toAnnounce, announced]
    {label: 'Todos', value: 'all'},
    {label: 'Em Triagem', value: 'screening'},
    {label: 'Anunciar', value: 'toAnnounce'},
    {label: 'Anunciado', value: 'announced'}
  ]

  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  constructor(
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: UntypedFormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector,
    private authcSrv : AuthorityCredentialService
  ) {
    super(injector, true);
  }

  ngOnInit(): void {
    this.authTypeChangeSub = this.form.controls.authType.valueChanges.subscribe(change => this.handleChangeAuthType(change));
    this.handleChangeAuthType(AuthTypeEnum.CPF);
    
    this.form.get('toAnnounce').valueChanges.subscribe(
      value => {
        if(!value) {
          this.form.get('announced').patchValue(false);
        }
      }
    );
    
    this.form.get('announced').valueChanges.subscribe(
      value => {
        if(value) {
          this.form.get('toAnnounce').patchValue(true);
        }
      }
    );

    setTimeout( () => {
      this.searchByName();
    }, 300)
  }

  selectAttendeeWithFilter(attendee: IAttendee, evt: MouseEvent, isEdit?: boolean): Promise<void> {
      
    if(this.toAnnounceToggleElems.some(
      (el) => el.nativeElement.contains(evt.target)
    ) ) return;

    return super.selectAttendee(attendee, isEdit)
  }

  ngOnDestroy(): void {
    this.authTypeChangeSub.unsubscribe();
    if (this.valueChangeCPFSub !== null) {
      this.valueChangeCPFSub.unsubscribe();
    }
    this.actionbarSrv.setItems([]);
  }

  async saveEdit() {
    const isAuthority: boolean = this.form.get('isAuthority')?.value;
    const organization: string = this.form.get('organization')?.value;
    const role: string = this.form.get('role')?.value;
    const toAnnounce: boolean = this.form.get('toAnnounce').value;
    const announced: boolean = this.form.get('announced').value;
    const {success} = await this.save();
    if (success) {
      if (this.authorityTouched) {
        var now = new Date();
        var timeZone = now.toString().split(' ')[5];
  
        const params: any = {
          meetingId: this.idMeeting,
          personId: this.selectedAttende?.personId,
          timeZone,
          isAuthority: isAuthority ?? false,
        };
        if(isAuthority){
          params.organization = organization;
          params.role = role;
          params.toAnnounce = toAnnounce;
          params.announced = announced;
        }
        await this.meetingSrv.editCheckIn(params);
      }

      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.saveAccount')
      });
      this.toggleSelectedAttendee();
      this.searchByName()
    }
    return;
  }

  getAuthStatus(attendee : IAttendee) : string {
    if(attendee.isAuthority && !attendee.toAnnounce) {
      return 'screening';
    } else if(attendee.toAnnounce && !attendee.isAnnounced) {
      return 'announce'
    } else if(attendee.isAuthority && attendee.isAnnounced) {
      return 'announced'
    } else return undefined
  }

  getAuthIcon(attendee : IAttendee) : IconDefinition {
    if(attendee.isAuthority && !attendee.toAnnounce) {
      return faIconScreening;
    } else if(attendee.toAnnounce && !attendee.isAnnounced) {
      return faBullhorn
    } else if(attendee.isAuthority && attendee.isAnnounced) {
      return faIconAnnounced
    } else return undefined
  }

  getAuthLabel(attendee : IAttendee) : string {
    if(attendee.isAuthority && !attendee.toAnnounce) {
      return 'Triagem';
    } else if(attendee.toAnnounce && !attendee.isAnnounced) {
      return 'Anunciar';
    } else if(attendee.isAuthority && attendee.isAnnounced) {
      return 'Anunciado';
    } else return undefined;
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
      this.toggleSelectedAttendee();
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
}
