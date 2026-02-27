export interface ICalculatedMilestone {
  masterPo: string;
  lineNo: string;
  masterStyle: string;
  colorCode: string;
  factoryMemberId: string;
  criticalMaterialExpected: string | null;
  criticalMaterialActual: string | null;
  preProductionSampleReady: string | null; // FLO Cut Actual - 2 Days
  startCuttingExpected: string | null; // PCD
  startCuttingActual: string | null;
  startSewExpected: string | null; // PSD - 1 Day
  startSewActual: string | null;
  startPackingExpected: string | null; // PSD
  startPackingActual: string | null;
  testing: 'GB testing' | 'KC testing' | 'MTL';
  excessQty1st2nd: number | null; // Output if > 0 and Status > 66
  finalInspectionExpected: string | null; // Plan Delivery - 3 Days
  acDateExpected: string | null; // Mapped from Plan Delivery
  reasonForDelay1: string | null;
  reasonForDelay2: string | null;
  comments: string | null;
}

export const mockData: ICalculatedMilestone[] =[
  {
    masterPo: "10007740",
    lineNo: "1",
    masterStyle: "QF8594",
    colorCode: "100",
    factoryMemberId: "5717-9890-1816-2214",
    criticalMaterialExpected: "2026-02-10T00:00:00Z",
    criticalMaterialActual: "2026-02-09T00:00:00Z",
    preProductionSampleReady: "2026-02-13T00:00:00Z", // Adjusted for weekends if applicable
    startCuttingExpected: "2026-02-15T00:00:00Z",
    startCuttingActual: "2026-02-16T00:00:00Z",
    startSewExpected: "2026-02-24T00:00:00Z",
    startSewActual: "2026-02-20T00:00:00Z",
    startPackingExpected: "2026-02-25T00:00:00Z",
    startPackingActual: null,
    testing: "GB testing", // Based on Dest = CN
    excessQty1st2nd: 50, // 204 - 154
    finalInspectionExpected: "2026-03-05T00:00:00Z",
    acDateExpected: "2026-03-08T00:00:00Z",
    reasonForDelay1: null,
    reasonForDelay2: null,
    comments: null
  }
];