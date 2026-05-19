export interface RiskDecision {
  poId: string;
  predictedDelay: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  aiRecommendation: string;
  finalDecision?: string;
  approvalStatus:
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "OVERRIDDEN"
    | "ESCALATED";
  approver?: string;
  notes?: string;
  createdAt: string;
}
