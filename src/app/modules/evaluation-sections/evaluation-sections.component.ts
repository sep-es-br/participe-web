import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { EvaluationSectionsService } from "@app/shared/services/evaluation-sections.service";

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
  searchForm: FormGroup;

  data: any[] = [];

  entityList: any[] = [];
  sectionList: any[] = [];
  serverList: any[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private evaluationSectionsService: EvaluationSectionsService
  ) {}

  // get formControls(): Array<AbstractControl<any, any>> {
  //   const keys = Object.keys(this.evaluatorsForm.controls);

  //   return keys.map((k) => this.evaluatorsForm.controls[k]);
  // }

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.getData();
  }

  public showSearchForm() {
    this.search = !this.search;
    this.initSearchForm();
  }

  public showCreateEvaluator(data?: any) {
    console.log("create");
    this.showForm = true;

    this.initEvaluatorsForm();

    if (data) {
      this.prepareEvaluatorsForm(data);
    }
  }

  public showEdit(data: any) {
    console.log("edit");
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

  public initEvaluatorsForm(data?: any) {
    this.evaluatorsForm = new FormGroup({
      entity: new FormControl(""),
      sections: new FormControl([]),
      servers: new FormControl([]),
    });

    console.log(this.evaluatorsForm.value);

    this.getEntityList();
  }

  public entityChanged(event: any) {
    // fazer GET para endpoint de setores passando event.value como queryParam
    // ex: localhost:8080/participe/setores?orgao=algumacoisa

    console.log(event.value);
    this.getSectionList();
  }

  public sectionsChanged(event: any) {
    // fazer GET para endpoint de servidores passando event.value como queryParam
    // ex: localhost:8080/participe/servidores?setor=algumacoisa

    console.log(event.value);
    this.getServerList();
  }

  public searchEvaluators() {
    console.log(this.searchForm.value);
  }

  public saveEvaluatorsForm() {
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

  private getData() {
    this.data = this.evaluationSectionsService.getEvaluationSectionsMock();
  }

  private getEntityList() {
    this.entityList = this.evaluationSectionsService.getEntityListMock();
  }
  private getSectionList() {
    this.sectionList = this.evaluationSectionsService.getSectionListMock();
  }
  private getServerList() {
    this.serverList = this.evaluationSectionsService.getServerListMock();
  }

  private prepareEvaluatorsForm(data: any) {
    this.evaluatorsForm.get("entity").patchValue(data.entity);
    this.evaluatorsForm.get("sections").patchValue(data.section.split(","));
    this.evaluatorsForm.get("servers").patchValue(data.server.split(","));

    console.log(this.evaluatorsForm.value);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
