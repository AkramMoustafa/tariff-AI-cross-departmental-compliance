import { useEffect, useState } from "react";
import axios from "axios";

export interface ComplianceDashboardData {
  pendingEvidenceAccess: number;
  pendingNominations: number;
  executiveRequests: number;
  overdueEvidence: number;
  overdueControls: number;
  recentActivity: {
    id: string;
    action: string;
    actorEmail: string;
    createdAt: string;
  }[];
}
export interface ComplianceDashboardResponse {
  pendingEvidenceAccess: number
  pendingNominations: number
  executiveRequests: number
  overdueEvidence: number
  overdueControls: number
  recentActivity: {
    id: string
    action: string
    actorUserId: string
    createdAt: string
  }[]
}

export function useComplianceDashboard() {
  const [data, setData] = useState<ComplianceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Missing token");
      setIsLoading(false);
      return;
    }

    axios
      .get("/api/compliance/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
