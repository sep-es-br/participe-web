export interface IProposal {
    id: number;
    status: string;
    microrregion: string;
    descriptionText: string;
    themeArea: string;
    budgetCategory: string;
    entities: string[];
}