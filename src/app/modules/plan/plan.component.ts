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
import { HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PlanItemService } from '@app/shared/services/planItem.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tt-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements OnInit {
  searchForm: FormGroup;

  plans: Plan[] = [];
  planTree: TreeNode[];
  planForm: FormGroup;
  plan: Plan;

  domains: SelectItem[] = [];
  structures: SelectItem[] = [];
  listStructures: Structure[];
  selectedStructure: Structure;
  structureItem: StructureItem;
  planBreadcrumb: string;
  structureBreadcrumb: string;

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
    private router: Router
  ) { }

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

      const domains = await this.domainService.listAll(null);
      domains.forEach(domain => {
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

  private async clearPlans(query) {
    this.plans = await this.planService.listAll(query);
    this.planTree = this.buildTree(this.plans);
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
            description: item.description,
            structure: item.structure ? item.structure : null,
            domain: item.domain ? item.domain : null,
            type: item.structure ? item.structure : item.structureItem
          },
          expanded: false
        }
        if (item.items) {
          node.children = this.buildTree(item.items);
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
    });
  }

  canclePlanItem() {
    this.cancel()
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
    this.planItemForm = this.formBuilder.group({
      id: [planItem && planItem.id],
      name: [planItem && planItem.name, Validators.required],
      description: [planItem && planItem.description]
    });
  }

  showCreatePlan() {
    this.edit = false;
    this.showPlanForm = true;
  }

  showEdit(rowNode) {
    this.edit = true;
    this.selectNode(rowNode);
    if (rowNode.level > 0) {
      this.clearPlanItemForm(this.planItem);
      this.showPlanItemForm = true;
      this.buildPlanBreadcrumb(rowNode, '');
      this.buildStructureBreadcrumb(this.structureItem);
    } else {
      this.clearPlanForm(this.plan);
      this.showPlanForm = true;
    }
  }

  showCreatePlanItem(rowNode) {
    this.edit = false;
    this.clearPlanItemForm(null);
    this.selectNode(rowNode);
    this.buildPlanBreadcrumb(rowNode, '');
    this.buildStructureBreadcrumb(this.structureItem);
    this.showPlanItemForm = true;
  }

  async selectNode(rowNode) {
    this.structureItem = null;
    this.planItemParent = null;

    const plan = this.getSelectedNodePlan(rowNode.node);
    this.plan = this.plans.find(p => p.id === plan.id);
    this.selectedStructure = this.listStructures.find(s => s.id == this.plan.structure.id);

    let level = rowNode.level;
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
      } catch (err) {
        console.error(err);
      }
      if (level > 0 && this.edit) {
        let item = await this.planItemService.show(this.planItem.id);
        if (item.localities) {
          item.localities.forEach(l => {
            let node = this.getSelectedLocalityNode(l, this.localities);
            if (node) {
              this.selectedLocalities.push(node);
            }
          });
        }
        if (item.file) {
          this.planItem.file = item.file;
        }
      }
    }

  }

  private getSelectedLocalityNode(locality, localities: TreeNode[]): TreeNode {
    let node: TreeNode;
    if (this.localities) {
      for (let i = 0; i < localities.length; i++) {
        let l = localities[i];
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
      let l = planItems[i];
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
    let root: TreeNode[] = [];
    if (items) {
      items.forEach(item => {
        let node: TreeNode = {
          label: item.name,
          data: {
            id: item.id,
            name: item.name,
            type: item.type ? item.type : null
          },
          expanded: true
        }
        if (item.children) {
          node.children = this.buildTreeLocality(item.children);
        }
        root.push(node);
      });
    }
    return root;
  }

  buildPlanBreadcrumb(rowNode, breadcrumb) {
    breadcrumb = (breadcrumb ? ' > ' : '').concat(breadcrumb);
    this.planBreadcrumb = (rowNode.node ? rowNode.node.data.name : rowNode.data.name).concat(breadcrumb);
    if (rowNode.parent) {
      this.buildPlanBreadcrumb(rowNode.parent, this.planBreadcrumb);
    }
  }

  buildStructureBreadcrumb(structureItem) {
    this.structureBreadcrumb = ` > ${this.translate.instant('new-a')} ${structureItem.name}`;
  }

  uploadFile(event) {
    this.planItem.file = { ...event.originalEvent.body };
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
    let headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + window.sessionStorage.getItem('token')
    });
    return headers;
  }

  private getSelectedNodePlan(node) {
    if (!node.parent) return node.data;
    return this.getSelectedNodePlan(node.parent);
  }

  async savePlan(formData) {
    try {
      this.markFormGroupTouched(this.planForm);
      if (!this.isValidForm(this.planForm)) return;

      formData = {
        ...formData,
        structure: { id: formData.structure },
        domain: { id: formData.domain }
      }

      await this.planService.save(formData, this.edit);
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
  }

  async savePlanItem(formData) {
    try {
      if (!this.isValidForm(this.planItemForm)) return;
      if (!this.isValidItemSave()) return;
      let localitiesIds = this.getLocalityIds(this.selectedLocalities, []);
      this.planItem.localitiesIds = localitiesIds;
      this.planItem.name = formData.name;
      this.planItem.description = formData.description;
      if (!this.edit) {
        if (this.planItemParent) {
          this.planItem.parent = this.planItemParent;
        } else {
          this.planItem.plan = this.plan;
        }
        this.planItem.structureItem = this.structureItem;
      }
      await this.planItemService.save(this.planItem, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.edit ? this.translate.instant('plan.updated', { name: formData.name }) : this.translate.instant('plan.inserted', { name: formData.name })
      });
      this.clearPlanItemForm(null);
      this.clearPlans(null);

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
      ids.push(l.data.id);
      if (l.children) {
        this.getLocalityIds(l.children, ids);
      }
    });
    let setIds = new Set(ids);
    return Array.from(setIds);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private isValidItemSave(): boolean {
    let valid = true;
    if (this.structureItem.locality && this.selectedLocalities.length == 0) {
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
        this.confirmDelete(deleteObject.id, rowNode.level);
      }, 
      reject: () => {
        this.clearPlans(null);
      }
    });
  }

  private async confirmDelete(id, level) {
    try {
      if (level > 0) {
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
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('erro.removing.register')
      });
    }
    this.clearPlans(null);
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
      let plan = this.getSelectedNodePlan(rowNode.node);
      let selectedStructure = this.listStructures.find(s => s.id == plan.structure.id);
      let maxLevel = this.getLevel(selectedStructure);
      if (rowNode.level >= maxLevel) {
        return true;
      }
    }
    return false;
  }

  setSaveAndContinue(saveAndContinue) {
    this.saveAndContinue = saveAndContinue;
  }

  cancel() {
    this.router.navigated = false;
    this.router.navigateByUrl(this.router.url);
  }

}
