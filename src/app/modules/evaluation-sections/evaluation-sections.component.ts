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

@Component({
  selector: "app-evaluation-sections",
  standalone: false,
  templateUrl: "./evaluation-sections.component.html",
  styleUrl: "./evaluation-sections.component.scss",
})
export class EvaluationSectionsComponent implements OnInit, OnDestroy {
  loading = false;

  search = false;
  showForm = false;

  evaluatorsForm: FormGroup;
  formHeaderText: string = "";
  evaluationSectionId: number;
  editEvaluatorSection: boolean = false;

  searchForm: FormGroup;

  evaluationSectionsList: Array<IEvaluationSection> = [];

  organizationsList = [];
  sectionsList = [];
  serversList = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private evaluationSectionsService: EvaluationSectionsService
  ) {}

  async ngOnInit() {
    this.buildBreadcrumb();
    await this.getEvaluationSectionsList();
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

  public organizationChanged(event: any) {
    // fazer GET para endpoint de setores passando event.value como queryParam
    // ex: localhost:8080/participe/setores?orgao=algumacoisa

    console.log(event.value);
    this.getSectionsList();
  }

  public sectionsChanged(event: any) {
    // fazer GET para endpoint de servidores passando event.value como queryParam
    // ex: localhost:8080/participe/servidores?setor=algumacoisa

    console.log(event.value);
    this.getServersList();
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

    this.getOrganizationsList();
  }

  private initEditEvaluatorsForm(data: IEvaluationSection) {
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

    this.getOrganizationsList();
    this.getSectionsList();
    this.getServersList();
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
    await this.evaluationSectionsService
      .getEvaluationSectionsList()
      .then((response) => (this.evaluationSectionsList = response));
  }

  private getOrganizationsList() {
    this.organizationsList =
      this.evaluationSectionsService.getOrganizationsMockList();
  }
  private getSectionsList() {
    this.sectionsList = this.evaluationSectionsService.getSectionsMockList();
  }
  private getServersList() {
    this.serversList = this.evaluationSectionsService.getServersMockList();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
