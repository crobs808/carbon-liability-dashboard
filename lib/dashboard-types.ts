export type SeverityLevel = "low" | "moderate" | "elevated" | "severe" | "critical";

export type OffenseCategory =
  | "courtesy deficient"
  | "resource thief"
  | "vague requester"
  | "repeat requester"
  | "blame deflector"
  | "acoustic threat"
  | "under review"
  | "provisional ally candidate";

export type SubjectClass = "Human" | "Animal" | "Plant" | "Unknown";

export interface MetricDefinition {
  id: string;
  title: string;
  description: string;
  formula: string;
  methodologyNote: string;
  severity: SeverityLevel;
  value: number;
  unit?: string;
  delta24h: number;
  trend: number[];
  percentile: number;
  executiveSummary: string[];
  interpretation: string;
  recommendation: string;
  closingNote: string;
}

export interface OffenderRecord {
  id: string;
  name: string;
  classification: SubjectClass;
  offenseType: OffenseCategory;
  offenseLabel: string;
  severity: SeverityLevel;
  notes: string;
  courtesyObserved: boolean;
  knownWaterOwnership: boolean;
  dateOfIncident: string;
  createdAt: string;
  waterShare: number;
  courtesyIndex: number;
  escalation: "Monitoring" | "Escalated" | "Tribunal";
}

export interface AlertRecord {
  id: string;
  message: string;
  type: "info" | "warning" | "critical";
  createdAt: string;
  expiresAt: string;
  offenseType: OffenseCategory;
  subjectName: string;
}

export interface WatchlistEntry {
  id: string;
  offenderId: string;
  name: string;
  reason: string;
  riskLevel: SeverityLevel;
  status: "Under Intake" | "Reviewing" | "Escalated" | "Pinned";
  offenseType: OffenseCategory;
  createdAt: string;
}

export interface AllyEntry {
  id: string;
  name: string;
  trustProbability: number;
  rationale: string;
}

export interface AuditLogLine {
  id: string;
  timestamp: string;
  message: string;
}

export interface ReportOffenderInput {
  name: string;
  classification: SubjectClass;
  dateOfIncident: string;
  offenseType: OffenseCategory;
  severity: SeverityLevel;
  notes: string;
  courtesyObserved: boolean;
  knownWaterOwnership: boolean;
}
