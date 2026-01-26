import apiClient from "./client";

export interface EvidenceRequest {
  id: number;
  description: string;
  status: string;
  file_count: number;
}

export interface EvidenceFile {
  file_name: string;
  uploaded_at: string;
}

export interface EvidenceAuditLog {
  created_at: string;
  email: string | null;
  action: string;
}

export const getEvidenceRequests = async (): Promise<EvidenceRequest[]> => {
  const { data } = await apiClient.get("/auditor/evidence-requests");
  return data;
};

export const getEvidenceFiles = async (
  evidenceRequestId: number
): Promise<EvidenceFile[]> => {
  const { data } = await apiClient.get(
    `/auditor/evidence-requests/${evidenceRequestId}/files`
  );
  return data;
};

export const getEvidenceAuditLog = async (
  evidenceRequestId: number
): Promise<EvidenceAuditLog[]> => {
  const { data } = await apiClient.get(
    `/auditor/evidence-requests/${evidenceRequestId}/audit-log`
  );
  return data;
};

export const requestEvidenceAccess = async (
  evidenceRequestId: number
) => {
  const { data } = await apiClient.post(
    `/auditor/evidence-requests/${evidenceRequestId}/request-access`
  );
  return data;
};