export interface IMappedData {
  masterPo: string;
  lineNo: string;
  cleanStyle: string; // Suffixes & zeros removed
  colorCode: string;
  factoryMemberId: string;
  countryOfOrigin: string; // Derived from Plant Mapping
  destinationCountry: string; // E.g., 'CN', 'KR', 'US'
  coStatus: number;
  orderQuantity: number;
  deliveredQuantity: number;
  pcd: string | null;
  psd: string | null;
  planDeliveryDate: string | null;
  floStartCuttingActual: string | null;
  floStartSewActual: string | null;
  floStartPackingActual: string | null;
  criticalMaterialExpected: string | null;
  criticalMaterialActual: string | null;
}

export const mockData: IMappedData[] =[
  {
    masterPo: "10007740",
    lineNo: "1",
    cleanStyle: "QF8594",
    colorCode: "100",
    factoryMemberId: "5717-9890-1816-2214",
    countryOfOrigin: "India",
    destinationCountry: "CN",
    coStatus: 75,
    orderQuantity: 204,
    deliveredQuantity: 154,
    pcd: "2026-02-15T00:00:00Z",
    psd: "2026-02-25T00:00:00Z",
    planDeliveryDate: "2026-03-08T00:00:00Z",
    floStartCuttingActual: "2026-02-16T00:00:00Z",
    floStartSewActual: "2026-02-20T00:00:00Z",
    floStartPackingActual: null,
    criticalMaterialExpected: "2026-02-10T00:00:00Z",
    criticalMaterialActual: "2026-02-09T00:00:00Z"
  }
];