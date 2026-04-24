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

export interface AutoClassifyRequest {
  description: string;
}

export interface HSMatch {
  code: string;
  description: string;
  score?: number;
}

export interface AutoClassifyResponse {
  suggested: HSMatch | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  alternatives: HSMatch[];
}

export async function autoClassify(
  payload: AutoClassifyRequest
): Promise<AutoClassifyResponse> {
  const res = await apiClient.post("/hs/auto-classify", payload);
  return res.data;
}





export interface DutyCalculationRequest1 {
  hs_code: string;
  origin_country: string;
  customs_value: number;
  freight?: number;
  insurance?: number;
}

export interface DutyCalculationResponse1 {
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
export async function calculateDuty1(
  payload: DutyCalculationRequest1
): Promise<DutyCalculationResponse1> {
  const res = await apiClient.post("/tariffs/calculate_duty1", payload);
  return res.data;
}

export async function exportTariffPdf1(payload: any): Promise<Blob> {
  const res = await apiClient.post(
    "/api/tariff/pdf1",   
    payload,
    {
      responseType: "blob", 
    }
  );

  return res.data;
}

export interface AutoClassifyRequest1 {
  description: string;
}

export interface HSMatch1 {
  code: string;
  description: string;
  score?: number;
}

export interface AutoClassifyResponse1 {
  suggested: HSMatch1 | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  alternatives: HSMatch1[];
  hs_description?: string;
}

export async function autoClassify1(
  payload: AutoClassifyRequest1
): Promise<AutoClassifyResponse1> {
  const res = await apiClient.post("/hs1/auto-classify1", payload);
  return res.data;
}


export interface ImproveDescriptionResponse {
  description: string;
}
export async function improveDescription1(
  payload: { description: string }
): Promise<ImproveDescriptionResponse> {
  const res = await apiClient.post("/hs1/improve-description", payload);
  return res.data;
}

