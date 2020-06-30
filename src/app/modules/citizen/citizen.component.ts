import { HelperUtils } from './../../shared/util/HelpersUtil';
import { CustomValidators } from './../../shared/util/CustomValidators';
import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../core/breadcrumb/breadcrumb.service';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-citizen',
  templateUrl: './citizen.component.html',
  styleUrls: ['./citizen.component.scss']
})
export class CitizenComponent implements OnInit {

  formEdit: boolean = true;
  citizenForm: FormGroup;
  localitys: SelectItem[] = [];
  loading: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildBreadcrumb();
    this.setForm({});
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: 'administration.citizen', routerLink: ['/administration/citizen'] }
    ]);
  }

  setForm(value) {
    this.citizenForm = this.formBuilder.group({
      name: [_.get(value, 'name', ''), Validators.required],
      locality: [_.get(value, 'locality', ''), Validators.required],
      cpf: [_.get(value, 'cpf', ''), [Validators.required, CustomValidators.ValidateCPF]],
      password: ['', Validators.required],
      mail: [_.get(value, 'mail', ''), [Validators.required, Validators.email]],
      phone: [_.get(value, 'phone', ''), Validators.required],
    });
  }

  cancel() {
    this.setForm({});
  }

  async save(value) {
    try {
      this.messageService.add({ severity: 'su' })
    } catch (error) {

    }
  }

  get iconSave() {
    return HelperUtils.loadingIcon(undefined, this.loading);
  }

}
