import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ConfirmationService, MessageService } from "primeng/api";
import { RadioButtonClickEvent } from "primeng/radiobutton";
import { MultiSelectChangeEvent } from "primeng/multiselect";

import { TranslateService } from "@ngx-translate/core";
import { ModalService } from "@app/core/modal/modal.service";
import { ModalData } from "@app/shared/interface/IModalData";

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import {
  IBudgetAction,
  IBudgetPlan,
  IBudgetUnit,
  IProposal,
} from "@app/shared/interface/IProposal";

import {
  ProposalEvaluationModel,
  ProposalEvaluationCreateFormModel,
} from "@app/shared/models/ProposalEvaluationModel";

import { StoreKeys } from "@app/shared/constants";
import { combineLatest } from "rxjs";

@Component({
  selector: "app-evaluate",
  standalone: false,
  templateUrl: "./evaluate.component.html",
  styleUrl: "./evaluate.component.scss",
})
export class EvaluateComponent implements OnInit, OnDestroy {
  public loading: boolean = true;

  public modalData: ModalData;

  private proposalId: number;
  public proposal: IProposal;
  public evaluatorOrgGuid: string;

  public isEvaluationOpen: boolean = false;

  private evaluationId: number;

  public orgNameList: boolean = false;
  public hasEvaluatorOrgGuid: boolean;
  public hasViewEvaluation: boolean = true;
  public orgHasPreference: boolean;
  public orgNamedropDownSelect: string;
  public orgName: string;
  public orgNameTag: string;
  public evaluatorName: string;

  public proposalEvaluationForm: FormGroup;
  public proposalEvaluationFormInitialState: ProposalEvaluationModel;

  public editProposalEvaluation: boolean = false;
  public readOnlyProposalEvaluation: boolean = false;

  public domainConfigNamesObj: Object = {};
  public organizationsGuidNameMapObject: { [key: string]: string } = {};
  public showSelectConference: boolean;

  public budgetUnitOptions: Array<IBudgetUnit> = [];
  public budgetActionOptions: Array<IBudgetAction> = [];
  public reasonOptions: Array<string> = [];

  public optionsData: Array<string>;
  public selectedOrg: any;

  budgetActionVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private evaluatorsService: EvaluatorsService,
    public modalService: ModalService,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    this.isEvaluationOpen = JSON.parse(
      sessionStorage.getItem("isEvaluationOpen")
    );

    this.proposalId = Number(this.route.snapshot.params["proposalId"]);

    this.evaluatorOrgGuid = String(sessionStorage.getItem("evaluatorOrgGuid"));

    if(sessionStorage.getItem("viewEvaluation")){
      if (!(sessionStorage.getItem("evaluatorOrgGuid") == sessionStorage.getItem("viewEvaluation"))) {
        this.hasViewEvaluation = false;
      }
    }

    if (sessionStorage.getItem("evaluatorOrgGuid")) {
      this.hasEvaluatorOrgGuid = true;
    }

    this.proposal = JSON.parse(sessionStorage.getItem("proposalData"));

    if(this.isEvaluationOpen == false || sessionStorage.getItem("viewEvaluation")){
      this.readOnlyProposalEvaluation = true
    }else{
      this.readOnlyProposalEvaluation =  this.proposal.evaluatorOrgsNameAndLoaIncludedList?.some(item => item.evaluatorOrgsName === this.evaluatorOrgGuid);
    }

    this.domainConfigNamesObj =
      this.proposalEvaluationService.domainConfigNamesObj;

    this.organizationsGuidNameMapObject =
      this.evaluatorsService.organizationsGuidNameMapObject;

    this.modalData = new ModalData(
      translateService.instant("proposal_evaluation.modalTitle"),
      {
        confirm: translateService.instant("proposal_evaluation.modalConfirm"),
        cancel: translateService.instant("proposal_evaluation.modalCancel"),
      },
      true
    );
  }

  public async ngOnInit() {
    await this.getProposalEvaluationData();
    this.populateOptionsLists();
    this.getOrgName();

    combineLatest([
      this.proposalEvaluationForm.controls.costType.valueChanges,
      this.proposalEvaluationForm.controls.newRequest.valueChanges
    ]).subscribe(([haveCost, newRequest]) => {
          this.updateBudgetPlanControlRequire();
          this.updateActionPlanControlRequire();
        })

  }

  updateActionPlanControlRequire() {
        this.budgetActionVisible = this.formHaveCost;
        
        if(this.budgetActionVisible) {
          this.proposalEvaluationForm.controls.budgetAction.addValidators(Validators.required);
        } else {
          this.proposalEvaluationForm.controls.budgetAction.patchValue(undefined);
          this.proposalEvaluationForm.controls.budgetAction.clearValidators();
        }
        
        this.proposalEvaluationForm.controls.budgetAction.updateValueAndValidity();
  }

  public getOrgName(): void {
    try {
      const guid =  this.evaluatorOrgGuid;
      if (!this.readOnlyProposalEvaluation) {
        if (!this.orgNameList) {
          this.orgNameTag = this.organizationsGuidNameMapObject[guid]
            .split("-")[1]
            .trim();
          this.orgName = this.organizationsGuidNameMapObject[guid]
            .split("-")[0]
            .trim();
        }
      } else {
        this.orgNameTag = this.organizationsGuidNameMapObject[guid]
          .split("-")[1]
          .trim();
        this.orgName = this.organizationsGuidNameMapObject[guid]
          .split("-")[0]
          .trim();
      }
    } catch (error) {
      this.router.navigate(["proposal-evaluation"]);
    }
  }

  public get showNewRequest() {
    return this.formHaveCost;
  }

  public get formLoaIncluded(): boolean {
    return this.proposalEvaluationForm.get("includedInNextYearLOA").value;
  }

  public loaChanged(event: RadioButtonClickEvent) {
    this.patchProposalEvaluationFormValue(event.value);
  }

  public get formBudgetUnit(): Array<IBudgetUnit> {
    return this.proposalEvaluationForm.get("budgetUnit").value;
  }

  public budgetUnitChanged(event: MultiSelectChangeEvent): void {
    const budgetUnitIdValues = event.value.map((item) => item.budgetUnitId);

    this.budgetActionOptions =
      this.proposalEvaluationService.getBudgetActionListByBudgetUnitId(
        budgetUnitIdValues
      );

    this.proposalEvaluationForm.get("budgetAction").patchValue(null);
  }

  public budgetUnitCleared() {
    this.budgetActionOptions = [];
    this.proposalEvaluationForm.get("budgetAction").patchValue(null);
  }

  public formatBudgetUnit(value: IBudgetUnit): string {
    return `${value.budgetUnitId} - ${value.budgetUnitName}`;
  }

  public get formBudgetAction(): Array<IBudgetAction> {
    return this.proposalEvaluationForm.get("budgetAction").value;
  }

  public formatBudgetAction(value: IBudgetAction): string {
    return `${value.budgetActionId} - ${value.budgetActionName}`;
  }

  public get formBudgetPlan(): string {
    return (
      this.proposalEvaluationForm.get("budgetPlan").value ??
      this.translateService.instant("proposal_evaluation.budgetPlan_nullValue")
    );
  }

  public get formReason(): string {
    return this.proposalEvaluationForm.get("reason").value;
  }

  public get formReasonDetail(): string {
    return this.proposalEvaluationForm.get("reasonDetail").value;
  }

  public get formHaveCost(): boolean {
    return !!this.proposalEvaluationForm.get("costType").value;
  }

  public get formNewRequest(): boolean {
    return this.proposalEvaluationForm.get("newRequest").value;
  }

  public switchEdit() {
    this.readOnlyProposalEvaluation = false;
    this.editProposalEvaluation = true;
  }

  public async delete() {
    this.confirmationService.confirm({
      message: this.translateService.instant(
        "proposal_evaluation.confirm.delete",
        {
          name: this.proposal.description,
        }
      ),
      key: "deleteProposalEvaluation",
      acceptLabel: this.translateService.instant("yes"),
      rejectLabel: this.translateService.instant("no"),
      accept: async () => {
        await this.deleteProposalEvaluation(this.proposalId);
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

    const reqBody = new ProposalEvaluationCreateFormModel(
      form.value,
      JSON.parse(localStorage.getItem(StoreKeys.USER_INFO))["id"],
      this.proposalId,
      this.evaluatorOrgGuid,
      this.orgNameTag,
      this.orgName,
      this.evaluatorName
    );

    if(reqBody.includedInNextYearLOA){
      if (!this.checkFormChanged(reqBody)) {
        this.messageService.add({
          severity: "warn",
          summary: this.translateService.instant("attention"),
          detail: this.translateService.instant(
            "proposal_evaluation.error.identicalForm"
          ),
        });

        return;
      }
    }

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
      includedInNextYearLOA: new FormControl<boolean>(
        null,
        Validators.required
      ),
      budgetUnit: new FormControl<Array<IBudgetUnit>>(null),
      budgetAction: new FormControl<Array<IBudgetAction>>(null),
      budgetPlan: new FormControl<Array<IBudgetPlan>>(null),
      reason: new FormControl<string>(null),
      reasonDetail: new FormControl<string>(null),
      costType: new FormControl<boolean>(undefined),
      newRequest: new FormControl<boolean>(false)
    });
  }

  private initEditProposalForm(
    proposalEvaluationData: ProposalEvaluationModel
  ) {
    if (proposalEvaluationData.includedInNextYearLOA) {
      const budgetUnitIdArray = proposalEvaluationData.budgetUnitId.includes(
        ";"
      )
        ? proposalEvaluationData.budgetUnitId.split(";")
        : [proposalEvaluationData.budgetUnitId];

      this.budgetActionOptions =
        this.proposalEvaluationService.getBudgetActionListByBudgetUnitId(
          budgetUnitIdArray
        );
    }

    this.proposalEvaluationForm = new FormGroup({
      includedInNextYearLOA: new FormControl<boolean>(
        proposalEvaluationData.includedInNextYearLOA,
        Validators.required
      ),
      budgetUnit: new FormControl<Array<IBudgetUnit>>(
        proposalEvaluationData.budgetUnitControlValue
      ),
      budgetAction: new FormControl<Array<IBudgetAction>>(
        proposalEvaluationData.budgetActionControlValue
      ),
      budgetPlan: new FormControl<string>(proposalEvaluationData.budgetPlan),
      reason: new FormControl<string>(proposalEvaluationData.reason),
      reasonDetail: new FormControl<string>(proposalEvaluationData.reasonDetail),
      costType: new FormControl<string>(proposalEvaluationData.costType),
      newRequest: new FormControl<boolean>(proposalEvaluationData.newRequest)
    });

    this.evaluatorName = proposalEvaluationData.evaluatorName;
  }

  private async getProposalEvaluationData() {
    if(sessionStorage.getItem("viewEvaluation")){
      this.evaluatorOrgGuid = sessionStorage.getItem("viewEvaluation");
    }

    try {
      await this.proposalEvaluationService
        .getProposalEvaluationData(this.proposalId,this.evaluatorOrgGuid)
        .then((response) => {
          this.proposalEvaluationFormInitialState = new ProposalEvaluationModel(
            response
          );

          this.evaluationId = this.proposalEvaluationFormInitialState.id;
          this.readOnlyProposalEvaluation
            ? this.initEditProposalForm(this.proposalEvaluationFormInitialState)
            : this.initCreateProposalForm();
        });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant(
          "proposal_evaluation.error.fetchData"
        ),
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
    const reasonDetailControl = this.proposalEvaluationForm.get("reasonDetail");
    const costTypeControl = this.proposalEvaluationForm.get("costType");
    const newRequestControl = this.proposalEvaluationForm.get("newRequest");

    if (!loaIncluded) {
      budgetUnitControl.patchValue(null);
      budgetUnitControl.clearValidators();

      budgetActionControl.patchValue(null);
      budgetActionControl.clearValidators();

      budgetPlanControl.patchValue(null);
      reasonDetailControl.patchValue(null);

      costTypeControl.patchValue(false);
      newRequestControl.patchValue(false);      

      reasonControl.addValidators(Validators.required);
    } else {
      reasonControl.patchValue(null);
      reasonControl.clearValidators();

      reasonDetailControl.patchValue(null);

      budgetUnitControl.addValidators([
        Validators.required,
        Validators.maxLength(2),
      ]);
      budgetActionControl.addValidators([
        Validators.required,
        Validators.maxLength(3),
      ]);
    }

    budgetUnitControl.updateValueAndValidity();
    budgetActionControl.updateValueAndValidity();
    budgetPlanControl.updateValueAndValidity();
    reasonControl.updateValueAndValidity();
    reasonDetailControl.updateValueAndValidity();
    costTypeControl.updateValueAndValidity();
    newRequestControl.updateValueAndValidity();
  }

  private populateOptionsLists() {
    this.budgetUnitOptions = this.proposalEvaluationService.getBudgetUnitList();
    this.reasonOptions = this.proposalEvaluationService.getReasonOptions();
  }

  private checkFormChanged(
    currentState: ProposalEvaluationCreateFormModel
  ): boolean {
    const keysArray = [
      "includedInNextYearLOA",
      "budgetUnitId",
      "budgetUnitName",
      "budgetActionId",
      "budgetActionName",
      "budgetPlan",
      "reason",
      "reasonDetail",
      "costType",
      "newRequest",
    ];

    return !keysArray.every((key) => {
      switch (key) {
        case "budgetUnitId":
          const currentStateBudgetUnitId = currentState[key].includes(";")
            ? currentState[key].split(";")
            : [currentState[key]];
          const initialStateBudgetUnitId =
            this.proposalEvaluationFormInitialState[key].includes(";")
              ? this.proposalEvaluationFormInitialState[key].split(";")
              : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetUnitId.every((id) =>
            initialStateBudgetUnitId.includes(id)
          );

        case "budgetUnitName":
          const currentStateBudgetUnitName = currentState[key].includes(";")
            ? currentState[key].split(";")
            : [currentState[key]];
          const initialStateBudgetUnitName =
            this.proposalEvaluationFormInitialState[key].includes(";")
              ? this.proposalEvaluationFormInitialState[key].split(";")
              : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetUnitName.every((name) =>
            initialStateBudgetUnitName.includes(name)
          );

        case "budgetActionId":
          const currentStateBudgetActionId = currentState[key].includes(";")
            ? currentState[key].split(";")
            : [currentState[key]];
          const initialStateBudgetActionId =
            this.proposalEvaluationFormInitialState[key].includes(";")
              ? this.proposalEvaluationFormInitialState[key].split(";")
              : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetActionId.every((id) =>
            initialStateBudgetActionId.includes(id)
          );

        case "budgetActionName":
          const currentStateBudgetActionName = currentState[key].includes(";")
            ? currentState[key].split(";")
            : [currentState[key]];
          const initialStateBudgetActionName =
            this.proposalEvaluationFormInitialState[key].includes(";")
              ? this.proposalEvaluationFormInitialState[key].split(";")
              : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetActionName.every((name) =>
            initialStateBudgetActionName.includes(name)
          );

        case "budgetPlan":
          const currentStateBudgetPlan =
            currentState[key] == null ? "" : currentState[key];
          const initialStateBudgetPlan =
            this.proposalEvaluationFormInitialState[key] == undefined
              ? ""
              : this.proposalEvaluationFormInitialState[key];
          return currentStateBudgetPlan == initialStateBudgetPlan;

        default:
          return (
            currentState[key] == this.proposalEvaluationFormInitialState[key]
          );
      }
    });
  }

  get requireBudgetPlan() : boolean {
    return this.formHaveCost && !this.formNewRequest;
  }

  updateBudgetPlanControlRequire() {
    const budgetPlanControl = this.proposalEvaluationForm.get("budgetPlan");

    if(this.requireBudgetPlan) {
      budgetPlanControl.addValidators(Validators.required);
    } else {
      budgetPlanControl.patchValue(undefined);
      budgetPlanControl.clearValidators();
    }

    budgetPlanControl.updateValueAndValidity();
  }

  private async postProposalEvaluation(
    reqBody: ProposalEvaluationCreateFormModel
  ) {
    try {
      this.loading = true;

      await this.proposalEvaluationService.postProposalEvaluation(reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("proposal_evaluation.inserted"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant(
          "proposal_evaluation.error.saving"
        ),
      });
    } finally {
      setTimeout(() => this.cancel(), 3000);
    }
  }

  private async putProposalEvaluation(
    id: number,
    reqBody: ProposalEvaluationCreateFormModel
  ) {
    try {
      this.loading = true;

      await this.proposalEvaluationService.putProposalEvaluation(id, reqBody);

      this.messageService.add({
        severity: "success",
        summary: this.translateService.instant("success"),
        detail: this.translateService.instant("proposal_evaluation.updated"),
      });
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: "error",
        summary: this.translateService.instant("error"),
        detail: this.translateService.instant(
          "proposal_evaluation.error.saving"
        ),
      });
    } finally {
      setTimeout(() => this.cancel(), 3000);
    }
  }

  private async deleteProposalEvaluation(id: number) {
    const emptyReqBody = new ProposalEvaluationCreateFormModel(
      {},
      JSON.parse(localStorage.getItem(StoreKeys.USER_INFO))["id"],
      id,
      this.evaluatorOrgGuid,
      this.orgNameTag,
      this.orgName,
      this.evaluatorName
    );

    try {
      this.loading = true;

      await this.proposalEvaluationService.deleteProposalEvaluation(
        id,
        emptyReqBody
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
      setTimeout(() => this.cancel(), 3000);
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem("proposalData");
    sessionStorage.removeItem("viewEvaluation");
  }
}
