import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
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
import {takeUntil} from 'rxjs/operators';
import {RadioButton} from 'primeng/radiobutton';

@Component({
  selector: 'app-edit',
  templateUrl: './new-authority.component.html',
  styleUrls: ['./new-authority.component.scss']
})
export class NewAuthorityComponent extends AttendanceModel implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('inOrganizacao') inOrganizacao: AutoComplete;
  @ViewChild('inRadioKeepTrue') inRadioKeepTrue: RadioButton;

  iconSearch = faSearch;
  private destroy$: Subject<void> = new Subject<void>();

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
    this.form.addControl('keepConfirmation', new FormControl(true));
  }

  async applyValue(evt: PersonsListItems, btnSalvar?: HTMLButtonElement) {
    this.selectedName = evt;
    if (evt)
      this.form.controls.role.setValue(evt.role + ' - ' + evt.lotacao);
    else
      this.form.controls.role.setValue(undefined);

    btnSalvar.focus();

    this.personSrv.findPersonBySub(this.form.controls.name.value.sub).then(
      async person => {
        this.idPrecredential = (await this.preRegistrationSrv.preRegistrationConfirmed(this.idMeeting, person.id))?.id
        if(this.idPrecredential) this.inRadioKeepTrue.focus();
      }
    ).catch(e => this.idPrecredential = undefined);
  }

  ngAfterViewInit() {

    this.form.controls.name.valueChanges.subscribe((nValor: PersonsListItems) => {
      this.form.get('role').patchValue(nValor?.role);
    });

    this.searchByName();

    this.inOrganizacao.inputEL.nativeElement.focus();
  }

  override async setCurrentMeeting(): Promise<void> {
    await super.setCurrentMeeting();
    this.breadcrumbSrv.setItems([
      { label: 'attendance.label' },
      {
        label: `Adicionar a Equipe de Governo`,
        routerLink: [`/attendance/edit/new-authority`]
      },
    ]);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.actionbarSrv.setItems([]);
  }

  async saveEdit() {

    const {
      organization,
      name,
      role,
      keepConfirmation
    } = this.form.value as {
      organization: IOptionOrganization | string,
      name: PersonsListItems,
      role: string,
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
          (typeof(organization) === 'string') ? {name: organization} as IOptionOrganization : organization,
          role,
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

  handleEnterOrg(event: any, inOrg: AutoComplete, inName: AutoComplete) {
    const suggestions = this.filteredOrganizations();

    if (suggestions && suggestions.length > 0) {
      const firstItem = suggestions[0];

      // Atualiza o valor do formControl
      this.form.patchValue({ organization: firstItem });

      // Dispara a lógica de carga
      this.loadNames(firstItem);

      // Opcional: esconde o painel de sugestões
      inOrg.hide();

      inName.inputEL.nativeElement.focus();

      event.preventDefault();
    }
  }

  handleEnterName(event: any, inName: AutoComplete, inRole: HTMLInputElement) {
    const suggestions = this.filteredNames();

    if (suggestions && suggestions.length > 0) {
      const firstItem = suggestions[0];

      // Atualiza o valor do formControl
      this.form.patchValue({ name: firstItem });

      // Dispara a lógica de carga
      this.applyValue(firstItem);

      // Opcional: esconde o painel de sugestões
      inName.hide();

      inRole.focus();

      event.preventDefault();
    }
  }

  loadNames(value: IOptionOrganization) {
    this.isLoadingNames = true;

    this.personSrv.findPersonsOrganizationV2(value.guid)
      .pipe(takeUntil(this.destroy$))
      .subscribe( names => {
        this.personSrv.allNames = names.result;
        this.selectedName = undefined;
        this.form.controls.name.patchValue(undefined);
        this.form.controls.name.markAsPristine();
        this.form.controls.name.markAsUntouched();
        this.isLoadingNames = names.loading;
      }, (error) => {
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
    this.selectedName = undefined;
    this.idPrecredential = undefined;
    this.form.controls.role.patchValue(undefined);
    this.inOrganizacao.inputEL.nativeElement.focus();
    this.router.navigate(['..'], {relativeTo: this.thisRoute});
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
        .map(organization => ({...organization, label: organization.shortName + ' - ' + organization.name}))
        .filter(org => org.name.toLowerCase().includes(query) || org.shortName.toLowerCase().includes(query));

      this.filteredOrganizations.set(filtered);
      this.requestStatus.status = RequestStatus.SUCCESS;
    }, 200);
  }

  protected readonly event = event;
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
