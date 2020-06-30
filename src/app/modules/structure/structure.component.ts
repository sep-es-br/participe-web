import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Structure } from '@app/shared/models/structure';
import { StructureService } from '@app/shared/services/structure.service';
import { StructureItem } from '@app/shared/models/structure-item';
import { StructureItemService } from '@app/shared/services/structure-item.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tt-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.scss']
})
export class StructureComponent implements OnInit {
  searchForm: FormGroup;

  structures: Structure[] = [];
  structureTree: TreeNode[];
  structureForm: FormGroup;
  structure: Structure;
  selectedRootNode: TreeNode;

  structureItemForm: FormGroup;
  structureItems: string[];
  structureItem: StructureItem;
  selectedStructureItem: StructureItem;
  structureItemBreadcrumb: string;

  search = false;
  edit = false;
  showStructureForm = false;
  showStructureItemForm = false;
  saveAndContinue = false;
  disableBtnSave = false;
  loading = false;
  tileChecked = false;
  subtileChecked = false;
  linkChecked = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private structureService: StructureService,
    private formBuilder: FormBuilder,
    private structureItemService: StructureItemService,
    private messageService: MessageService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    this.clearStructures(null);
    this.clearStructureForm(null);
    this.clearStructureItemForm(null);
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: 'administration.structure', routerLink: ['/administration/structures'] }
    ]);
  }

  private async clearStructures(query) {
    try {
      this.loading = true;
      if(!!query){
        query = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        query = query.replace(/[^a-z0-9]/gi, " ");
      }

      const response = await this.structureService.listAll(query);
      this.structureTree = this.buildTree(response, !!query, query);
      this.loading = false;
    } catch (err) {
      console.error(err);
      this.loading = false;
    }
  }

  private buildTree(items: any[], open = false, query = null): TreeNode[] {
    items.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
    let root: TreeNode[] = [];
    if (items) {
      items.forEach(item => {
        const name =item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        const foundQuery = open && query !== null && name.toLowerCase().includes(query.trim().toLowerCase());
        const expanded = foundQuery ? false : open;
        
        let node: TreeNode = {
          data: {
            id: item.id,
            name: item.name,
            hasPlan: item.hasPlan
          },
          expanded
        }
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
    this.search ? setTimeout(() => document.getElementById('search-input').focus(), 100):null;
  }

  clearSearchForm() {
    this.searchForm = this.formBuilder.group({
      query: ['']
    });
  }

  searchStructures(formData) {
    const query = formData && formData.query ? formData.query : null;
    this.clearStructures(query);
  }

  clearStructureForm(structure) {
    this.showStructureForm = false;
    this.structure = new Structure();
    this.structureForm = this.formBuilder.group({
      id: [structure && structure.id],
      name: [structure && structure.name, Validators.required]
    });
  }

  showCreateStructure() {
    this.edit = false;
    this.disableBtnSave = false;
    this.showStructureForm = true;
  }

  async showEdit(rowNode) {
    await this.selectNode(rowNode);
    this.edit = true;

    if (this.selectedStructureItem) {
      this.clearStructureItemForm(this.selectedStructureItem);
      this.showStructureItemForm = true;
      this.buildStructureItemBreadcrumb(rowNode.parent, '');
    } else {
      this.clearStructureForm(this.structure);
      this.showStructureForm = true;
    }
  }

  private async selectNode(rowNode) {
    this.selectedRootNode = this.getSelectedNode(rowNode);
    this.structure = this.getSelectedNodeStructure(rowNode.node);
    this.disableBtnSave = this.structure.hasPlan;
    this.selectedStructureItem = await this.getSelectedNodeStructureItem(rowNode.node);
  }

  private getSelectedNode(rowNode) {
    if (!rowNode.parent) {
      return rowNode;
    }
    return this.getSelectedNode(rowNode.parent);
  }

  private getSelectedNodeStructure(node) {
    if (!node.parent) {
      return node.data;
    }
    return this.getSelectedNodeStructure(node.parent);
  }

  private async getSelectedNodeStructureItem(node) {
    const nodeStructureItem = node.parent ? node.data : null;
    if (nodeStructureItem) {
      return await this.structureItemService.find(nodeStructureItem.id);
    }
    return null;
  }

  buildStructureItemBreadcrumb(rowNode, breadcrumb) {
    breadcrumb = (breadcrumb ? ' > ' : '').concat(breadcrumb);
    this.structureItemBreadcrumb = (rowNode.node ? rowNode.node.data.name : rowNode.data.name).concat(breadcrumb);
    if (rowNode.parent) {
      this.buildStructureItemBreadcrumb(rowNode.parent, this.structureItemBreadcrumb);
    }
  }

  async saveStructure(formData) {
    try {
      this.markFormGroupTouched(this.structureForm);
      if (!this.isValidForm(this.structureForm)) return;
      await this.structureService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.edit ? 'structure.updated' : 'structure.new', { name: formData.name })
      });
      this.clearStructureForm(null);
      this.clearStructures(null);
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('structure.error.saving')
      });
    }
  }

  async delete(rowNode) {
    await this.selectNode(rowNode);
    const deleteObject = this.selectedStructureItem ? this.selectedStructureItem : this.structure;

    this.confirmationService.confirm({
      message: this.translate.instant('structure.confirm.delete', { name: deleteObject.name }),
      key: 'deleteStructure',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.confirmDelete(deleteObject);
      },
      reject: () => {
        this.canceldeleteItem(rowNode);
      }
    });
  }

  private async confirmDelete(deleteObject) {
    const isStructureItem = !!this.selectedStructureItem;
    try {
      if (isStructureItem) {
        await this.structureItemService.delete(deleteObject.id);
      } else {
        await this.structureService.delete(deleteObject.id);
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
    await this.clearStructures(null);
    if(deleteObject.parent)
      this.openTree(this.structureTree, deleteObject.parent.id);
  }

  async canceldeleteItem(rowNode){
    await this.clearStructures(null);
    this.openTree(this.structureTree, rowNode.node.data.id);
  }

  showCreateStructureItem(rowNode) {
    this.selectNode(rowNode);
    this.buildStructureItemBreadcrumb(rowNode, '');
    this.edit = false;
    this.showStructureItemForm = true;
  }

  clearStructureItemForm(structureItem) {
    if (!this.saveAndContinue) {
      this.showStructureItemForm = false;
      this.structureItemBreadcrumb = '';
    }

    if(this.edit && structureItem){
      this.tileChecked = structureItem.title ? true : false;
      this.subtileChecked = structureItem.subtitle ? true : false;
      this.linkChecked = structureItem.link ? true : false;
    }
    else{
      this.tileChecked = false;
      this.subtileChecked = false;
      this.linkChecked = false;
    }

    let logo = structureItem && structureItem.logo ? true : false;
    let locality = structureItem && structureItem.locality ? true : false;
    let votes = structureItem && structureItem.votes ? true : false;
    let comments = structureItem && structureItem.comments ? true : false;
    let title = structureItem ? structureItem.title : null;
    let subtitle = structureItem ? structureItem.subtitle : null;
    let link = structureItem ? structureItem.link : null;

    this.structureItems = [];
    this.structureItem = new StructureItem();
    this.structureItemForm = this.formBuilder.group({
      id: [structureItem && structureItem.id],
      name: [structureItem && structureItem.name, Validators.compose([Validators.required])],
      logo: [logo, Validators.compose([Validators.required])],
      locality: [locality, Validators.compose([Validators.required])],
      votes: [votes, Validators.compose([Validators.required])],
      comments: [comments, Validators.compose([Validators.required])],
      title: [title],
      subtitle: [subtitle],
      link: [link],
    });    
    
    /*if(structureItem == null){
      this.tileChecked = false;
      this.subtileChecked = false;
      this.linkChecked = false;
    }*/
  }

  cancelStructureItem() {
    this.cancel()
  }

  async saveStructureItem(formData) {
    try {
      if (!this.validName(formData.id, formData.name)) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error'),
          detail: this.translate.instant('exists.name')
        });
        return;
      }
      this.markFormGroupTouched(this.structureItemForm);
      if (!this.isValidForm(this.structureItemForm)) return;

      formData = this.checkformData(formData);
      console.log(formData);

      const structureItem = await this.structureItemService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.edit ? 'structure.item.updated' : 'structure.item.new', { name: formData.name })
      });

      this.clearStructureItemForm(null);
      await this.clearStructures(null);
      //this.openTree(this.structureTree, structureItem.id);
      
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('structure.error.item')
      });
    }
  }

  private checkformData(formData){
    formData = {
      ...formData,
      structure: { id: this.structure.id },
      title: this.tileChecked ? formData.title : null,
      subtitle: this.subtileChecked ? formData.subtitle : null,
      link: this.linkChecked ? formData.link : null
    }

    if (this.selectedStructureItem && !this.edit) {
      formData.parent = this.selectedStructureItem;
    }

    return formData;
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

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  disableBtnAdd(rowNode) {
    if (rowNode.node.children) {
      return true;
    }
    let node = this.getSelectedNodeStructure(rowNode.node);
    if (node) {
      return node.hasPlan;
    }
    return false;
  }

  disableBtnDelete(rowNode) {
    let node = this.getSelectedNodeStructure(rowNode.node);
    if (node) {
      return node.hasPlan;
    }
    return false;
  }

  validName(id, name): boolean {
    if (name === this.structure.name) {
      return false;
    }
    if (!this.selectedRootNode.children) {
      return true;
    }
    return this.verifyNameStructure(id, name, this.selectedRootNode.children);
  }

  verifyNameStructure(id, name, nodes: TreeNode[]): boolean {
    let validName = true;
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.data.id !== id && node.data.name === name) {
        validName = false;
        break;
      }
      if (node.children) {
        validName = this.verifyNameStructure(id, name, node.children);
        if (!validName) {
          break;
        }
      }
    }
    return validName;
  }

  async cancel() {
    this.router.navigated = false;
    this.clearStructureForm(null);
    this.clearStructureItemForm(null);
    await this.clearStructures(null);
    //this.openTree(this.structureTree, selected.id);
    this.showStructureForm = false;
    this.showStructureItemForm = false;
    
  }

  loadingIcon(icon = 'pi pi-check') {
    return this.loading ? 'pi pi-spin pi-spinner' : icon;
  }

  openTree(Tree, id){
    let result = false;

    Tree.forEach(node =>{
      if(node.data.id != id){
        if(node.children){
          result = this.openTree(node.children, id);
          node.expanded = result;
        }
      }
      else{
        result =  true;
      }
    });
    return result;
  }
}
