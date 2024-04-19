import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from "@app/app-routing.module";
import { ComponentsModule } from "@app/shared/components/components.module";
import { CoreModule } from "@app/core/core.module";
import { TranslateModule } from "@ngx-translate/core";
import { ProposalEvaluationComponent } from "./proposal-evaluation.component";

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule,
  ],
  declarations: [ProposalEvaluationComponent],
  exports: [ProposalEvaluationComponent],
  providers: [],
})
export class ProposalEvaluationModule {}
