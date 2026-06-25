import { AfterViewInit, Component, ElementRef, Inject, Injector, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, SelectItem } from 'primeng/api';
import { faCheckCircle, faCircle, faIdBadge } from '@fortawesome/free-regular-svg-icons';
import {
  faBullhorn,
  faCheck,
  faHourglass,
  faHourglassStart,
  faLayerGroup,
  faQrcode,
  faSearch,
  faSpinner,
  faTimes,
  faUserTie,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

import { AttendanceModel } from '@app/shared/models/AttendanceModel';
import { LocalityService } from '@app/shared/services/locality.service';
import { AuthService } from '@app/shared/services/auth.service';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';
import { IOptionOrganization } from '@app/shared/interface/IOptionOrganization';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { PersonsListItems } from '@app/shared/services/person.service';
import { PreRegistrationService } from '@app/shared/services/pre-registration.service';
import { RequestStatus } from '@app/shared/interface/IRequestStataus';

@Component({
  selector: 'app-edit',
  templateUrl: './new-authority.component.html',
  styleUrls: ['./new-authority.component.scss']
})
export class NewAuthorityComponent extends AttendanceModel implements OnInit, OnDestroy, AfterViewInit {

  iconSearch = faSearch;

  filteredOrganizations = signal(this.meetingSrv.organizationList());
  filteredNames = signal<PersonsListItems[]>([]);
  selectedName: PersonsListItems = undefined;


  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  idPrecredential: number;
  isLoadingNames = false;

  requestStatus: { status: string } = { status: RequestStatus.EMPTY };

  faLayerGroup = faLayerGroup;
  faSpinner = faSpinner

  constructor(
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: UntypedFormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector,
    private authcSrv: AuthorityCredentialService,
    private preRegistrationSrv: PreRegistrationService,
  ) {
    super(injector, true);
  }

  ngOnInit() {
    this.form.addControl("keepConfirmation", new FormControl(true));
  }

  async applyValue(evt: PersonsListItems) {
    this.selectedName = evt;
    if (evt)
      this.form.controls.role.setValue(evt.role + ' - ' + evt.lotacao);
    else
      this.form.controls.role.setValue(undefined);

    this.personSrv.findPersonBySub(this.form.controls.name.value.sub).then(
      async person => {
        this.idPrecredential = (await this.preRegistrationSrv.preRegistrationConfirmed(this.idMeeting, person.id))?.id
      }
    ).catch(e => this.idPrecredential = undefined);
  }

  ngAfterViewInit() {

    this.form.controls.name.valueChanges.subscribe((nValor: PersonsListItems) => {
      this.form.get('role').patchValue(nValor?.role);
    });

    this.searchByName();
  }

  override async setCurrentMeeting(): Promise<void> {
    await super.setCurrentMeeting();
    this.breadcrumbSrv.setItems([
      { label: 'attendance.label' },
      {
        label: `Nova Autoridade`,
        routerLink: [`/attendance/edit/new-authority`]
      },
    ])
  }


  ngOnDestroy(): void {

    this.actionbarSrv.setItems([]);
  }

  async saveEdit() {

    const {
      organization,
      name,
      keepConfirmation
    } = this.form.value as {
      organization: IOptionOrganization,
      name: PersonsListItems,
      keepConfirmation: boolean
    };

    if (!this.idPrecredential || !keepConfirmation) {
      if (!this.idPrecredential) {
        await this.authcSrv.registerAuthority(
          this.authSrv.getUserInfo.id,
          "",
          undefined,
          name.name,
          undefined,
          this.idMeeting,
          organization,
          name.role + ' - ' + name.lotacao,
          name.sub,
          true
        );

        this.messageSrv.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Pré-credenciamento Concluido com sucesso!',
          life: 3000
        });
      } else {
        const deleteObj = {
          meetingId: this.idMeeting,
          madeBy: this.authSrv.getUserInfo.id,
          representedByCpf: '',
          representedBySub: name.sub,
          representedByEmail: undefined,
          representedByName: name.name

        };

        await this.authcSrv.deleteCredential(deleteObj);
        this.messageSrv.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Pré-credenciamento removido com sucesso!',
          life: 3000
        });
      }

    }

    this.toggleSelectedAttendee();

  }



  toStandardText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }


  loadNames(evt: AutoCompleteSelectEvent) {
    const { value } = evt as { value: IOptionOrganization };
    this.isLoadingNames = true;

    this.personSrv.findPersonsOrganization(value.guid).then(names => {
      this.personSrv.allNames = names;
    }).finally(() => {
      this.selectedName = undefined;
      this.form.controls.name.patchValue(undefined);
      this.form.controls.name.markAsPristine();
      this.form.controls.name.markAsUntouched();
      this.isLoadingNames = false;
    });

  }

  filterNames(autoComplete?: AutoComplete) {

    const search = clean(this.form.controls.name.value?.toLowerCase().trim()) ?? '';

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
      setTimeout(() => {
        autoComplete.show();
        this.form.controls.role.patchValue(undefined);
      });
    }
  }
  override toggleSelectedAttendee() {
    super.toggleSelectedAttendee();
    this.selectedName = undefined;
    this.idPrecredential = undefined;
    this.router.navigate(['..'], { relativeTo: this.thisRoute })
  }

  enterKey(autoComplete?: AutoComplete) {
    const activeElement = document.activeElement;

    if (activeElement && activeElement instanceof HTMLInputElement) {
      switch ((activeElement as HTMLInputElement).getAttribute('formControlName')) {
        case 'organization':
          if (this.filteredOrganizations().length === 1){
            this.selectedOrganization = this.filteredOrganizations[0];
          }
          break;
        case 'name': this.filterNames(autoComplete);
      }
    }
  }

  onTyping() {
    this.filteredNames.set(this.filteredNames());
  }

  filterOrganization(evt: any) {
    const query = evt.query.toLowerCase();

    this.requestStatus.status = RequestStatus.LOADING;

    setTimeout(() => {
      let filtered = this.meetingSrv.organizationList()
        .filter(org => org.name.toLowerCase().includes(query) || org.shortName.toLowerCase().includes(query));

      this.filteredOrganizations.set(filtered);
      this.requestStatus.status = RequestStatus.SUCCESS;
    }, 200);
  }

}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clean(text: string): string {
  return text
    ?.toLowerCase()
    .normalize('NFD')                 // separa acentos
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9]/g, '');       // remove tudo que não é alfanumérico
}
