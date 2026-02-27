import { ICalculatedMilestone } from './calculated-output';

export interface IValidatedMilestone extends ICalculatedMilestone {
  isValid: boolean;
  errors: string[]; // List of specific error messages for this row
  errorFields: string[]; // List of specific keys that failed (e.g., ['startCuttingActual', 'masterPo'])
}

export const mockData: IValidatedMilestone[] =[
  {
    masterPo: "", // Intentional error: Missing Master PO
    lineNo: "1",
    masterStyle: "QF8594",
    colorCode: "100",
    factoryMemberId: "5717-9890-1816-2214",
    criticalMaterialExpected: "2026-02-10T00:00:00Z",
    criticalMaterialActual: "2026-02-09T00:00:00Z",
    preProductionSampleReady: "2026-02-13T00:00:00Z",
    startCuttingExpected: "2026-02-15T00:00:00Z",
    startCuttingActual: "2027-02-16T00:00:00Z", // Intentional error: Future date mismatch
    startSewExpected: "2026-02-24T00:00:00Z",
    startSewActual: "2026-02-20T00:00:00Z",
    startPackingExpected: "2026-02-25T00:00:00Z",
    startPackingActual: null,
    testing: "GB testing",
    excessQty1st2nd: 50,
    finalInspectionExpected: "2026-03-05T00:00:00Z",
    acDateExpected: "2026-03-08T00:00:00Z",
    reasonForDelay1: null,
    reasonForDelay2: null,
    comments: null,
    
    // Validation Metadata added by Dahami's Engine
    isValid: false,
    errors:[
      "Master PO - Cannot be empty",
      "Start Cutting Actual - Cannot be a future date"
    ],
    errorFields: ["masterPo", "startCuttingActual"]
  }
];