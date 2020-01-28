import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Structure } from '@app/shared/models/structure';
import { StructureService } from '@app/shared/services/structure.service';
import { StructureItem } from '@app/shared/models/structure-item';
import { StructureItemService } from '@app/shared/services/structure-item.service';

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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private structureService: StructureService,
    private formBuilder: FormBuilder,
    private structureItemService: StructureItemService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    this.clearStructures(null);
    this.clearStructureForm(null);
    this.clearStructureItemForm(null);
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'Administration' },
      { label: 'Structure', routerLink: ['/administration/structures'] }
    ]);
  }

  private async clearStructures(query) {
    const response = await this.structureService.listAll(query);
    this.structureTree = this.buildTree(response);
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
            hasPlan: item.hasPlan
          },
          expanded: false
        }
        if(item.items){
          node.children = this.buildTree(item.items);
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

    if (this.selectedStructureItem) {
      this.clearStructureItemForm(this.selectedStructureItem);
      this.showStructureItemForm = true;
      this.buildStructureItemBreadcrumb(rowNode, '');
    } else {
      this.clearStructureForm(this.structure);
      this.showStructureForm = true;
    }
    this.edit = true;
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
        summary: 'Success',
        detail: `New structure "${formData.name}" registered.`
      });
      this.clearStructureForm(null);
      this.clearStructures(null);
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error saving structure.'
      });
    }
  }

  async delete(rowNode) {
    await this.selectNode(rowNode);
    const deleteObject = this.selectedStructureItem ? this.selectedStructureItem : this.structure;

    this.confirmationService.confirm({
      message: `Are you sure that you want to delete "${deleteObject.name}?"`,
      key: 'deleteStructure',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.confirmDelete(deleteObject.id);
      }
    });
  }

  private async confirmDelete(id) {
    const isStructureItem = !!this.selectedStructureItem;
    try{
      if (isStructureItem) {
        await this.structureItemService.delete(id);
      } else {
        await this.structureService.delete(id);
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
    this.clearStructures(null);
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
    let logo = structureItem && structureItem.logo ? true : false;
    let locality = structureItem && structureItem.locality ? true : false;
    let votes = structureItem && structureItem.votes ? true : false;
    let comments = structureItem && structureItem.comments ? true : false;

    this.structureItems = [];
    this.structureItem = new StructureItem();
    this.structureItemForm = this.formBuilder.group({
      id: [structureItem && structureItem.id],
      name: [structureItem && structureItem.name, Validators.compose([Validators.required])],
      logo: [logo, Validators.compose([Validators.required])],
      locality: [locality, Validators.compose([Validators.required])],
      votes: [votes, Validators.compose([Validators.required])],
      comments: [comments, Validators.compose([Validators.required])],
    });
  }


  cancelStructureItem() {
    this.clearStructureItemForm(null);
  }

  async saveStructureItem(formData) {
    try {
      if(!this.validName(formData.id, formData.name)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'This name already exists.'
        });
        return;
      }
      this.markFormGroupTouched(this.structureItemForm);
      if (!this.isValidForm(this.structureItemForm)) return;
      formData = {
        ...formData,
        structure: { id: this.structure.id }
      }

      if (this.selectedStructureItem && !this.edit) {
        formData.parent = this.selectedStructureItem;
      }

      await this.structureItemService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `New structure item "${formData.name}" registered.`
      });

      this.clearStructureItemForm(null);
      this.clearStructures(null);
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error saving structure item.'
      });
    }
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

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  disableBtnAdd(rowNode) {
    if(rowNode.node.children) {
      return true;
    }
    let node = this.getSelectedNodeStructure(rowNode.node);
    if(node){
      return node.hasPlan;
    }
    return false;
  }

  disableBtnDelete(rowNode) {
    let node = this.getSelectedNodeStructure(rowNode.node);
    if(node){
      return node.hasPlan;
    }
    return false;
  }

  validName(id, name) :boolean{
    if(name === this.structure.name){
      return false;
    }
    if(!this.selectedRootNode.children){
      return true;
    }
    return this.verifyNameStructure(id, name, this.selectedRootNode.children);
  }

  verifyNameStructure(id, name, nodes: TreeNode[]): boolean {
    let validName = true;
    for(let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if(node.data.id !== id && node.data.name === name) {
        validName = false;
        break;
      }
      if(node.children) {
        validName = this.verifyNameStructure(id,name,node.children);
        if(!validName) {
          break;
        }
      }
    }
    return validName;
  }

}
