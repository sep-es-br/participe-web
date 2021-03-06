import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DomainService } from '@app/shared/services/domain.service';
import { Plan } from '@app/shared/models/plan';
import { PlanService } from '@app/shared/services/plan.service';
import { StructureService } from '@app/shared/services/structure.service';
import { Structure } from '@app/shared/models/structure';
import { StructureItem } from '@app/shared/models/structure-item';
import { PlanItem } from '@app/shared/models/plan-item';
import { LocalityService } from '@app/shared/services/locality.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PlanItemService } from '@app/shared/services/planItem.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Domain } from '@app/shared/models/domain';
import { LocalityType } from '@app/shared/models/locality-type';
import { IfStmt } from '@angular/compiler';

export class local {
  id: number;
  name: string;
}

@Component({
  selector: 'tt-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements OnInit {
  searchForm: FormGroup;

  contrastPlan: number = -1;
  localitiesPlanItem: local[] = [];
  localitiesPlanItemSelected: local[] = [];

  plans: Plan[] = [];
  planTree: TreeNode[];
  planForm: FormGroup;
  plan: Plan;

  domains: SelectItem[] = [];
  structures: SelectItem[] = [];
  typesDomaim: SelectItem[] = [];
  listStructures: Structure[];
  listDomains: Domain[];
  selectedStructure: Structure;
  structureItem: StructureItem;
  planBreadcrumb: string;
  structureBreadcrumb: string;
  region: LocalityType;

  planItem: PlanItem;
  planItemParent: PlanItem;
  planItemForm: FormGroup;
  localities: TreeNode[];
  selectedLocalities: TreeNode[];

  search = false;
  edit = false;
  showPlanForm = false;
  showPlanItemForm = false;
  saveAndContinue = false;
  loading = false;
  structSelected = false;
  domainSelected = false;
  loadRegionFineshed = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private domainService: DomainService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private planService: PlanService,
    private planItemService: PlanItemService,
    private localityService: LocalityService,
    private structureService: StructureService,
    private translate: TranslateService,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.buildBreadcrumb();
    this.listAllDomains();
    this.listAllStructures();
    this.clearSearchForm();
    this.clearPlans(null);
    this.clearPlanForm(null);
    this.clearPlanItemForm(null);
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: 'administration.plan', routerLink: ['/administration/plans'] }
    ]);
  }

  async listAllDomains() {
    this.domains = [];
    try {

      this.listDomains = await this.domainService.listAll(null);
      this.listDomains.forEach(domain => {
        this.domains.push({
          value: domain.id,
          label: domain.name
        });
      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('plan.error.fetch.domains')
      });
    }
  }

  async listAllStructures() {
    this.structures = [];
    try {
      this.listStructures = await this.structureService.listAll(null);
      this.listStructures.forEach(structure => {
        this.structures.push({
          value: structure.id,
          label: structure.name
        });

      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: this.translate.instant('plan.error.fetch.structures')
      });
    }
  }

  onChangeStructures(event) {
    this.typesDomaim = [];
    for (let index = 0; index < this.listStructures.length; index++) {
      if (this.listStructures[index].id == event) {
        this.checkStructure(this.listStructures[index]);
        break;
      }
    }
  }

  onChangeDomains(event) {
    this.typesDomaim = [];
    const typeLocality = {};

    this.listDomains.forEach(domain => {
      if (event == domain.id && domain.localities) {
        domain.localities.forEach( locality => {
          if (!typeLocality[locality.type.name]) {
            typeLocality[locality.type.name] = true;
            this.typesDomaim.push({
              value: locality.type.id,
              label: locality.type.name});
          }

          if (locality.children) {
            this.checktree(typeLocality, locality.children);
          }
        });
      }
    });

    this.domainSelected = (this.typesDomaim.length > 0) ? true : false;
  }

  private checktree(typeLocality, children, ) {

      children.forEach(child => {
        if (!typeLocality[child.type.name]) {
          typeLocality[child.type.name] = true;
          this.typesDomaim.push({
            value: child.type.id,
            label: child.type.name
          });
        }
        if (child.children) {
          this.checktree(typeLocality, child.children);
        }
      });
  }

  changeStyle(rowNode) {
    if (rowNode.node.data.id == this.contrastPlan) {
      this.contrastPlan = -1;
      return {newtr: true,
              oldtr: false};
    }
    return {newtr: false,
            oldtr: true};
  }

  private async clearPlans(query) {
    try {
      this.loading = true;
      if (!!query) {
        query = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        query = query.replace(/[^a-z0-9]/gi, ' ');
      }
      this.plans = await this.planService.listAll(query);
      this.planTree = this.buildTree(this.plans, !!query, query);
      this.loading = false;
    } catch (err) {
      console.error(err);
      this.loading = false;
    }
  }

  private buildTree(items: any[], open = false, query = null): TreeNode[] {
    items.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
    const root: TreeNode[] = [];
    if (items) {
      items.forEach(item => {
        const name = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        const foundQuery = open && query !== null && name.toLowerCase().includes(query.trim().toLowerCase());
        const expanded = foundQuery ? false : open;

        const node: TreeNode = {
          data: {
            id: item.id,
            name: item.name,
            description: item.description,
            structure: item.structure ? item.structure : null,
            domain: item.domain ? item.domain : null,
            type: item.structure ? item.structure : item.structureItem,
            localitytype: item.localitytype ? item.localitytype : null
          },
          expanded
        };
        if (item.items) {
          node.children = this.buildTree(item.items, open, query);
        }
        if (item.children) {
          node.children = this.buildTree(item.children, open, query);
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

  searchPlans(formData) {
    const query = formData && formData.query ? formData.query : null;
    this.clearPlans(query);
  }

  clearPlanForm(plan) {
    this.showPlanForm = false;
    this.plan = new Plan();
    this.planForm = this.formBuilder.group({
      id: [plan && plan.id],
      name: [plan && plan.name, Validators.required],
      structure: [plan && plan.structure && plan.structure.id, Validators.required],
      domain: [plan && plan.domain && plan.domain.id],
      localitytype: [plan && plan.localitytype && plan.localitytype.id]
    });
  }

  canclePlanItem() {
    this.cancel();
  }

  clearPlanItemForm(planItem) {
    if (!this.saveAndContinue) {
      this.showPlanItemForm = false;
      this.planBreadcrumb = '';
    }
    this.selectedLocalities = [];
    if (!this.edit) {
      this.planItem = new PlanItem();
    }
    // this.teste = planItem.listAllDomains
    this.planItemForm = this.formBuilder.group({
      id: [planItem && planItem.id],
      name: [planItem && planItem.name, Validators.required],
      description: [planItem && planItem.description],
      locality: []
    });
  }

  showCreatePlan() {
    this.edit = false;
    this.showPlanForm = true;
  }

  async showEdit(rowNode) {
    this.edit = true;
    this.localitiesPlanItemSelected = [];

    const plan = this.getSelectedNodePlan(rowNode.node);
    const structure = this.listStructures.find(s => s.id === plan.structure.id);
    this.checkStructure(structure);

    await this.selectNode(rowNode);
    if (rowNode.level > 0) {
      this.clearPlanItemForm(this.planItem);

      if (this.planItem.localities) {
        this.planItem.localities.forEach(l => {
          this.localitiesPlanItemSelected.push({id: l.id,
            name: l.name});
        });
      }

      this.showPlanItemForm = true;
      this.buildPlanBreadcrumb(rowNode.parent, '');
      this.buildStructureBreadcrumb(this.structureItem);
    } else {
      this.onChangeDomains(plan.domain.id);
      this.clearPlanForm(this.plan);
      this.showPlanForm = true;
    }
  }

  checkDomain(domain) {
    if (domain) {
      this.domainSelected = true;
    }
  }

  checkStructure(structure) {
    let isRegionalizable = false;
    if (structure.items != null) {
      const isAnyItemRegionalizable = structure.items.find(item => item.locality);

      if (isAnyItemRegionalizable) {
        isRegionalizable = true;
      } else {
        structure.items.forEach(item => {
          const isSubItemRegionalizable = this.checkChildrenRegionalizable(item.children);

          if (isSubItemRegionalizable) {
            isRegionalizable = true;
          }
        });
      }

      this.structSelected = isRegionalizable;
    } else {
      this.structSelected = false;
    }
  }

  checkChildrenRegionalizable(children) {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const currentItem = children[i];

        if (currentItem.locality) {
          return true;
        }

        if (currentItem.children) {
          return this.checkChildrenRegionalizable(currentItem.children);
        }
      }
    }
  }

  showCreatePlanItem(rowNode) {

    this.edit = false;
    this.localitiesPlanItemSelected = [];
    this.clearPlanItemForm(null);
    this.selectNode(rowNode);
    this.buildPlanBreadcrumb(rowNode, '');
    this.buildStructureBreadcrumb(this.structureItem);
    this.showPlanItemForm = true;
  }

  async selectNode(rowNode) {
    this.structureItem = null;
    this.planItemParent = null;
    this.localitiesPlanItem = [];

    const plan = this.getSelectedNodePlan(rowNode.node);
    this.plan = this.plans.find(p => p.id === plan.id);
    this.selectedStructure = this.listStructures.find(s => s.id == this.plan.structure.id);

    const level = rowNode.level;
    if (level > 0) {
      if (this.edit) {
        this.planItem = this.getPlanItem(rowNode.node.data.id, this.plan.items);
        this.structureItem = this.planItem.structureItem;

      } else {
        this.planItemParent = rowNode.node.data;
        for (let i = 0; i <= level; i++) {
          if (this.structureItem) {
            this.structureItem = this.structureItem && this.structureItem.children ? this.structureItem.children[0] : this.structureItem;
          } else {
            this.structureItem = this.selectedStructure.items[0];
          }
        }
      }

    } else {
      this.structureItem = this.selectedStructure.items[0];
    }

    if (this.structureItem.logo || this.structureItem.locality) {
      try {
        let localities = [];
        if (this.plan.domain && this.plan.domain.id) {
          localities = await this.localityService.findByDomain(this.plan.domain.id);
        }

        this.localities = this.buildTreeLocality(localities);
        this.convertTreeToList(this.localities, plan);
        if (this.localitiesPlanItem.length) {
          this.loadRegionFineshed = true;
        }

      } catch (err) {
        console.error(err);
      }
      if (level > 0 && this.edit) {
        const item = await this.planItemService.show(this.planItem.id);
        if (item.localities) {
          item.localities.forEach(l => {
            const node = this.getSelectedLocalityNode(l, this.localities);
            if (node) {
              this.selectedLocalities.push(node);
            }
          });
        }

        if (item.file) {
          this.planItem.file = item.file;
        }
        if (item.localities) {
          this.planItem.localities = item.localities;
        }
      }
    }
  }

  private getSelectedLocalityNode(locality, localities: TreeNode[]): TreeNode {
    let node: TreeNode;
    if (this.localities) {
      for (let i = 0; i < localities.length; i++) {
        const l = localities[i];
        if (l.data.id === locality.id) {
          node = l;
          break;
        }
        if (l.children) {
          node = this.getSelectedLocalityNode(locality, l.children);
          if (node) {
            break;
          }
        }

      }
    }
    return node;
  }

  private getPlanItem(id, planItems: PlanItem[]): PlanItem {
    let planItem: PlanItem;
    for (let i = 0; i < planItems.length; i++) {
      const l = planItems[i];
      if (l.id === id) {
        planItem = l;
        break;
      }
      if (l.children) {
        planItem = this.getPlanItem(id, l.children);
        if (planItem) {
          break;
        }
      }
    }
    return planItem;
  }

  private buildTreeLocality(items: any[]): TreeNode[] {
    items.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
    const root: TreeNode[] = [];
    if (items) {
      items.forEach(item => {
        const node: TreeNode = {
          label: item.name,
          data: {
            id: item.id,
            name: item.name,
            type: item.type ? item.type : null
          },
          expanded: true
        };
        if (item.children) {
          node.children = this.buildTreeLocality(item.children);
        }
        root.push(node);
      });
    }
    return root;
  }

  convertTreeToList(items: any[], plan) {
    if (items) {
      items.forEach(item => {
        if (item.children) {
          this.convertTreeToList(item.children, plan);
        }

        if (item.data.type && item.data.type.id == plan.localitytype.id) {
          const node: local = {
            name: item.data.name,
            id: item.data.id
          };
          this.localitiesPlanItem.push(node);
        }
      });
    }
  }

  buildPlanBreadcrumb(rowNode, breadcrumb) {
    breadcrumb = (breadcrumb ? ' > ' : '').concat(breadcrumb);
    this.planBreadcrumb = (rowNode.node ? rowNode.node.data.name : rowNode.data.name).concat(breadcrumb);
    if (rowNode.parent) {
      this.buildPlanBreadcrumb(rowNode.parent, this.planBreadcrumb);
    }
  }

  buildStructureBreadcrumb(structureItem) {
    if (!this.edit) {
      this.structureBreadcrumb = ` > ${this.translate.instant('new-a')} ${structureItem.name}`;
    } else {
      this.structureBreadcrumb = ` > ${this.translate.instant('update')} ${structureItem.name}`;
    }
  }

  uploadFile(data: { files: File }) {    
    const formData: FormData = new FormData();
    const file = data.files[0];
    
    formData.append('file', file, file.name);
    this.httpClient
        .post<any>(this.getUrlUploadFile(), formData)
        .subscribe(r => {
          this.planItem.file = r; 
        });
  }

  async removeFile(event) {
    try {
      await this.planService.deleteLogo(this.planItem.file.id).toPromise();
    } catch (err) {
      console.error(err);
    }
    this.planItem.file = null;
  }

  getUrlFile(url) {
    return `${environment.apiEndpoint}/files/${url}`;
  }

  getUrlUploadFile() {
    return `${environment.apiEndpoint}/files/upload`;
  }

  getHeadersUploadFile() {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + window.sessionStorage.getItem('token')
    });
    return headers;
  }

  private getSelectedNodePlan(node) {
    if (!node.parent) { return node.data; }
    return this.getSelectedNodePlan(node.parent);
  }

  async savePlan(formData) {

    try {
      this.markFormGroupTouched(this.planForm);
      if (!this.isValidForm(this.planForm)) { return; }
      formData = {
        ...formData,
        structure: { id: formData.structure },
        domain: { id: formData.domain },
        localitytype: {id: formData.localitytype}
      };

      const plan = await this.planService.save(formData, this.edit);
      this.loadRegionFineshed = false;
      this.contrastPlan = plan.id;

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.edit ? 'plan.updated' : 'plan.inserted', { name: formData.name })
      });
      this.clearPlanForm(null);
      this.clearPlans(null);

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('plan.error.saving')
      });
    }
    this.structSelected = false;
    this.domainSelected = false;
  }

  async savePlanItem(formData) {
    try {
      if (!this.isValidForm(this.planItemForm)) { return; }
      if (!this.isValidItemSave(formData)) { return; }

      const localitiesIds = this.getLocalityIds(this.localitiesPlanItemSelected, []);
      this.planItem.localitiesIds = localitiesIds;
      this.planItem.name = formData.name;
      this.planItem.description = formData.description;
      this.planItem.localitiesIds = localitiesIds;

      if (!this.edit) {
        if (this.planItemParent) {
          this.planItem.parent = this.planItemParent;
        } else {
          this.planItem.plan = this.plan;
        }
        this.planItem.structureItem = this.structureItem;
      }

      const planItem = await this.planItemService.save(this.planItem, this.edit);
      this.loadRegionFineshed = this.loadRegionFineshed && this.saveAndContinue ? true : false;
      this.localitiesPlanItemSelected = [];

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.edit ? this.translate.instant('plan.updated', { name: formData.name }) : this.translate.instant('plan.inserted', { name: formData.name })
      });

      this.clearPlanItemForm(null);
      await this.clearPlans(null);
      this.openTree(this.planTree, planItem.id);


    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('plan.error.saving')
      });
    }
  }

  getLocalityIds(localities, ids: number[]) {
    if (!localities) {
      return null;
    }
    localities.forEach(l => {
      ids.push(l.id);
      if (l.children) {
        this.getLocalityIds(l.children, ids);
      }
    });
    const setIds = new Set(ids);
    return Array.from(setIds);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private isValidItemSave(formData): boolean {
    let valid = true;
    if (this.structureItem.locality && formData.length == 0) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('plan.error.locality.select')
      });
      valid = false;
    }
    if (this.structureItem.logo && !this.planItem.file) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('file.required')
      });
      valid = false;
    }
    return valid;
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
    const deleteObject = rowNode.node.data;
    this.confirmationService.confirm({
      message: this.translate.instant('plan.confirm.delete', { name: deleteObject.name }),
      key: 'deletePlan',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.confirmDelete(deleteObject.id, rowNode);
      },
      reject: () => {
        this.canceldeleteItem(rowNode);
      }
    });

  }

  async canceldeleteItem(rowNode) {
    await this.clearPlans(null);
    this.openTree(this.planTree, rowNode.node.data.id);
  }

  private async confirmDelete(id, rowNode) {
    try {
      if (rowNode.level > 0) {
        await this.planItemService.delete(id);
      } else {
        await this.planService.delete(id);
      }

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('register.removed')
      });
    } catch (err) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warn'),
        detail: this.translate.instant('plan.warn.contain-conference')
      });

    }
    this.loadRegionFineshed = false;
    await this.clearPlans(null);

    if (rowNode.parent) {
      if (rowNode.parent.children && rowNode.parent.children.length > 1) {
        for (let i = 0; i < rowNode.parent.children.length; i++) {
          if (rowNode.parent.children[i].data.id != id) {
            this.openTree(this.planTree, rowNode.parent.children[i].data.id);
            break;
          }
        }
      } else {
        this.openTree(this.planTree, rowNode.parent.data.id);
    }
      }
  }

  private getLevel(structure: Structure) {
    let level = 0;
    let structureItem: StructureItem;
    if (structure.items) {
      level++;
      structureItem = structure.items[0];
      for (; ;) {
        if (structureItem.children) {
          level++;
          structureItem = structureItem.children[0];
        } else {
          break;
        }
      }
    }
    return level;
  }

  disableBtnAdd(rowNode) {
    if (this.listStructures) {
      const plan = this.getSelectedNodePlan(rowNode.node);
      const selectedStructure = this.listStructures.find(s => s.id == plan.structure.id);
      const maxLevel = this.getLevel(selectedStructure);
      if (rowNode.level >= maxLevel) {
        return true;
      }
    }
    return false;
  }

  setSaveAndContinue(saveAndContinue) {
    this.saveAndContinue = saveAndContinue;
  }

  async cancel() {

    this.structSelected = false;
    this.loadRegionFineshed = false;

    this.clearPlanItemForm(null);
    this.clearPlanForm(null);
    await this.clearPlans(null);
    // this.openTree(this.planTree, this.planItem.id);
    this.showPlanForm = false;
    this.showPlanItemForm = false;
  }

  loadingIcon(icon = 'pi pi-check') {
    return this.loading ? 'pi pi-spin pi-spinner' : icon;
  }

  openTree(Tree, id) {
    let result = false;

    Tree.forEach(node => {
      if (node.data.id != id) {
        if (node.children) {
          result = this.openTree(node.children, id);
          node.expanded = result;
        }
      } else {
        result =  true;
      }
    });
    return result;
  }

}
