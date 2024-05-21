import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { TranslateService } from "@ngx-translate/core";

import { ConfirmationService, MessageService } from "primeng/api";

import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { EvaluationSectionsService } from "@app/shared/services/evaluation-sections.service";
import {
  IEvaluationSection,
  IEvaluationSectionCreate,
} from "@app/shared/interface/IEvaluationSection";
import {
  IEvaluatorOrganization,
  IEvaluatorSection,
  IEvaluatorServer,
} from "@app/shared/interface/IEvaluatorData";
import { DropdownChangeEvent } from "primeng/dropdown";
import { MultiSelectChangeEvent } from "primeng/multiselect";

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

  evaluationSectionsList: Array<IEvaluationSection> = [];

  organizationsList: Array<IEvaluatorOrganization> = [];
  sectionsList: Array<IEvaluatorSection> = [];
  serversList: Array<IEvaluatorServer> = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private evaluationSectionsService: EvaluationSectionsService
  ) {}

  async ngOnInit() {
    this.buildBreadcrumb();
    // await this.getEvaluationSectionsList();
    await this.getOrganizationsList();
  }

  public showSearchForm() {
    this.search = !this.search;
    this.initSearchForm();
  }

  public showCreateEvaluator() {
    this.editEvaluatorSection = false;
    this.showForm = true;

    this.initCreateEvaluatorsForm();
    this.formHeaderText = "evaluation-section.new";
  }

  public showEditEvaluator(data: IEvaluationSection) {
    this.editEvaluatorSection = true;
    this.showForm = true;

    console.log(data);

    this.initEditEvaluatorsForm(data);
    this.formHeaderText = "evaluation-section.edit";
  }

  public async deleteEvaluator(data: IEvaluationSection) {
    this.confirmationService.confirm({
      message: this.translateService.instant(
        "evaluation-section.confirm.delete",
        { name: data.organizationGuid }
      ),
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
      await this.addToServersList(targetSection.guid);
    } else {
      await this.removeFromServerList(targetSection);
    }
  }

  public sectionsCleared() {
    this.serversList = [];
    this.evaluatorsForm.get("serversGuid").setValue(null);
  }

  public searchEvaluators() {
    console.log(this.searchForm.value);
  }

  public cancelForm() {
    this.showForm = false;
    this.editEvaluatorSection = false;
    this.evaluatorsForm = null;
    this.sectionsList = [];
    this.serversList = [];
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

    const reqBody: IEvaluationSectionCreate = {
      organizationGuid: form.value["organizationGuid"],
      sectionsGuid: form.value["sectionsGuid"].join(","),
      serversGuid: !!form.value["serversGuid"]
        ? form.value["serversGuid"].join(",")
        : null,
    };

    if (this.editEvaluatorSection && this.evaluationSectionId) {
      await this.putEvaluatorsForm(this.evaluationSectionId, reqBody);
    } else {
      await this.postEvaluatorsForm(reqBody);
    }
  }

  private async postEvaluatorsForm(reqBody: IEvaluationSectionCreate) {
    try {
      const result = await this.evaluationSectionsService.postEvaluationSection(
        reqBody
      );

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluation-section.inserted", {
          name: result.organizationGuid,
        }),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant(
          "evaluation-section.error.saving"
        ),
      });
    } finally {
      this.cancelForm();
      await this.getEvaluationSectionsList();
    }
  }

  private async putEvaluatorsForm(
    id: number,
    reqBody: IEvaluationSectionCreate
  ) {
    try {
      const result = await this.evaluationSectionsService.putEvaluationSection(
        id,
        reqBody
      );

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluation-section.updated", {
          name: result.organizationGuid,
        }),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant(
          "evaluation-section.error.saving"
        ),
      });
    } finally {
      this.cancelForm();
      await this.getEvaluationSectionsList();
    }
  }

  private async deleteEvaluationSection(id: number) {
    try {
      const result =
        await this.evaluationSectionsService.deleteEvaluationSection(id);

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
        // detail: this.translateService.instant("evaluation-section.warn.algumacoisa"), // Possíveis erros ao deletar a setor avaliador
      });
    } finally {
      await this.getEvaluationSectionsList();
    }
  }

  private initSearchForm() {
    this.searchForm = new FormGroup({
      searchOrganization: new FormControl(""),
      searchSection: new FormControl(""),
      searchServer: new FormControl(""),
    });
  }

  private initCreateEvaluatorsForm() {
    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl("", Validators.required),
      sectionsGuid: new FormControl("", Validators.required),
      serversGuid: new FormControl(""),
    });
  }

  private async initEditEvaluatorsForm(data: IEvaluationSection) {
    this.evaluationSectionId = data.id;

    const sectionsGuidFormControl = data.sectionsGuid.includes(",")
      ? data.sectionsGuid.split(",")
      : data.sectionsGuid.split(" ");

    const serversGuidFormControl = !data.serversGuid
      ? ""
      : data.serversGuid.includes(",")
      ? data.serversGuid.split(",")
      : data.serversGuid.split(" ");

    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl(
        data.organizationGuid,
        Validators.required
      ),
      sectionsGuid: new FormControl(
        sectionsGuidFormControl,
        Validators.required
      ),
      serversGuid: new FormControl(serversGuidFormControl),
    });

    await this.getSectionsList(data.organizationGuid);

    data.sectionsGuid
      .split(",")
      .forEach((server) => this.addToServersList(server));

    // this.serversList = await this.getServersList(data.sectionsGuid);
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "administration.label" },
      {
        label: "administration.evaluation-sections",
        routerLink: ["/administration/evaluation-sections"],
      },
    ]);
  }

  private async getEvaluationSectionsList() {
    this.evaluationSectionsList =
      await this.evaluationSectionsService.getEvaluationSectionsList();

    console.log(this.evaluationSectionsList);
  }

  private async getOrganizationsList() {
    this.organizationsList =
      await this.evaluationSectionsService.getOrganizationsList();
  }

  private async getSectionsList(orgGuid: string) {
    this.sectionsList = await this.evaluationSectionsService.getSectionsList(
      orgGuid
    );
  }

  private async getServersList(
    unitGuid: string
  ): Promise<Array<IEvaluatorServer>> {
    const response = await this.evaluationSectionsService.getServersList(
      unitGuid
    );

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

  private async addToServersList(unitGuid: string) {
    await this.getServersList(unitGuid).then((response) => {
      if (response) {
        this.serversList = this.serversList.concat(response);
      }
    });
  }

  private async removeFromServerList(unitGuid: string) {
    await this.getServersList(unitGuid).then((response) => {
      if (response) {
        response.forEach((target) => {
          const targetServer = this.serversList.find(
            (server) => server == target
          );
          this.serversList.splice(this.serversList.indexOf(targetServer), 1);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
