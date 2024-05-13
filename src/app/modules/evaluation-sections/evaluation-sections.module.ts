import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "@app/app-routing.module";
import { CoreModule } from "@app/core/core.module";
import { TranslateModule } from "@ngx-translate/core";
import { EvaluationSectionsComponent } from "./evaluation-sections.component";
import { ComponentsModule } from "@app/shared/components/components.module";

@NgModule({
  imports: [AppRoutingModule, CommonModule, CoreModule, TranslateModule, ComponentsModule],
  declarations: [EvaluationSectionsComponent],
  exports: [EvaluationSectionsComponent],
})
export class EvaluationSectionsModule {}