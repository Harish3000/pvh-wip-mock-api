export interface INexusRawData {
  masterPo: string;
  lineNo: string;
  masterStyle: string;
  colorCode: string;
  factoryName: string;
  factoryMemberId: string;
  orderedQuantity: number;
  shipmentMethod: string;
  buyerDivision: string;
  poIssueDate: string; // ISO 8601 string
  acDateOriginalExpected: string;
  atConsolidatorDate: string;
}

export const mockData: INexusRawData[] =[
  {
    masterPo: "10007740",
    lineNo: "1",
    masterStyle: "LPVCKNCBRMWOMEN-QF8594",
    colorCode: "100 WHITE",
    factoryName: "Brandix Apparel India (P) Ltd- Unit II",
    factoryMemberId: "5717-9890-1816-2214",
    orderedQuantity: 204,
    shipmentMethod: "SEA FREIGHT",
    buyerDivision: "LPVCKNCBRMWOMEN",
    poIssueDate: "2026-01-15T00:00:00Z",
    acDateOriginalExpected: "2026-03-10T00:00:00Z",
    atConsolidatorDate: "2026-03-15T00:00:00Z"
  }
];