// src/api/controlOwner.api.ts
import apiClient from "./client";

export interface EvidenceTask {
  id: number;
  description: string;
  status: string;
  due_at: string;
  created_at: string;
  evidence_count: number;
}

export interface ControlExecution {
  id: number;
  control_id: string;
  status: string;
  period_start: string;
  period_end: string;
  due_at: string;
  completed_at: string | null;
}

export interface Department {
  id: number;
  name: string;
}

export const getEvidenceTasks =
  async (): Promise<EvidenceTask[]> => {
    const { data } = await apiClient.get(
      "/control-owner/evidence-tasks"
    );
    return data;
  };

export const getControlExecutions =
  async (): Promise<ControlExecution[]> => {
    const { data } = await apiClient.get(
      "/control-owner/control-executions"
    );
    return data;
  };

export const getControlOwnerDepartments =
  async (): Promise<Department[]> => {
    const { data } = await apiClient.get(
      "/control-owner/departments"
    );
    return data;
  };

export const submitEvidence = async (
  request_id: number,
  note: string
) => {
  const { data } = await apiClient.post(
    `/control-owner/evidence/${request_id}/submit`,
    { note }
  );
  return data;
};

export const completeControlExecution = async (
  execution_id: number
) => {
  const { data } = await apiClient.post(
    `/control-owner/control-executions/${execution_id}/complete`
  );
  return data;
};