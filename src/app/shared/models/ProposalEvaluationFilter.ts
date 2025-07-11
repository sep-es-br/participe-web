export class ProposalEvaluationFilter {
  evaluationStatus: string = null;
  microrregion: number = null; //localityId? -> localities
  themeArea: string = null; // possivel number(id)? -> planItem
  budgetCategory: string = null; // possivel number(id)?
  entity: string = null; // possivel number(id)?
  approved: boolean = null;
  text: string = "";
}
