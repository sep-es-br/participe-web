import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ConfirmationService, MessageService } from "primeng/api";
import { RadioButtonClickEvent } from "primeng/radiobutton";
import { TranslateService } from "@ngx-translate/core";

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";

import { IProposal } from "@app/shared/interface/IProposal";

import {
  ProposalEvaluationModel,
  ProposalEvaluationCreateFormModel,
} from "@app/shared/models/ProposalEvaluationModel";

import { StoreKeys } from "@app/shared/constants";

@Component({
  selector: "app-evaluate",
  standalone: false,
  templateUrl: "./evaluate.component.html",
  styleUrl: "./evaluate.component.scss",
})
export class EvaluateComponent implements OnInit, OnDestroy {
  public loading: boolean = false;

  private proposalId: number;
  public proposal: IProposal;
  public evaluatorOrgGuid: string;

  private evaluationId: number;

  public proposalEvaluationForm: FormGroup;

  public editProposalEvaluation: boolean = false;
  public readOnlyProposalEvaluation: boolean = false;

  public domainConfigNames: Object = {};
  public orgGuidNameMapObj: {[key: string]: string} = {};

  public budgetUnitOptions: Array<string> = [];
  public budgetActionOptions: Array<string> = [];
  public budgetPlanOptions: Array<string> = [];
  public reasonOptions: Array<string> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    this.proposalId = Number(this.route.snapshot.params["proposalId"]);

    this.evaluatorOrgGuid = String(sessionStorage.getItem("evaluatorOrgGuid"));

    this.proposal = JSON.parse(sessionStorage.getItem("proposalData"));

    this.readOnlyProposalEvaluation = this.proposal.evaluationStatus;

    this.domainConfigNames = JSON.parse(
      sessionStorage.getItem("domainConfigNames")
    );

    this.orgGuidNameMapObj = this.proposalEvaluationService.orgGuidNameMapObj;
  }

  public async ngOnInit() {
    await this.getProposalEvaluationData();
    // await this.testFetchBudgetConfig();
  }

  // public async testFetchBudgetConfig() {
  //   await this.proposalEvaluationService.testFetchBudgetConfig().then(
  //     response => console.log(response)
  //   )
  // }

  public getOrgName(index: number): string {
    const guid = this.readOnlyProposalEvaluation ? this.proposal.evaluatorOrgsNameList[0] : this.evaluatorOrgGuid
    return this.orgGuidNameMapObj[guid].split("-")[index].trim();
  }

  public get formLoaIncluded(): boolean {
    return this.proposalEvaluationForm.get("includedInNextYearLOA").value;
  }

  public loaChanged(event: RadioButtonClickEvent) {
    this.patchProposalEvaluationFormValue(event.value);
  }

  public get formBudgetUnit(): string {
    return (
      this.proposalEvaluationForm.get("budgetUnit").value
    );
  }

  public get formBudgetAction(): string {
    return (
      this.proposalEvaluationForm.get("budgetAction").value
    );
  }

  public get formBudgetPlan(): string {
    return (
      this.proposalEvaluationForm.get("budgetPlan").value
    );
  }

  public get formReason(): string {
    return this.proposalEvaluationForm.get("reason").value;
  }

  public switchEdit() {
    this.readOnlyProposalEvaluation = false;
    this.editProposalEvaluation = true
  }

  public async delete() {
    this.confirmationService.confirm({
      message: this.translateService.instant("propeval.confirm.delete", {
        name: this.proposal.description,
      }),
      key: "deleteProposalEvaluation",
      acceptLabel: this.translateService.instant("yes"),
      rejectLabel: this.translateService.instant("no"),
      accept: async () => {
        await this.deleteProposalEvaluation(this.evaluationId);
      },
      reject: () => {},
    });
  }

  public async saveProposalEvaluation(form: FormGroup) {
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

    console.log(form.value);

    const reqBody = new ProposalEvaluationCreateFormModel(form.value);
    reqBody.personId = JSON.parse(localStorage.getItem(StoreKeys.USER_INFO))[
      "id"
    ];
    reqBody.proposalId = this.proposalId;
    reqBody.representing = this.evaluatorOrgGuid;

    console.log(reqBody);

    // LÓGICA ERRADA
    // switchMode() LIBERA FORMULARIO, MAS SE editPropEval = false CHAMA METODO POST!!!

    if (this.editProposalEvaluation) {
      await this.putProposalEvaluation(this.evaluationId, reqBody);
    } else {
      await this.postProposalEvaluation(reqBody);
    }
  }

  public cancel(): void {
    this.router.navigate(["proposal-evaluation"]);
  }

  private initCreateProposalForm() {
    this.proposalEvaluationForm = new FormGroup({
      includedInNextYearLOA: new FormControl(null, Validators.required),
      budgetUnit: new FormControl(null),
      budgetAction: new FormControl(null),
      budgetPlan: new FormControl(null),
      reason: new FormControl(null),
    });

    this.populateOptionsLists();
  }

  private initEditProposalForm(
    proposalEvaluationData: ProposalEvaluationModel
  ) {
    this.proposalEvaluationForm = new FormGroup({
      includedInNextYearLOA: new FormControl(
        proposalEvaluationData.includedInNextYearLOA,
        Validators.required
      ),
      budgetUnit: new FormControl(proposalEvaluationData.budgetUnitControlValue),
      budgetAction: new FormControl(proposalEvaluationData.budgetActionControlValue),
      budgetPlan: new FormControl(proposalEvaluationData.budgetPlan),
      reason: new FormControl(proposalEvaluationData.reason),
    });

    this.populateOptionsLists();
  }

  private populateOptionsLists() {
    this.budgetUnitOptions =
      this.proposalEvaluationService.populateBudgetUnitOptions();
    this.budgetActionOptions =
      this.proposalEvaluationService.populateBudgetActionOptions();
    this.budgetPlanOptions =
      this.proposalEvaluationService.populateBudgetPlanOptions();
    this.reasonOptions = this.proposalEvaluationService.populateReasonOptions();
  }

  /*
          !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    NÃO CONSTRÓI budgetUnitName E budgetActionName 
          !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  */
  private async getProposalEvaluationData() {
    try {
      this.loading = true;
      await this.proposalEvaluationService
        .getProposalEvaluationData(this.proposalId)
        .then((response) => {
          // console.log(this.readOnlyProposalEvaluation)

          
          const proposalEvaluationModel = new ProposalEvaluationModel(response);
          // console.log(response)
          // console.log(proposalEvaluationModel)
          this.evaluationId = proposalEvaluationModel.id
          this.readOnlyProposalEvaluation
            ? this.initEditProposalForm(proposalEvaluationModel)
            : this.initCreateProposalForm();
        });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("propeval.error.fetchData"),
      });
    } finally {
      this.loading = false;
    }
  }

  private patchProposalEvaluationFormValue(loaIncluded: boolean): void {
    const budgetUnitControl = this.proposalEvaluationForm.get("budgetUnit");
    const budgetActionControl = this.proposalEvaluationForm.get("budgetAction");
    const budgetPlanControl = this.proposalEvaluationForm.get("budgetPlan");
    const reasonControl = this.proposalEvaluationForm.get("reason");

    if (!loaIncluded) {
      budgetUnitControl.patchValue(null);
      budgetUnitControl.clearValidators();

      budgetActionControl.patchValue(null);
      budgetActionControl.clearValidators();

      budgetPlanControl.patchValue(null);
      budgetPlanControl.clearValidators();

      reasonControl.addValidators(Validators.required);
    } else {
      reasonControl.patchValue(null);
      reasonControl.clearValidators();

      budgetUnitControl.addValidators(Validators.required);
      budgetActionControl.addValidators([
        Validators.required,
        Validators.maxLength(3),
      ]);
      budgetPlanControl.addValidators(Validators.required);
    }

    budgetUnitControl.updateValueAndValidity();
    budgetActionControl.updateValueAndValidity();
    budgetPlanControl.updateValueAndValidity();
    reasonControl.updateValueAndValidity();
  }

  private async postProposalEvaluation(
    reqBody: ProposalEvaluationCreateFormModel
  ) {
    try {
      const result =
        await this.proposalEvaluationService.postProposalEvaluation(reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("propeval.inserted"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("propeval.error.saving"),
      });
    } finally {
      this.cancel();
    }
  }

  private async putProposalEvaluation(
    id: number,
    reqBody: ProposalEvaluationCreateFormModel
  ) {
    try {
      const result = await this.proposalEvaluationService.putProposalEvaluation(
        id,
        reqBody
      );

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("propeval.updated"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant("propeval.error.saving"),
      });
    } finally {
      this.cancel();
    }
  }

  private async deleteProposalEvaluation(id: number) {
    try {
      const result =
        await this.proposalEvaluationService.deleteProposalEvaluation(
          id
        );

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
        detail: this.translateService.instant("erro.removing"),
      });
    } finally {
      this.cancel();
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem("proposalData");
    sessionStorage.removeItem("evaluatorOrgGuid");
  }
}
