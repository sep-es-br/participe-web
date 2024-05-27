import {
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { TranslateService } from "@ngx-translate/core";

import { ConfirmationService, MessageService } from "primeng/api";

import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";
import { IEvaluator } from "@app/shared/interface/IEvaluator";
import {
  IEvaluatorOrganization,
  IEvaluatorSection,
  IEvaluatorRole,
} from "@app/shared/interface/IEvaluatorData";
import { DropdownChangeEvent } from "primeng/dropdown";
import { MultiSelectChangeEvent } from "primeng/multiselect";
import { EvaluatorCreateFormModel } from "@app/shared/models/EvaluatorModel";

@Component({
  selector: "app-evaluators",
  standalone: false,
  templateUrl: "./evaluators.component.html",
  styleUrl: "./evaluators.component.scss",
})
export class EvaluatorsComponent implements OnInit, OnDestroy {
  loading = false;

  search = false;
  showForm = false;

  evaluatorsForm: FormGroup;
  formHeaderText: string = "";
  evaluationSectionId: number;
  editEvaluatorSection: boolean = false;

  searchForm: FormGroup;

  evaluatorsList: Array<IEvaluator> = [];

  organizationsList: Array<IEvaluatorOrganization> = [];
  sectionsList: Array<IEvaluatorSection> = [];
  rolesList: Array<IEvaluatorRole> = [];

  namesMapObject: { [key: string]: string } = {};

  constructor(
    private breadcrumbService: BreadcrumbService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private evaluatorsService: EvaluatorsService
  ) {}

  async ngOnInit() {
    this.buildBreadcrumb();
    await this.getEvaluatorsList();
    await this.getOrganizationsList();
  }

  public showSearchForm() {
    this.search = !this.search;
    this.initSearchForm();
  }

  public showCreateEvaluator() {
    this.sectionsList = [];
    this.rolesList = [];

    this.editEvaluatorSection = false;
    this.showForm = true;

    this.initCreateEvaluatorsForm();
    this.formHeaderText = "evaluator.new";
  }

  public showEditEvaluator(data: IEvaluator) {
    this.editEvaluatorSection = true;
    this.showForm = true;

    console.log(data);

    // this.initEditEvaluatorsForm(data);
    this.formHeaderText = "evaluator.edit";
  }

  public async deleteEvaluator(data: IEvaluator) {
    this.confirmationService.confirm({
      message: this.translateService.instant("evaluator.confirm.delete", {
        name: data.organizationGuid,
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
    this.evaluatorsForm.get("rolesGuid").setValue(null);
  }

  public searchEvaluators() {
    console.log(this.searchForm.value);
  }

  public cancelForm() {
    this.showForm = false;
    this.editEvaluatorSection = false;
    this.evaluatorsForm = null;
  }

  public getOrganizationName(orgGuid: string): string {
    return this.namesMapObject[orgGuid];
  }

  public getSectionNames(sectionsGuid: Array<string>): Array<string> {
    return sectionsGuid.map((section) => this.namesMapObject[section]);
  }

  public getRoleNames(rolesGuid: Array<string>): Array<string> {
    return rolesGuid.map((role) => this.namesMapObject[role]);
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

    console.log(reqBody);

    // if (this.editEvaluatorSection && this.evaluationSectionId) {
    //   await this.putEvaluatorsForm(this.evaluationSectionId, reqBody);
    // } else {
    //   await this.postEvaluatorsForm(reqBody);
    // }
  }

  private async postEvaluatorsForm(reqBody: EvaluatorCreateFormModel) {
    try {
      const result = await this.evaluatorsService.postEvaluator(reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluator.inserted", {
          name: result.organizationGuid,
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
          name: result.organizationGuid,
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
        // detail: this.translateService.instant("evaluator.warn.algumacoisa"), // Possíveis erros ao deletar a setor avaliador
      });
    } finally {
      await this.getEvaluatorsList();
    }
  }

  private initSearchForm() {
    this.searchForm = new FormGroup({
      searchOrganization: new FormControl(""),
      searchSection: new FormControl(""),
      searchRole: new FormControl(""),
    });
  }

  private initCreateEvaluatorsForm() {
    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl("", Validators.required),
      sectionsGuid: new FormControl([], Validators.required),
      rolesGuid: new FormControl([]),
    });
  }

  // private async initEditEvaluatorsForm(data: IEvaluator) {
  //   this.evaluationSectionId = data.id;

  //   const sectionsGuidFormControl = data.sectionsGuid.includes(",")
  //     ? data.sectionsGuid.split(",")
  //     : data.sectionsGuid.split(" ");

  //   const serversGuidFormControl = !data.serversGuid
  //     ? ""
  //     : data.serversGuid.includes(",")
  //     ? data.serversGuid.split(",")
  //     : data.serversGuid.split(" ");

  //   this.evaluatorsForm = new FormGroup({
  //     organizationGuid: new FormControl(
  //       data.organizationGuid,
  //       Validators.required
  //     ),
  //     sectionsGuid: new FormControl(
  //       sectionsGuidFormControl,
  //       Validators.required
  //     ),
  //     serversGuid: new FormControl(serversGuidFormControl),
  //   });

  //   await this.getSectionsList(data.organizationGuid);

  //   data.sectionsGuid
  //     .split(",")
  //     .forEach((server) => this.addToServersList(server));

  //   // this.serversList = await this.getServersList(data.sectionsGuid);
  // }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "administration.label" },
      {
        label: "administration.evaluators",
        routerLink: ["/administration/evaluators"],
      },
    ]);
  }

  private async getEvaluatorsList() {
    await this.evaluatorsService.getEvaluatorsList().then((response) => {
      this.evaluatorsList = response;
      this.prepareEvaluatorsTable();
    });

    // console.log(this.evaluatorsList);
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
        // summary: this.translateService.instant("error"),
        summary: "Atenção!",
        // detail: this.translateService.instant("erro.invalid.data"),
        detail: "A unidade não possui papéis atrelados á ela.",
      });
    } else {
      return response;
    }
  }

  private async addToRolesList(unitGuid: string) {
    await this.getRolesList(unitGuid).then((response) => {
      if (response) {
        this.rolesList.push(this.getRolesGuidNullValue());
        this.rolesList = this.rolesList.concat(response);
        this.evaluatorsForm
          .get("rolesGuid")
          .patchValue([this.getRolesGuidNullValue()]);
      }
    });
  }

  private async removeFromRolesList(unitGuid: string) {
    await this.getRolesList(unitGuid).then((response) => {
      if (response) {
        this.rolesList.splice(
          this.rolesList.findIndex((role) => role.name == "Todos"),
          1
        );
        response.forEach((target) => {
          const targetRole = this.rolesList.find((role) => role == target);
          this.rolesList.splice(this.rolesList.indexOf(targetRole), 1);
        });
        this.evaluatorsForm
          .get("rolesGuid")
          .patchValue([this.getRolesGuidNullValue()]);
      }
    });
  }

  private async prepareEvaluatorsTable() {
    const organizationsGuidList = this.evaluatorsList.map(
      (evaluator) => evaluator.organizationGuid
    );

    const sectionsGuidList = this.evaluatorsList
      .map((evaluator) => evaluator.sectionsGuid)
      .reduce((acc, cur) => acc.concat(cur));

    const rolesGuidList = this.evaluatorsList
      .map((evaluator) => evaluator.rolesGuid)
      .reduce((acc, cur) => acc.concat(cur));

    const reqBody = {
      organizationsGuidList: organizationsGuidList,
      sectionsGuidList: sectionsGuidList,
      rolesGuidList: rolesGuidList,
    };

    await this.evaluatorsService
      .getNamesFromGuidLists(reqBody)
      .then((response) => (this.namesMapObject = response));
  }

  private getRolesGuidNullValue(): IEvaluatorRole {
    return this.evaluatorsService.rolesGuidNullValue;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
