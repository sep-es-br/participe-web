import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { TranslateService } from "@ngx-translate/core";

import { ConfirmationService, MessageService } from "primeng/api";
import { DropdownChangeEvent } from "primeng/dropdown";
import { MultiSelectChangeEvent } from "primeng/multiselect";
import { TableLazyLoadEvent } from "primeng/table";
import { PaginatorState } from "primeng/paginator";

import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";
import { IEvaluator } from "@app/shared/interface/IEvaluator";
import {
  IEvaluatorOrganization,
  IEvaluatorSection,
  IEvaluatorRole,
} from "@app/shared/interface/IEvaluatorData";
import { EvaluatorCreateFormModel } from "@app/shared/models/EvaluatorModel";
import { IPagination } from "@app/shared/interface/IPagination";

@Component({
  selector: "app-evaluators",
  standalone: false,
  templateUrl: "./evaluators.component.html",
  styleUrl: "./evaluators.component.scss",
})
export class EvaluatorsComponent implements OnInit, OnDestroy {
  public loading: boolean = false;

  public search: boolean = false;
  public showForm: boolean = false;

  public evaluatorsForm: FormGroup;
  public formHeaderText: string = "";
  private evaluationSectionId: number;
  public editEvaluatorSection: boolean = false;

  public searchForm: FormGroup;

  public evaluatorsList: Array<IEvaluator> = [];

  public rowsPerPageOptions: Array<number> = [10, 25];
  public totalRecords: number = 0;

  public pageState: PaginatorState = {
    first: 0,
    rows: this.rowsPerPageOptions[0],
  };

  public organizationsList: Array<IEvaluatorOrganization> = [];
  public sectionsList: Array<IEvaluatorSection> = [];
  public rolesList: Array<IEvaluatorRole> = [];

  private namesMapObject: { [key: string]: string } = {};

  public pageReportTemplateTranslateParams = {
    first: 0,
    last: 0,
    totalRecords: 0,
  };

  constructor(
    private breadcrumbService: BreadcrumbService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private evaluatorsService: EvaluatorsService
  ) {
    this.updatePageReportTemplateTranslateParams();
  }

  public async ngOnInit() {
    this.buildBreadcrumb();
    await this.getEvaluatorsList();
    await this.getOrganizationsList();
  }

  public async lazyLoadEvaluatorsList(event: TableLazyLoadEvent) {
    this.pageState.first = event.first;
    this.pageState.rows = event.rows;

    await this.getEvaluatorsList(this.pageState);
  }

  public showSearchForm() {
    this.search = !this.search;
    this.initSearchForm();
  }

  public showCreateEvaluator() {
    this.editEvaluatorSection = false;
    this.showForm = true;

    this.initCreateEvaluatorsForm();
    this.formHeaderText = "evaluator.new";
  }

  public async showEditEvaluator(data: IEvaluator) {
    this.editEvaluatorSection = true;
    this.showForm = true;

    this.initEditEvaluatorsForm(data);

    await this.getSectionsList(data.organizationGuid);

    await data.sectionsGuid.forEach((sectionGuid) =>
      this.addToRolesList(sectionGuid).finally(() =>
        data.rolesGuid
          ? this.prepareRolesGuidFormControl(data.rolesGuid)
          : this.patchRolesGuidFormControlWithNullValue()
      )
    );

    this.formHeaderText = "evaluator.edit";
  }

  public async deleteEvaluator(data: IEvaluator) {
    this.confirmationService.confirm({
      message: this.translateService.instant("evaluator.confirm.delete", {
        name: this.namesMapObject[data.organizationGuid],
      }),
      key: "deleteEvaluationSection",
      acceptLabel: this.translateService.instant("yes"),
      rejectLabel: this.translateService.instant("no"),
      accept: async () => {
        await this.deleteEvaluationSection(data.id);
      },
      reject: () => {},
    });
  }

  public loadingIcon(icon = "pi pi-check") {
    return this.loading ? "pi pi-spin pi-spinner" : icon;
  }

  public async organizationChanged(event: DropdownChangeEvent) {
    await this.getSectionsList(event.value);
  }

  public async sectionsChanged(event: MultiSelectChangeEvent) {
    if (event.value.length == 0) {
      this.sectionsCleared();
      return;
    }

    const targetSection = event.itemValue;

    if (targetSection.guid) {
      await this.addToRolesList(targetSection.guid);
    } else {
      await this.removeFromRolesList(targetSection);
    }
  }

  public sectionsCleared() {
    this.rolesList = [];
    this.evaluatorsForm.get("rolesGuid").setValue([]);
  }

  public disableOptionsIfAllSelected(): string {
    const rolesGuidControlValue = this.evaluatorsForm.get("rolesGuid").value;

    if (
      rolesGuidControlValue.length > 0 &&
      rolesGuidControlValue[0].name == "Todos"
    ) {
      return "name";
    } else {
      return "";
    }
  }

  public patchValueIfAllSelected(event: MultiSelectChangeEvent) {
    if (event.value.length > 0 && event.itemValue.name == "Todos") {
      this.patchRolesGuidFormControlWithNullValue();
    }
  }

  public searchEvaluators() {
    console.log(this.searchForm.value);
  }

  public cancelForm() {
    this.showForm = false;
    this.editEvaluatorSection = false;
    this.evaluatorsForm = null;
    this.sectionsList = [];
    this.rolesList = [];
  }

  public getOrganizationName(orgGuid: string): string {
    return this.namesMapObject[orgGuid];
  }

  public getSectionNames(sectionsGuid: Array<string>): Array<string> {
    return sectionsGuid.map((section) => this.namesMapObject[section]);
  }

  public getRoleNames(rolesGuid: Array<string>): Array<string> {
    return rolesGuid
      ? rolesGuid.map((role) => this.namesMapObject[role])
      : ["Todos"];
  }

  public async saveEvaluatorsForm(form: FormGroup) {
    const controls = form.controls;

    for (const key in controls) {
      controls[key].markAsTouched();
    }

    if (!form.valid) {
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("erro.invalid.data"),
      });

      return;
    }

    const reqBody = new EvaluatorCreateFormModel(form.value);

    if (this.editEvaluatorSection && this.evaluationSectionId) {
      await this.putEvaluatorsForm(this.evaluationSectionId, reqBody);
    } else {
      await this.postEvaluatorsForm(reqBody);
    }
  }

  private async postEvaluatorsForm(reqBody: EvaluatorCreateFormModel) {
    try {
      const result = await this.evaluatorsService.postEvaluator(reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluator.inserted"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("evaluator.error.saving"),
      });
    } finally {
      this.cancelForm();
      await this.getEvaluatorsList();
    }
  }

  private async putEvaluatorsForm(
    id: number,
    reqBody: EvaluatorCreateFormModel
  ) {
    try {
      const result = await this.evaluatorsService.putEvaluator(id, reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluator.updated", {
          name: this.namesMapObject[result.organizationGuid],
        }),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("evaluator.error.saving"),
      });
    } finally {
      this.cancelForm();
      await this.getEvaluatorsList();
    }
  }

  private async deleteEvaluationSection(id: number) {
    try {
      const result = await this.evaluatorsService.deleteEvaluator(id);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("register.removed"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "warn",
        summary: this.translateService.instant("warn"),
        detail: this.translateService.instant("Erro ao excluir o avaliador"),
      });
    } finally {
      this.cancelForm();
      await this.getEvaluatorsList();
    }
  }

  // Controles bloqueados por enquanto, método ainda não implementado
  private initSearchForm() {
    this.searchForm = new FormGroup({
      searchOrganization: new FormControl({ value: "", disabled: true }),
      searchSection: new FormControl({ value: "", disabled: true }),
      searchRole: new FormControl({ value: "", disabled: true }),
    });
  }

  private initCreateEvaluatorsForm() {
    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl("", Validators.required),
      sectionsGuid: new FormControl([], Validators.required),
      rolesGuid: new FormControl([]),
    });
  }

  private async initEditEvaluatorsForm(data: IEvaluator) {
    this.evaluationSectionId = data.id;

    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl(
        data.organizationGuid,
        Validators.required
      ),
      sectionsGuid: new FormControl(data.sectionsGuid, Validators.required),
      rolesGuid: new FormControl(data.rolesGuid ?? []),
    });
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "administration.label" },
      {
        label: "administration.evaluators",
        routerLink: ["/administration/evaluators"],
      },
    ]);
  }

  private async getEvaluatorsList(pageState?: PaginatorState) {
    const pageable: IPagination = {
      pageNumber: pageState ? pageState.first / pageState.rows : 0,
      pageSize: pageState ? pageState.rows : 10,
    };

    await this.evaluatorsService
      .getEvaluatorsList(pageable)
      .then((response) => {
        this.evaluatorsList = response.content ?? [];
        this.totalRecords = response.totalElements;
        this.updatePageReportTemplateTranslateParams();
        this.prepareEvaluatorsTable();
      });
  }

  private async getOrganizationsList() {
    this.organizationsList =
      await this.evaluatorsService.getOrganizationsList();
  }

  private async getSectionsList(orgGuid: string) {
    this.sectionsList = await this.evaluatorsService.getSectionsList(orgGuid);
  }

  private async getRolesList(unitGuid: string): Promise<Array<IEvaluatorRole>> {
    const response = await this.evaluatorsService.getRolesList(unitGuid);

    if (response.length == 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção!",
        detail: "A unidade não possui papéis atrelados á ela.",
      });
    } else {
      return response;
    }
  }

  private async addToRolesList(unitGuid: string) {
    await this.getRolesList(unitGuid)
      .then((response) => {
        if (response) {
          this.rolesList = this.rolesList.concat(response);
        }
      })
      .finally(() => {
        if (
          !this.rolesList.includes(this.evaluatorsService.rolesGuidNullValue)
        ) {
          this.rolesList.unshift(this.evaluatorsService.rolesGuidNullValue);
        }
      });
  }

  private async removeFromRolesList(unitGuid: string) {
    await this.getRolesList(unitGuid).then((response) => {
      if (response) {
        response.forEach((target) => {
          const targetRole = this.rolesList.find((role) => role == target);
          this.rolesList.splice(this.rolesList.indexOf(targetRole), 1);
        });
      }
    });
  }

  private async prepareEvaluatorsTable() {
    this.loading = true;

    const organizationsGuidList = this.evaluatorsList.length > 0 ? this.evaluatorsList.map(
      (evaluator) => evaluator.organizationGuid
    ) : [];

    const sectionsGuidList = this.evaluatorsList.length > 0 ? this.evaluatorsList
      .map((evaluator) => evaluator.sectionsGuid)
      .reduce((acc, cur) => acc.concat(cur)) : [];

    const rolesGuidList = this.evaluatorsList.length > 0 ? this.evaluatorsList
      .map((evaluator) => evaluator.rolesGuid ?? [])
      .reduce((acc, cur) => acc.concat(cur)) : [];

    const reqBody = {
      organizationsGuidList: organizationsGuidList,
      sectionsGuidList: sectionsGuidList,
      rolesGuidList: rolesGuidList,
    };

    await this.evaluatorsService
      .getNamesFromGuidLists(reqBody)
      .then((response) => {
        this.namesMapObject = response;
        this.loading = false;
      });
  }

  private prepareRolesGuidFormControl(rolesGuid: Array<string>) {
    const rolesGuidControlValue = this.rolesList.filter((role) =>
      rolesGuid.includes(role.guid)
    );
    this.evaluatorsForm.get("rolesGuid").patchValue(rolesGuidControlValue);
  }

  private patchRolesGuidFormControlWithNullValue() {
    this.evaluatorsForm
      .get("rolesGuid")
      .patchValue([this.evaluatorsService.rolesGuidNullValue]);
  }

  private updatePageReportTemplateTranslateParams() {
    this.pageReportTemplateTranslateParams = {
      first: this.pageState.first + 1,
      last: this.pageState.first + this.evaluatorsList.length,
      totalRecords: this.totalRecords,
    };
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
