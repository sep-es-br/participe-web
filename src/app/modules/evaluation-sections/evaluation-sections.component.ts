import { Component, OnDestroy, OnInit } from "@angular/core";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";

@Component({
  selector: "app-evaluation-sections",
  standalone: false,
  templateUrl: "./evaluation-sections.component.html",
  styleUrl: "./evaluation-sections.component.scss",
})
export class EvaluationSectionsComponent implements OnInit, OnDestroy {
  search = false;
  showForm = false;

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.buildBreadcrumb();
  }

  public showCreateEvaluator(data?: any) {
    console.log("create");
    if (data) {
      console.log(data);
    }

    this.showForm = true
  }

  public showEdit(data: any) {
    console.log("edit");
    console.log(data);
  }

  public delete(data: any) {
    console.log("delete");
    console.log(data);
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

  ngOnDestroy(): void {
    this.breadcrumbService.setItems([]);
  }
}
