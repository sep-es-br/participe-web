import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import {
  IEvaluationSection,
  IEvaluationSectionCreate,
} from "@app/shared/interface/IEvaluationSection";
import { EvaluationSectionsService } from "@app/shared/services/evaluation-sections.service";
import { TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";

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

  // entityList: any[] = [];
  // sectionList: any[] = [];
  // serverList: any[] = [];

  organizationsList = [];
  sectionsList = [];
  serversList = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private evaluationSectionsService: EvaluationSectionsService
  ) {}

  // get formControls(): Array<AbstractControl<any, any>> {
  //   const keys = Object.keys(this.evaluatorsForm.controls);

  //   return keys.map((k) => this.evaluatorsForm.controls[k]);
  // }

  async ngOnInit() {
    this.buildBreadcrumb();
    await this.getEvaluationSectionsList();
  }

  public showSearchForm() {
    this.search = !this.search;
    this.initSearchForm();
  }

  public showCreateEvaluator(data?: IEvaluationSection) {
    console.log("create");
    this.editEvaluatorSection = false;
    this.showForm = true;

    this.initCreateEvaluatorsForm();
    this.formHeaderText = "Novo Avaliador";

    if (data) {
      this.prepareCreateEvaluatorsForm(data);
      this.formHeaderText = data.organizationGuid + " > Novo Avaliador";
    }
  }

  public showEdit(data: IEvaluationSection) {
    console.log("edit");
    this.editEvaluatorSection = true;
    this.showForm = true;

    // this.initEvaluatorsForm(data)
    this.formHeaderText = "Editar AValiador";

    console.log(data);
  }

  public delete(data: any) {
    console.log("delete");
    console.log(data);
  }

  public initSearchForm() {
    this.searchForm = new FormGroup({
      entity: new FormControl(""),
      section: new FormControl(""),
      server: new FormControl(""),
    });
  }

  public loadingIcon(icon = "pi pi-check") {
    return this.loading ? "pi pi-spin pi-spinner" : icon;
  }

  public orgChanged(event: any) {
    // fazer GET para endpoint de setores passando event.value como queryParam
    // ex: localhost:8080/participe/setores?orgao=algumacoisa

    console.log(event.value);

    // this.getSectionList();
    this.getSectionsList();
  }

  public sectionsChanged(event: any) {
    // fazer GET para endpoint de servidores passando event.value como queryParam
    // ex: localhost:8080/participe/servidores?setor=algumacoisa

    console.log(event.value);
    // this.getServerList();
    this.getServersList();
  }

  public searchEvaluators() {
    console.log(this.searchForm.value);
  }

  public cancelForm() {
    this.showForm = false;
  }

  public async saveEvaluatorsForm(form: FormGroup) {
    // console.log(form.value);

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

    console.log(reqBody);

    if (this.editEvaluatorSection) {
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

      // console.log(result)

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluation-section.inserted"),
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

      // console.log(result)

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("evaluation-section.updated"),
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
    }
  }

  /*
    Alterar valores:
    entity -> organizationName (?)
    sections -> sectionsNames (?)
    servers -> serversNames (?)
  */
  private initCreateEvaluatorsForm(data?: IEvaluationSection) {
    this.evaluatorsForm = new FormGroup({
      organizationGuid: new FormControl(
        data?.organizationGuid ?? "",
        Validators.required
      ),
      sectionsGuid: new FormControl(
        data?.sectionsGuid?.split(",") ?? "",
        Validators.required
      ),
      serversGuid: new FormControl(data?.serversGuid?.split(",") ?? ""),
    });

    console.log(this.evaluatorsForm.value);

    // this.getEntityList();
    this.getOrganizationsList();
  }

  private prepareCreateEvaluatorsForm(data: IEvaluationSection) {
    this.evaluationSectionId = data.id;

    this.evaluatorsForm
      .get("organizationGuid")
      .patchValue(data.organizationGuid);
    this.evaluatorsForm.get("organizationGuid").disable();
    // this.evaluatorsForm.get("sections").patchValue(data.sections.split(","));
    // this.evaluatorsForm.get("servers").patchValue(data.servers.split(","));

    console.log(this.evaluatorsForm.value);
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

  // private getEntityList() {
  //   this.entityList = this.evaluationSectionsService.getEntityListMock();
  // }
  // private getSectionList() {
  //   this.sectionList = this.evaluationSectionsService.getSectionListMock();
  // }
  // private getServerList() {
  //   this.serverList = this.evaluationSectionsService.getServerListMock();
  // }

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
