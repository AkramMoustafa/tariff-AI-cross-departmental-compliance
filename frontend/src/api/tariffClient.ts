// src/api/tariffClient.ts
import apiClient from "./client";


export interface TariffCalculatePayload {
hs_code: string;
origin_country: string;
destination_country: string;
customs_value: number;
freight?: number;
insurance?: number;
quantity?: number;
currency?: string;
}


export async function calculateTariff(payload: TariffCalculatePayload) {
const { data } = await apiClient.post(
"/api/tariff/calculate",
payload
);
return data;
}

export async function calculateOrderTariff(orderId: string) {
const { data } = await apiClient.post(
`/api/orders/${orderId}/calculate-tariff`
);
return data;
}