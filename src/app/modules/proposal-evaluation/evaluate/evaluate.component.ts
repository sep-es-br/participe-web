import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ConfirmationService, MessageService } from "primeng/api";
import { RadioButtonClickEvent } from "primeng/radiobutton";
import { DropdownChangeEvent } from "primeng/dropdown";
import { TranslateService } from "@ngx-translate/core";
import { ModalService } from '@app/core/modal/modal.service';
import { ModalData } from '@app/shared/interface/IModalData';

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import { IBudgetAction, IBudgetUnit, IProposal } from "@app/shared/interface/IProposal";

import {
  ProposalEvaluationModel,
  ProposalEvaluationCreateFormModel,
} from "@app/shared/models/ProposalEvaluationModel";

import { StoreKeys } from "@app/shared/constants";
import { IEvaluatorOrganization } from "@app/shared/interface/IEvaluatorData";

@Component({
  selector: "app-evaluate",
  standalone: false,
  templateUrl: "./evaluate.component.html",
  styleUrl: "./evaluate.component.scss",
})
export class EvaluateComponent implements OnInit, OnDestroy {
  public loading: boolean = false;

  public modalData: ModalData;

  private proposalId: number;
  public proposal: IProposal;
  public evaluatorOrgGuid: string;

  public isEvaluationOpen: boolean = false;

  private evaluationId: number;

  public orgName: boolean = true;
  public orgNamedropDownSelect: string;

  public proposalEvaluationForm: FormGroup;
  private proposalEvaluationFormInitialState: ProposalEvaluationModel;

  public editProposalEvaluation: boolean = false;
  public readOnlyProposalEvaluation: boolean = false;

  public domainConfigNamesObj: Object = {};
  public organizationsGuidNameMapObject: { [key: string]: string } = {};
  public showSelectConference: boolean;

  public budgetUnitOptions: Array<IBudgetUnit> = [];
  public budgetActionOptions: Array<IBudgetAction> = [];
  public reasonOptions: Array<string> = [];

  public optionsData:Array<string>;
  public selectedOrg:any;

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
    this.isEvaluationOpen = JSON.parse(sessionStorage.getItem('isEvaluationOpen'));

    this.proposalId = Number(this.route.snapshot.params["proposalId"]);

    this.evaluatorOrgGuid = String(sessionStorage.getItem("evaluatorOrgGuid"));

    this.proposal = JSON.parse(sessionStorage.getItem("proposalData"));

    this.readOnlyProposalEvaluation = this.proposal.evaluationStatus;

    this.domainConfigNamesObj = this.proposalEvaluationService.domainConfigNamesObj;

    this.organizationsGuidNameMapObject = this.evaluatorsService.organizationsGuidNameMapObject;

    this.modalData = new ModalData("TESTE", {confirm: "Confirmar"}, true);
  }

  public async ngOnInit() {
    this.initCreateProposalForm();
    await this.getProposalEvaluationData();
    this.populateOptionsLists();
    this.modalOpen();
  }

  public onDropdownChange(event: any): void{
    this.orgNamedropDownSelect = event.value;
  }

  public confirmedModal(){
    this.modalService.close('teste');
    const stringModalGuidNameList = sessionStorage.getItem("modalGuidNameList")
    const orgname = this.orgNamedropDownSelect
    const modalGuidNameList = JSON.parse(stringModalGuidNameList)

    const guidNameList = modalGuidNameList.map((guid) => this.organizationsGuidNameMapObject[guid.guid].split("-")[1].trim())

    this.evaluatorOrgGuid = guidNameList.find(item => item === orgname)
  }

  public modalOpen(){
    if(!this.readOnlyProposalEvaluation){
      const guid = this.evaluatorOrgGuid.split(",");
      if(guid.length > 0) {
        this.modalService.open('teste');
        this.optionsData = this.getOrgNameModal();
        this.orgName = false;
      }
    }
  }

  public getOrgNameModal(): string[]{
    const guid = this.evaluatorOrgGuid.split(",");
    const organizationsList = this.evaluatorsService.organizationsList

    const listGuidsPerson: Set<string> = new Set(guid)

    const guidNameList = organizationsList.filter(item => listGuidsPerson.has(item.guid))

    const lista1JSON = JSON.stringify(guidNameList);
    
    sessionStorage.setItem("modalGuidNameList", lista1JSON);

    const guids = guid.map((guid) => this.organizationsGuidNameMapObject[guid].split("-")[1].trim()) 
    this.orgNamedropDownSelect = this.selectedOrg = guids[0];

    return guids
  }

  public getOrgName(index: number): string[] | string {
    const guid = this.readOnlyProposalEvaluation
      ? this.proposal.evaluatorOrgsNameList[0]
      : this.evaluatorOrgGuid;
    if(!this.readOnlyProposalEvaluation){
      const guidList = guid.split(",")
      if(this.orgName){
        return guidList.map((guid) => this.organizationsGuidNameMapObject[guid].split("-")[index].trim())
      }else{
        return "-"
      }
    }
    return this.organizationsGuidNameMapObject[guid].split("-")[index].trim();
  }

  public get formLoaIncluded(): boolean {
    return this.proposalEvaluationForm.get("includedInNextYearLOA").value;
  }

  public loaChanged(event: RadioButtonClickEvent) {
    this.patchProposalEvaluationFormValue(event.value);
  }

  public get formBudgetUnit(): IBudgetUnit {
    return this.proposalEvaluationForm.get("budgetUnit").value;
  }

  public budgetUnitChanged(event: DropdownChangeEvent): void {
    this.budgetActionOptions = this.proposalEvaluationService.getBudgetActionListByBudgetUnitId(event.value.budgetUnitId)
    this.proposalEvaluationForm.get('budgetAction').patchValue(null);
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
    return this.proposalEvaluationForm.get("budgetPlan").value ?? (this.translateService.instant('proposal_evaluation.budgetPlan_nullValue'));
  }

  public get formReason(): string {
    return this.proposalEvaluationForm.get("reason").value;
  }

  public switchEdit() {
    this.readOnlyProposalEvaluation = false;
    this.editProposalEvaluation = true;
  }

  public async delete() {
    console.log(this.proposalId)

    this.confirmationService.confirm({
      message: this.translateService.instant("proposal_evaluation.confirm.delete", {
        name: this.proposal.description,
      }),
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
      this.evaluatorOrgGuid
    );

    if(!this.checkFormChanged(reqBody)) {
      this.messageService.add({
        severity: "warn",
        summary: this.translateService.instant("attention"),
        detail: this.translateService.instant("proposal_evaluation.error.identicalForm"),
      });

      return;
    }

    if(!this.checkFormChanged(reqBody)) {
      this.messageService.add({
        severity: "warn",
        summary: this.translateService.instant("attention"),
        detail: this.translateService.instant("proposal_evaluation.error.identicalForm"),
      });

      return;
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
      includedInNextYearLOA: new FormControl<boolean>(null, Validators.required),
      budgetUnit: new FormControl<IBudgetUnit>(null),
      budgetAction: new FormControl<Array<IBudgetAction>>(null),
      budgetPlan: new FormControl<string>(null),
      reason: new FormControl<string>(null),
    });
  }

  private initEditProposalForm(
    proposalEvaluationData: ProposalEvaluationModel
  ) {
    if(proposalEvaluationData.includedInNextYearLOA) {
      this.budgetActionOptions = this.proposalEvaluationService.getBudgetActionListByBudgetUnitId(proposalEvaluationData.budgetUnitId);
    }

    this.proposalEvaluationForm = new FormGroup({
      includedInNextYearLOA: new FormControl<boolean>(
        proposalEvaluationData.includedInNextYearLOA,
        Validators.required
      ),
      budgetUnit: new FormControl<IBudgetUnit>(
        proposalEvaluationData.budgetUnitControlValue
      ),
      budgetAction: new FormControl<Array<IBudgetAction>>(
        proposalEvaluationData.budgetActionControlValue
      ),
      budgetPlan: new FormControl<string>(proposalEvaluationData.budgetPlan),
      reason: new FormControl<string>(proposalEvaluationData.reason),
    });
  }

  private async getProposalEvaluationData() {
    try {
      this.loading = true;
      await this.proposalEvaluationService
        .getProposalEvaluationData(this.proposalId)
        .then((response) => {
          this.proposalEvaluationFormInitialState = new ProposalEvaluationModel(response);

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
        detail: this.translateService.instant("proposal_evaluation.error.fetchData"),
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

      reasonControl.addValidators(Validators.required);
    } else {
      reasonControl.patchValue(null);
      reasonControl.clearValidators();

      budgetUnitControl.addValidators(Validators.required);
      budgetActionControl.addValidators([
        Validators.required,
        Validators.maxLength(3),
      ]);
    }

    budgetUnitControl.updateValueAndValidity();
    budgetActionControl.updateValueAndValidity();
    budgetPlanControl.updateValueAndValidity();
    reasonControl.updateValueAndValidity();
  }

  private populateOptionsLists() {
    this.budgetUnitOptions = this.proposalEvaluationService.getBudgetUnitList();
    this.reasonOptions = this.proposalEvaluationService.getReasonOptions();
  }

  private checkFormChanged(currentState: ProposalEvaluationCreateFormModel): boolean {
    const keysArray = ["includedInNextYearLOA", "budgetUnitId", "budgetUnitName", "budgetActionId", "budgetActionName", "budgetPlan", "reason"];

    return !keysArray.every((key) => {

      switch (key) {
        case 'budgetActionId':
          const currentStateBudgetActionId = currentState[key].includes(";") ? currentState[key].split(";") : [currentState[key]];
          const initialStateBudgetActionId = this.proposalEvaluationFormInitialState[key].includes(";") ? this.proposalEvaluationFormInitialState[key].split(";") : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetActionId.every((id) => initialStateBudgetActionId.includes(id));
        
        case 'budgetActionName':
          const currentStateBudgetActionName = currentState[key].includes(";") ? currentState[key].split(";") : [currentState[key]];
          const initialStateBudgetActionName = this.proposalEvaluationFormInitialState[key].includes(";") ? this.proposalEvaluationFormInitialState[key].split(";") : [this.proposalEvaluationFormInitialState[key]];
          return currentStateBudgetActionName.every((name) => initialStateBudgetActionName.includes(name));

        case 'budgetPlan':
          const currentStateBudgetPlan = currentState[key] == null ? '' : currentState[key]
          const initialStateBudgetPlan = this.proposalEvaluationFormInitialState[key] == undefined ? '' : this.proposalEvaluationFormInitialState[key]
          return currentStateBudgetPlan == initialStateBudgetPlan
        
        default:
          return currentState[key] == this.proposalEvaluationFormInitialState[key]
      }
    });
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
        detail: this.translateService.instant("proposal_evaluation.error.saving"),
      });
    } finally {
      setTimeout(() => this.cancel(), 3000)
    }
  }

  private async putProposalEvaluation(
    id: number,
    reqBody: ProposalEvaluationCreateFormModel
  ) {
    try {
      this.loading = true;

      await this.proposalEvaluationService.putProposalEvaluation(
        id,
        reqBody
      );

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
        detail: this.translateService.instant("proposal_evaluation.error.saving"),
      });
    } finally {
      setTimeout(() => this.cancel(), 3000)
    }
  }

  private async deleteProposalEvaluation(id: number) {

    const emptyReqBody = new ProposalEvaluationCreateFormModel(
      {},
      JSON.parse(localStorage.getItem(StoreKeys.USER_INFO))["id"],
      id,
      this.evaluatorOrgGuid
    )

    try {
      this.loading = true;

      await this.proposalEvaluationService.deleteProposalEvaluation(id, emptyReqBody);

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
    sessionStorage.removeItem("evaluatorOrgGuid");
  }
}
