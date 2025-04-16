import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from "@app/app-routing.module";
import { ComponentsModule } from "@app/shared/components/components.module";
import { CoreModule } from "@app/core/core.module";
import { TranslateModule } from "@ngx-translate/core";
import { ProposalEvaluationComponent } from "./proposal-evaluation.component";
import { ProposalComponent } from "./proposal/proposal.component";
import { EvaluateComponent } from "./evaluate/evaluate.component";

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule,
  ],
  declarations: [
    ProposalComponent,
    ProposalEvaluationComponent,
    EvaluateComponent,
  ],
  exports: [ProposalComponent, ProposalEvaluationComponent, EvaluateComponent],
  providers: [],
})
export class ProposalEvaluationModule {}

