import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Domain } from '@app/shared/models/domain';
import { DomainService } from '@app/shared/services/domain.service';
import { Locality } from '@app/shared/models/locality';
import { LocalityService } from '@app/shared/services/locality.service';
import { LocalityTypeService } from '@app/shared/services/locality-type.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';


@Component({
  selector: 'tt-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.scss']
})
export class DomainComponent implements OnInit {
  searchForm: FormGroup;

  domains: Domain[] = [];
  domainTree: TreeNode[];
  domainForm: FormGroup;
  domain: Domain;

  types: SelectItem[] = [];

  localityForm: FormGroup;
  localities: string[];
  locality: Locality;
  selectedLocality: Locality;
  localityBreadcrumb: string;
  disableSelectLocalityType: boolean;

  search = false;
  edit = false;
  showDomainForm = false;
  showLocalityForm = false;
  saveAndContinue = false;
  loading = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private domainService: DomainService,
    private formBuilder: FormBuilder,
    private localityService: LocalityService,
    private localityTypeService: LocalityTypeService,
    private messageService: MessageService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildBreadcrumb();
    this.listAllTypes();
    this.clearSearchForm();
    this.clearDomains(null);
    this.clearDomainForm(null);
    this.clearLocalityForm(null);
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: 'administration.domain', routerLink: ['/administration/domains'] }
    ]);
  }

  async listAllTypes() {
    this.types = [];
    try {

      const localityTypes = await this.localityTypeService.listAll();
      localityTypes.forEach(localityType => {
        this.types.push({
          value: localityType.id,
          label: localityType.name
        });
      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: this.translate.instant('domain.error.fetch.types')
      });
    }
  }

  private async clearDomains(query) {
    const response = await this.domainService.listAll(query);
    this.domainTree = this.buildTree(response);
  }

  private buildTree(items: any[]): TreeNode[] {
    items.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
    let root: TreeNode[] = [];
    if (items) {
      items.forEach(item => {
        let node: TreeNode = {
          data: {
            id: item.id,
            name: item.name,
            type: item.type ? item.type : null
          },
          expanded: false
        }
        if (item.localities) {
          node.children = this.buildTree(item.localities);
        }
        if (item.children) {
          node.children = this.buildTree(item.children);
        }
        root.push(node);
      });
    }
    return root;
  }

  toggleSearch() {
    this.search = !this.search;
    setTimeout(() => document.getElementById('search-input').focus(), 100);
  }

  clearSearchForm() {
    this.searchForm = this.formBuilder.group({
      query: ['']
    });
  }

  searchDomains(formData) {
    const query = formData && formData.query ? formData.query : null;
    this.clearDomains(query);
  }

  clearDomainForm(domain) {
    this.showDomainForm = false;
    this.domain = new Domain();
    this.domainForm = this.formBuilder.group({
      id: [domain && domain.id],
      name: [domain && domain.name, Validators.required]
    });
  }

  showCreateDomain() {
    this.edit = false;
    this.showDomainForm = true;
  }

  showEdit(rowNode) {
    this.selectNode(rowNode);

    if (this.selectedLocality) {
      this.clearLocalityForm(this.selectedLocality);
      this.showLocalityForm = true;
      this.disableSelectLocalityType = true;
      this.buildLocalityBreadcrumb(rowNode, '');
    } else {
      this.clearDomainForm(this.domain);
      this.showDomainForm = true;
    }

    this.edit = true;
  }

  private selectNode(rowNode) {
    this.domain = this.getSelectedNodeDomain(rowNode.node);
    this.selectedLocality = this.getSelectedNodeLocality(rowNode.node);
  }

  private getSelectedNodeDomain(node) {
    if (!node.parent) return node.data;
    return this.getSelectedNodeDomain(node.parent);
  }

  private getSelectedNodeLocality(node) {
    return node.parent ? node.data : null;
  }

  private validateLocalityType(rowNode) {
    this.disableSelectLocalityType = false;
    const children = rowNode.node.children;
    const hasChildren = !!children;

    if (hasChildren) {
      this.disableSelectLocalityType = true;
      const firstChild = children[0];
      this.localityForm.setValue({
        ...this.localityForm.value,
        type: firstChild.data.type.id
      })
    }
  }

  buildLocalityBreadcrumb(rowNode, breadcrumb) {
    breadcrumb = (breadcrumb ? ' > ' : '').concat(breadcrumb);
    this.localityBreadcrumb = (rowNode.node ? rowNode.node.data.name : rowNode.data.name).concat(breadcrumb);
    if (rowNode.parent) {
      this.buildLocalityBreadcrumb(rowNode.parent, this.localityBreadcrumb);
    }
  }

  async saveDomain(formData) {
    try {
      this.markFormGroupTouched(this.domainForm);
      if (!this.isValidForm(this.domainForm)) return;
      await this.domainService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.edit ? 'domain.updated' : 'domain.new', { name: formData.name })
      });
      this.clearDomainForm(null);
      this.clearDomains(null);
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant('domain.error.saving')
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private isValidForm(form, errorMessage = this.translate.instant('erro.invalid.data')) {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: errorMessage
      });
      return false;
    }

    return true;
  }

  delete(rowNode) {
    this.selectNode(rowNode);
    const deleteObject = this.selectedLocality ? this.selectedLocality : this.domain;
    this.confirmationService.confirm({
      message: this.translate.instant('domain.confirm.delete', { name: deleteObject.name }),
      key: 'deleteDomain',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.confirmDelete(deleteObject.id);
      },
      reject: () => {
        this.clearDomains(null);
      }
    });
  }

  private async confirmDelete(id) {
    const isLocality = !!this.selectedLocality;
    try {
      if (isLocality) {
        await this.localityService.delete(id, this.domain.id);
      } else {
        await this.domainService.delete(id);
      }
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('register.removed')
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('erro.removing.register')
      });
    }
    this.clearDomains(null);
  }

  showCreateLocality(rowNode) {
    this.selectNode(rowNode);
    this.validateLocalityType(rowNode);
    this.buildLocalityBreadcrumb(rowNode, '');
    this.edit = false;
    this.showLocalityForm = true;
  }

  clearLocalityForm(locality) {
    if (!this.saveAndContinue) {
      this.showLocalityForm = false;
      this.localityBreadcrumb = '';
      this.disableSelectLocalityType = false;
    }
    this.localities = [];
    this.locality = new Locality();
    this.disableSelectLocalityType = true;
    this.localityForm = this.formBuilder.group({
      id: [locality && locality.id],
      name: [locality && locality.name, Validators.required],
      type: [locality && locality.type.id, Validators.required]
    });
  }

  setSaveAndContinue(saveAndContinue) {
    this.saveAndContinue = saveAndContinue;
  }

  cancelLocality() {
    this.cancel()
  }

  async searchLocalities(event, type) {
    if (type) {
      const response = await this.localityService.listAllByNameType(event.query, type);
      if (response) {
        this.localities = response.map(locality => locality.name);
      }
    }
  }

  async saveLocality(formData) {
    try {
      this.loading = true;
      this.markFormGroupTouched(this.localityForm);
      if (!this.isValidForm(this.localityForm)) {
        this.loading = false;
        return;
      }
      formData = {
        ...formData,
        type: { id: formData.type },
        domain: { id: this.domain.id },
        domains: [{ id: this.domain.id }]
      }

      if (this.selectedLocality && !this.edit) {
        formData.parents = [this.selectedLocality];
        formData.parent = this.selectedLocality;
      }

      await this.localityService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.edit ? this.translate.instant('domain.locality.updated', { name: formData.name }) : this.translate.instant('domain.locality.inserted', { name: formData.name })
      });

      let data = null;
      if (this.saveAndContinue) {
        data = { type: formData.type },
          this.edit = false;
      }

      this.clearLocalityForm(data);
      this.clearDomains(null);
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant(err.error.message)
      });
    }
  }

  cancel() {
    this.router.navigated = false;
    this.router.navigateByUrl(this.router.url);
  }

  loadingIcon(icon = 'pi pi-check') {
    return this.loading ? 'pi pi-spin pi-spinner' : icon;
  }
}
