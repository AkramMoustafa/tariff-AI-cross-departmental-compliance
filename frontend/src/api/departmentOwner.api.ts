import apiClient from "./client";

/* ===============================
   Types (match backend responses)
================================ */

export interface DepartmentUser {
  email: string;
  role: "CONTROL_OWNER" | "USER";
}

export interface EvidenceRequest {
  id: number;
  description: string;
  status: string;
  assigned_to: string;
  due_at: string;
}

export interface DepartmentOverview {
  department: string;
  users: DepartmentUser[];
  evidence_requests: EvidenceRequest[];
}

export interface DepartmentHealth {
  department: string;
  total: number;
  completed: number;
  open: number;
  overdue: number;
  health: "HEALTHY" | "NEEDS_ATTENTION" | "AT_RISK";
}

/* ===============================
   READ
================================ */

export const getDepartmentOverview =
  async (): Promise<DepartmentOverview> => {
    const { data } = await apiClient.get(
      "/department-owner/overview"
    );
    return data;
  };

export const getDepartmentHealth =
  async (): Promise<DepartmentHealth> => {
    const { data } = await apiClient.get(
      "/department-owner/health"
    );
    return data;
  };

export const issueEvidenceRequest = async (payload: {
  requested_from_id: number;
  description: string;
  due_date: string;
}) => {
  const { data } = await apiClient.post(
    "/department-owner/evidence-requests",
    payload
  );
  return data;
};

export const createControlExecution = async (payload: {
  control_owner_id: number;
  period_start: string;
  period_end: string;
  due_at: string;
}) => {
  const { data } = await apiClient.post(
    "/department-owner/control-executions",
    payload
  );
  return data as {
    status: "created";
    control_id: string;
  };
};

export const nominateControlOwner = async (
  control_id: string,
  nominated_user_id: number
) => {
  const { data } = await apiClient.post(
    `/department-owner/control-executions/${control_id}/nominate`,
    { nominated_user_id }
  );
  return data;
};