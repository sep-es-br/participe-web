import * as _ from 'lodash';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';

import { ActionBarService } from '@app/core/actionbar/app.actionbar.actions.service';
import { AuthService } from '@app/shared/services/auth.service';
import { BasePageList } from '@app/shared/base/base.pagelist';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { CitizenAuthenticationModel } from '@app/shared/models/CitizenAuthenticationModel';
import { CitizenFilterModel } from '@app/shared/models/CitizenFilterModel';
import { CitizenModel } from '@app/shared/models/CitizenModel';
import { CitizenSenderModel } from '@app/shared/models/CitizenSenderModel';
import { CitizenService } from '@app/shared/services/citizen.service';
import { Conference } from '@app/shared/models/conference';
import { CustomValidators } from '@app/shared/util/CustomValidators';
import { HelperUtils } from '@app/shared/util/HelpersUtil';
import { ITableCol } from '@app/shared/interface/ITableCol';
import { ModerationService } from '@app/shared/services/moderation.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LocalityService } from '@app/shared/services/locality.service';
import { StoreKeys } from '@app/shared/constants';
import { Router } from '@angular/router';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-citizen',
  templateUrl: './citizen.component.html',
  styleUrls: ['./citizen.component.scss']
})
export class CitizenComponent extends BasePageList<CitizenModel> implements OnInit, OnDestroy {

  allConference: Conference = new Conference();
  formEdit: boolean = false;
  citizenForm: UntypedFormGroup;
  localities: SelectItem[] = [];
  filteredLocalities: SelectItem[] = [];
  authentications: SelectItem[] = [];
  loading: boolean = false;
  idCitizen: number = 0;
  authenticationsCitizen: CitizenAuthenticationModel[] = [];
  authName:string[];
  labelLocality: string;
  status: SelectItem[] = [
    { value: '', label: 'Todos' },
    { value: true, label: 'Ativo' },
    { value: false, label: 'Inativo' }];
  pageSizeOptions: number[] = [
    10 ,
    20 ,
    30 ,
    50 ,
    100 ,
    500 ,
  ];
  showSelectConference: boolean = false;
  conferencesActives: Conference[] = [];
  conferenceSelect: Conference = new Conference();
  sort: string = "apoc.text.clean(name)";
  search: any = { status: '', autentication: ''};
  dataSearch: any = { status: '', autentication: ''};
  selectedLocalities: [];
  typeAuthentication: string = 'mail';
  passwordValidators = [Validators.required, CustomValidators.AttendeeCitizenPassword];
  mailValidators = [ Validators.required, Validators.email ];
  cpfValidators = [ Validators.required, Validators.maxLength(11), CustomValidators.ValidateCPF ];
  cols: ITableCol[] = [
    {
      field: 'autentication', header: 'citizen.authentication', styleClass: 'col-authentication', handleView: (value, row) => {
        let container = '';
        row.autenticationIcon.filter(a => a.acesses > 0).forEach(({ loginName }) => {
          container += `<img class="authentication-icon" title="${loginName}" src="${this.authSrv.getAuthenticationIcon(loginName)}"  alt=""/>`;
        });
        return container;
      }
    },
    { field: 'name', header: 'citizen.name', sorteable: true },
    { field: 'email', header: 'citizen.mail', sorteable: true },
    { field: 'localityName', header: 'citizen.locality', sorteable: false },
    { field: 'conferencesName', header: 'citizen.conferencia', handleView: (value, row) => {
      return !!row.conferencesName ? row.conferencesName.join('\n') : '';
    } },
    {
      field: 'autentication', header: 'citizen.attendance_count', styleClass: 'col-attendance_count', handleView: (value, row) => {
        return row.autentication.reduce((accumulate, auth) => (accumulate + auth.acesses), 0);
      }
    },
  ];
  pageState: PaginatorState;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private citizenSrv: CitizenService,
    private translateSrv: TranslateService,
    public authSrv: AuthService,
    private moderationSrv: ModerationService,
    private actionbarSrv: ActionBarService,
    public localitySrv: LocalityService,
    private router: Router
  ) {
    super(citizenSrv);
    this.pageState = {
      first: 0,
      page: 0,
      rows: 10,
   }
    this.allConference.id = null;
    this.allConference.name = 'Todas as Audiências Públicas';
  }

  ngOnDestroy(): void {
    this.actionbarSrv.setItems([]);
  }

  async ngOnInit() {
    this.setForm({});
    this.authentications = this.authSrv.providers.map(p => ({label: p.label, value: p.tag}));
    this.authentications.unshift({label: 'Todos', value: '' })
    await this.prepareScreen();
  }

  configureActionBar() {
    this.actionbarSrv.setItems([
      { position: 'RIGHT', label: `${this.totalRecords} Cidadãos`, icon: 'users-solid.svg' },
      {
        position: 'LEFT', handle: () => {
          this.showSelectConference = !this.showSelectConference;
        }, icon: 'change.svg'
      }
    ]);
  }

  async selectAllConference(conference: Conference){
    this.conferenceSelect = conference;
    this.showSelectConference = false;
    this.search.conferenceId = this.conferenceSelect.id;
    this.pageState = {
      first: 0,
      page: 0,
      rows: 10,
    }
    await this.loadData(this.pageState);
    this.buildBreadcrumb();
    await this.loadLocalitiesOptions();
    this.configureActionBar();
  }

  async searchHandle() {


    this.search.name = this.dataSearch.name
    this.search.email = this.dataSearch.email
    this.search.autentication = this.dataSearch.autentication
    this.search.status = this.dataSearch.status
    this.search.locality = this.dataSearch.locality

    this.pageState = {
      first: 0,
      page: 0,
      rows: 10,
    }

    await this.loadData(this.pageState);

    this.configureActionBar();
  }

  async selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    this.showSelectConference = false;
    this.pageState = {
      first: 0,
      page: 0,
      rows: 10,
    }
    await this.prepareScreen(this.pageState);
  }


  async citizenLoadData(event?: PaginatorState){

    
    if ((this.conferenceSelect?.id == null || this.conferenceSelect?.id === 0) && !(this.conferenceSelect.name == 'Todas as Audiências Públicas')) {
      await this.loadConferencesActives();
    }
    
    this.search.conferenceId = this.conferenceSelect.id;
    
      await this.loadData(event);
    
    this.buildBreadcrumb();
    this.configureActionBar();
  }

  async prepareScreen(event?: PaginatorState) {

    if ((this.conferenceSelect?.id == null || this.conferenceSelect?.id === 0) && !(this.conferenceSelect.name == 'Todas as Audiências Públicas')) {
      await this.loadConferencesActives();
    }
    this.search.conferenceId = this.conferenceSelect.id;

    await this.loadData(event);

    this.buildBreadcrumb();
    await this.loadLocalitiesOptions();
    this.configureActionBar();
  }

  async loadConferencesActives() {
    try {
      const data = await this.moderationSrv.getConferencesActive(false);
      this.conferencesActives = data;
      if (data.length > 0) {
        if (data.filter(conf => conf.isActive).length === 0) {
          this.conferenceSelect = data[0];
        } else {
          this.conferenceSelect = data.filter(conf => conf.isActive)[0];
        }
      }
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translateSrv.instant('citizen.error.fetch.conferenceActive')
      });
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: this.conferenceSelect.name, routerLink: ['/administration/citizen'] }
    ]);
  }

  clearSearch() {
    this.search = new CitizenFilterModel();
  }

  setForm(value) {
    this.citizenForm = this.formBuilder.group({
      name: [_.get(value, 'name', ''), [Validators.required, CustomValidators.noWhitespaceValidator]],
      locality: [_.get(value, 'locality', '') || _.get(value, 'localityId', ''), Validators.required],
      cpf: [_.get(value, 'cpf', ''), this.cpfValidators],
      password: [_.get(value, 'password', ''), this.passwordValidators],
      mail: [_.get(value, 'mail', '') || _.get(value, 'email', ''), this.mailValidators],
      telephone: [_.get(value, 'telephone', '')],
      typeAuthentication: [_.get(value, 'typeAuthentication', this.typeAuthentication) || 'mail', Validators.required],
      receiveInformational: [_.get(value, 'receiveInformational', false)],
      resetPassword: false,
      statusIsActive: _.get(value, 'active', true)
    });
  }

  cancel() {
    this.setForm({});
    this.formEdit = false;
  }

  changeTypeAuthentication(keepValue?: boolean) {
    this.typeAuthentication = this.getFormValue('typeAuthentication');
    const { password, mail, cpf } = this.citizenForm.controls;
    if (!keepValue) {
      mail.reset();
      cpf.reset();
      password.reset();
    }
    if (this.typeAuthentication === 'cpf') {
      mail.clearValidators(); mail.disable();
      password.setValidators(this.passwordValidators); password.enable();
      cpf.setValidators(this.cpfValidators); cpf.enable();
    } else {
      cpf.clearValidators(); cpf.disable();
      password.clearValidators(); password.disable();
      mail.setValidators(this.mailValidators); mail.enable();
    }
  }
  onBlurCpf() {
    if (this.typeAuthentication === 'cpf') {
      this.citizenForm.controls.mail.setValue(`${this.getFormValue('cpf')}@cpf`);
    }
  }

  getFormValue(field: string) {
    try {
      return this.citizenForm.get(field).value;
    } catch (error) {
      return undefined;
    }
  }

  async save(formData) {
    try {
      if(!this.conferenceSelect.id){
        const data = await this.moderationSrv.getConferencesActive(false);
        this.conferencesActives = data;
        if (data.length > 0) {
          if (data.filter(conf => conf.isActive).length === 0) {
            this.conferenceSelect = data[0];
          } else {
            this.conferenceSelect = data.filter(conf => conf.isActive)[0];
          }
        }
      }
      } catch (error) {
        console.error(error);
        this.messageService.add({
          severity: 'error', summary: 'Erro',
          detail: this.translateSrv.instant('citizen.error.fetch.conferenceActive')
        });
      }
    if (!this.isValidForm(formData)) { return; }
    const { cpf, mail, password, typeAuthentication, locality, name, telephone, resetPassword, statusIsActive, receiveInformational }
    = formData.value;
    const MAIL = typeAuthentication === 'cpf' ? `${cpf}@cpf` : mail;
    const sender: CitizenSenderModel = {
      name,
      telephone,
      receiveInformational,
      typeAuthentication,
      cpf,
      contactEmail: MAIL,
      confirmEmail: MAIL,
      confirmPassword: password,
      password,
      selfDeclaration: {
        conference: this.conferenceSelect.id,
        locality
      },
      resetPassword,
      active: statusIsActive
    };

    await this.citizenSrv.save(sender as any, this.idCitizen);
    this.messageService.add({
      severity: 'success',
      detail: this.idCitizen > 0 ?
        this.translateSrv.instant('citizen.updated', { name }) :
        this.translateSrv.instant('citizen.inserted', { name })
    });
    this.cancel();
    await this.loadData();
  }

  get iconSave() {
    return HelperUtils.loadingIcon(undefined, this.loading);
  }

  async showEditOrInsert(citizen?: CitizenModel) {
    this.formEdit = true;
    if (_.get(citizen, 'id')) {
      this.idCitizen = citizen.id;
      const { success, data } = await this.citizenSrv.GetById(citizen.id, {
        search: { conferenceId: _.get(this.conferenceSelect, 'id', 0) }
      });

      if (success) {
        this.setForm(data);
        this.authName = data.authName || [];
        data.autentication.forEach(({ loginName }) => {
           if(loginName === "Participe"){
            this.authName.unshift(loginName)
           }
          });
        this.authenticationsCitizen = data.autentication || [];
      }
    } else {
      this.idCitizen = 0;
      this.setForm({});
    }
    setTimeout(() => {
      this.changeTypeAuthentication(true);
    }, 200);
  }

  private isValidForm(form, errorMessage = this.translateSrv.instant('erro.invalid.data')) {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translateSrv.instant('error'),
        detail: errorMessage
      });
      return false;
    }
    return true;
  }

  async loadLocalitiesOptions() {
    try {
      if (!_.isNumber(this.conferenceSelect.id)) {
        return;
      }
      const data = await this.localitySrv.getLocalitiesBasedOnConferenceCitizenAuth(this.conferenceSelect.id);
      this.localities = _.map(data.localities, ({ id, name }) => ({ value: id, label: name }));
      this.filteredLocalities = this.localities;
      this.labelLocality = data.nameType;
      const indexCol = this.cols.findIndex(col => col.field === 'localityName');
      this.cols[indexCol].header = this.localitySrv.getTranslatedLabelLocality(this.labelLocality);
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translateSrv.instant('citizen.error.fetch.regionalization')
      });
    }
  }

  get getAuthenticationsFromCitizen(): string {
    let container = '';
    if (this.idCitizen > 0) {
        this.authName.forEach((name) => {
          container += `<img class="authentication-icon" title="${name}" src="${this.authSrv.getAuthenticationIcon(name)}"  alt=""/>`;
        });
    }
    return container;
  }

  filterLocalities({ query }) {
    if (!query) { 
      return this.filteredLocalities = this.localities;
    }
    this.filteredLocalities = this.localities.map(item => item).filter( value => this.replaceSpecialChars(value.label).includes(this.replaceSpecialChars(query))); 
  }

  replaceSpecialChars(str)	{
		if (!str) return '';			    
		str = str.toLowerCase();
    str = str.trim();
    str = str.replace(/\s/g, '')
		str = str.replace(/[aáàãäâ]/,'a');
		str = str.replace(/[eéèëê]/,'e');
		str = str.replace(/[iíìïî]/,'i');
		str = str.replace(/[oóòõöô]/,'o');
		str = str.replace(/[uúùüû]/,'u');
    str = str.replace(/[ç]/,'c');
		return str; 
	  }

  toStandardText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  get citizenHasNativeAuth() {
    return !!this.authenticationsCitizen && !!this.authenticationsCitizen.filter(a => a.loginName === 'Participe').length;
  }

  onInput($event) {
    this.citizenForm.patchValue(
      {'name': $event.target.value.replace(/^\s+/gm, '').replace(/\s+(?=[^\s])/gm, ' ')},
      {emitEvent: false}
    );
  }

  onBlur($event) {
    this.citizenForm.patchValue(
      {'name': $event.target.value.replace(/\s+$/gm, '')},
      {emitEvent: false});
  }
  setSearchLocality(){
    this.dataSearch.locality = this.selectedLocalities.map(item => item['value'] );
  }
}
