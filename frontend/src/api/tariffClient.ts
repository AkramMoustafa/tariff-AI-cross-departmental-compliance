import apiClient from "@/api/client";

export interface DutyCalculationRequest {
  hs_code: string;
  origin_country: string;
  customs_value: number;
  freight?: number;
  insurance?: number;
}

export interface DutyCalculationResponse {
  hs_code: string;
  origin_country: string;

  product?: {
    effective_description?: string;
    hs_hierarchy?: string[];
    descriptions?: string[];
  };

  base_tariff?: {
    general_rate: string;
    special_rate?: string;
    column2_rate?: string;
    eligible_programs?: string[];
  };

  final_tariff: {
    rate: string;
    basis: string;
    applied_program: string;
  };

  calculated_duties: {
    base_rate_percent: number;
    section301_rate_percent?: number; 
    total_rate_percent: number;
  };

  duty_payable: {
    dutiable_value: number;
    total_duty_payable: number;
    effective_rate?: number;
  };

  // 🔥 THIS IS THE MISSING PIECE
  section_301?: {
    applies: boolean;
    chapter_99_code?: string;
    additional_duties_text?: string;
    legal_description?: string;
  };
}
export async function calculateDuty(
  payload: DutyCalculationRequest
): Promise<DutyCalculationResponse> {
  const res = await apiClient.post("/tariffs/calculate_duty", payload);
  return res.data;
}

export async function exportTariffPdf(payload: any): Promise<Blob> {
  const res = await apiClient.post(
    "/api/tariff/pdf",   
    payload,
    {
      responseType: "blob", 
    }
  );

  return res.data;
}
