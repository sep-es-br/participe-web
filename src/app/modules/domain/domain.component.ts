import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Domain } from '@app/shared/models/domain';
import { DomainService } from '@app/shared/services/domain.service';
import { Locality } from '@app/shared/models/locality';
import { LocalityService } from '@app/shared/services/locality.service';
import { LocalityTypeService } from '@app/shared/services/locality-type.service';

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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private domainService: DomainService,
    private formBuilder: FormBuilder,
    private localityService: LocalityService,
    private localityTypeService: LocalityTypeService,
    private messageService: MessageService,
  ) {}

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
      { label: 'Administration' },
      { label: 'Domain', routerLink: ['/administration/domains'] }
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
        detail: 'Error fetching types.'
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
        if(item.localities){
          node.children = this.buildTree(item.localities);
        }
        if(item.children){
          node.children = this.buildTree(item.children);
        }
        root.push(node);
      });
    }
    return root;
  }

  toogleSearch() {
    this.search = !this.search;
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
        summary: 'Success',
        detail: this.edit ? `Updated domain "${formData.name}".` : `New domain "${formData.name}" registered.`
      });
      this.clearDomainForm(null);
      this.clearDomains(null);
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error saving domain.'
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

  private isValidForm(form, errorMessage = 'Invalid data. Verify provided information and try again.') {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
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
      message: `Are you sure that you want to delete "${deleteObject.name}?"`,
      key: 'deleteDomain',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.confirmDelete(deleteObject.id);
      }
    });
  }

  private async confirmDelete(id) {
    const isLocality = !!this.selectedLocality;
    try{
      if (isLocality) {
        await this.localityService.delete(id, this.domain.id);
      } else {
        await this.domainService.delete(id);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Register removed.'
      });
    } catch(err){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error removing register.'
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
      name: [ locality && locality.name, Validators.required],
      type: [ locality && locality.type.id, Validators.required ]
    });
  }

  setSaveAndContinue(saveAndContinue) {
    this.saveAndContinue = saveAndContinue;
  }

  cancelLocality() {
    this.setSaveAndContinue(false);
    this.clearLocalityForm(null);
  }

  async searchLocalities(event) {
    const response = await this.localityService.listAll(event.query);
    if (response) {
      this.localities = response.map(locality => locality.name);
    }
  }

  async saveLocality(formData) {
    try {
      this.markFormGroupTouched(this.localityForm);
      if (!this.isValidForm(this.localityForm)) return;
      formData = {
        ...formData,
        type: { id: formData.type },
        domains: [{ id: this.domain.id }]
      }

      if (this.selectedLocality && !this.edit) {
        formData.parents = [ this.selectedLocality ];
      }

      if (!this.edit && !await this.isValidLocalityType(formData)) return;

      await this.localityService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: this.edit ? `Updated locality "${formData.name}".` : `New locality "${formData.name}" registered.`
      });

      let data = null;
      if (this.saveAndContinue) {
        data = { type: formData.type },
        this.edit = false;
      }

      this.clearLocalityForm(data);
      this.clearDomains(null);
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error saving locality.'
      });
    }
  }

  private async isValidLocalityType({ type, parents, domains }) {
    const domainNode = this.domainTree.find(node => node.data.id === this.domain.id);
    const usedLevel = this.usedLevel(domainNode, type);

    if (!usedLevel) {
      return true;
    }

    let sameParent = [];
    let sameDomain = [];

    if (parents && parents.length > 0) {
      sameParent = parents.filter(parent => parent.id === usedLevel.data.id);
    } else {
      sameDomain = domains.filter(domain => domain.id === usedLevel.data.id);
    }

    const notSameParentOrDomain = sameParent.length === 0 && sameDomain.length === 0;

    if (notSameParentOrDomain) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'This type has already been associated to another level on this domain.'
      });

      return false;
    }

    return true;
  }

  private usedLevel(node, type) {
    const matches = this.childMatches(node.children, type);

    if (matches) return node;

    if (!node.children || node.children.length === 0) return null;

    let matchingNode = null;
    for (const child of node.children) {
      matchingNode = this.usedLevel(child, type);
      if (matchingNode !== null) break;
    }

    return matchingNode;
  }

  private childMatches(children, type) {
    if (!children || children.length === 0) return false;

    const matches = children.filter(child => child.data.type.id === type.id);

    return matches && matches.length > 0;
  }
}
