export interface ICalculatedMilestone {
  masterPo: string;
  startCuttingExpected: string | null; 
  testing: 'GB testing' | 'KC testing' | 'MTL';
}

export const mockData: ICalculatedMilestone[] =[
  { masterPo: "10007740", startCuttingExpected: "2026-03-01T00:00:00Z", testing: "MTL" }
];