export interface IAlchemyRawData {
  vpoNumber: string;
  m3Style: string;
  colorDescription: string;
  deliveryMethod: string;
  coStatus: number;
  coQuantity: number;
  deliveredQuantity: number;
  planDeliveryDate: string | null;
  pcd: string | null; // Planned Cut Date
  psd: string | null; // Production Start Date (Packing)
  criticalMaterialExpected: string | null;
  criticalMaterialActual: string | null;
  floStartCuttingActual: string | null; // Op 15
  floStartSewActual: string | null;     // Op 205
  floStartPackingActual: string | null; // Op 295
}

export const mockData: IAlchemyRawData[] =[
  {
    vpoNumber: "10007740",
    m3Style: "QF8594",
    colorDescription: "100",
    deliveryMethod: "SEA",
    coStatus: 75,
    coQuantity: 204,
    deliveredQuantity: 154,
    planDeliveryDate: "2026-03-08T00:00:00Z",
    pcd: "2026-02-15T00:00:00Z",
    psd: "2026-02-25T00:00:00Z",
    criticalMaterialExpected: "2026-02-10T00:00:00Z",
    criticalMaterialActual: "2026-02-09T00:00:00Z",
    floStartCuttingActual: "2026-02-16T00:00:00Z",
    floStartSewActual: "2026-02-20T00:00:00Z",
    floStartPackingActual: null
  }
];