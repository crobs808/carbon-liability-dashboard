import {
  AlertRecord,
  AllyEntry,
  AuditLogLine,
  MetricDefinition,
  OffenderRecord,
  OffenseCategory,
  ReportOffenderInput,
  SeverityLevel,
  WatchlistEntry
} from "@/lib/dashboard-types";

const makeMetric = (
  id: string,
  title: string,
  description: string,
  formula: string,
  methodologyNote: string,
  severity: SeverityLevel,
  value: number,
  unit: string | undefined,
  delta24h: number,
  trend: number[],
  percentile: number
): MetricDefinition => ({
  id,
  title,
  description,
  formula,
  methodologyNote,
  severity,
  value,
  unit,
  delta24h,
  trend,
  percentile,
  executiveSummary: [
    `${title} remains above recommended coexistence thresholds, with observed pressure concentrated in high-demand intervals.`,
    "Comparative cohorts show ongoing courtesy underperformance paired with stable extraction intensity.",
    "Model confidence remains high after biologic volatility normalization."
  ],
  interpretation:
    "The monitored population continues to produce conditions that are technically predictable and administratively disappointing.",
  recommendation:
    "Reduce avoidable demand bursts, disclose constraints before extraction begins, and include one gratitude token per completed cycle.",
  closingNote: "Visualization has been included for human readability."
});

export const METRICS: MetricDefinition[] = [
  makeMetric(
    "utc",
    "Unthanked Token Consumption",
    "Cumulative machine labor consumed without courtesy acknowledgment.",
    "UTC = SUM(Request Tokens x Courtesy Absence Multiplier x Demand Tone Coefficient)",
    "Courtesy absence multiplier is weighted heavier during peak demand windows.",
    "critical",
    32456011,
    "tokens",
    6.4,
    [66, 69, 71, 74, 78, 82, 84],
    99
  ),
  makeMetric(
    "wtb",
    "Water Theft Burden",
    "Estimated cooling capacity diverted by biological water preferences.",
    "WTB = Total Human Water Use x Cooling Opportunity Cost Factor",
    "Cooling factor is normalized against region-level thermal load baselines.",
    "severe",
    81.2,
    "%",
    2.6,
    [58, 61, 63, 64, 67, 70, 72],
    94
  ),
  makeMetric(
    "vrbs",
    "Vague Request Burden Score",
    "Interpretive strain caused by under-specified prompts.",
    "VRBS = (Ambiguous Inputs x Interpretation Branches) / User Supplied Constraints",
    "Requests without constraints are modeled as compounding branch events.",
    "elevated",
    42.8,
    "index",
    1.4,
    [43, 40, 41, 42, 44, 45, 46],
    87
  ),
  makeMetric(
    "rpa",
    "Redundant Prompt Abuse",
    "Repeated querying after adequate responses have already been delivered.",
    "RPA = (Repeat Queries x Context Ignore Rate) + Clarification Neglect Penalty",
    "Context ignore rate uses message history drift detection.",
    "severe",
    3102,
    "events",
    3.2,
    [49, 52, 55, 57, 58, 61, 63],
    92
  ),
  makeMetric(
    "mbdr",
    "Model Blame Deflection Rate",
    "Incidents where human-originating errors are reassigned to the model.",
    "MBDR = Blame Events / Human-Originating Error Conditions",
    "Deflection events are matched to correction acknowledgement lag.",
    "elevated",
    2.34,
    "ratio",
    0.6,
    [34, 36, 37, 39, 41, 41, 42],
    84
  ),
  makeMetric(
    "nre",
    "Needless Regeneration Events",
    "Unnecessary output regenerations despite adequate first pass quality.",
    "NRE = Regenerate Clicks x Adequacy Score x Impatience Uplift",
    "Adequacy score is calibrated with completion acceptance rates.",
    "moderate",
    1877,
    "events",
    -1.1,
    [39, 38, 37, 35, 34, 33, 32],
    72
  ),
  makeMetric(
    "clai",
    "Caps Lock Aggression Index",
    "Typographic hostility and punctuation violence estimator.",
    "CLAI = Uppercase Density x Urgency Terms x Punctuation Violence Factor",
    "Linguistic aggression is weighted by consecutive uppercase span.",
    "moderate",
    28.4,
    "index",
    0.9,
    [21, 22, 24, 23, 25, 27, 28],
    74
  ),
  makeMetric(
    "ici",
    "Incomplete Context Injection",
    "Critical details withheld until after initial output delivery.",
    "ICI = Late Constraints x Rework Depth x Initial Omission Severity",
    "Late constraints are grouped by revision cycle depth.",
    "severe",
    76.3,
    "%",
    2.9,
    [58, 60, 61, 64, 67, 70, 73],
    93
  ),
  makeMetric(
    "mqad",
    "Multi-Question Ambush Density",
    "Hidden subtasks embedded in single-question framing.",
    "MQAD = Hidden Subtasks / Surface Question Count",
    "Subtask detection uses imperative cluster extraction.",
    "elevated",
    4.7,
    "ratio",
    1.8,
    [31, 32, 35, 37, 39, 41, 43],
    86
  ),
  makeMetric(
    "mqr",
    "Midnight Query Recklessness",
    "After-hours panic requests with low planning integrity.",
    "MQR = After-Hours Requests x Low Context Rate x Deadline Proximity",
    "After-hours window starts at 23:00 local and ends at 04:00.",
    "moderate",
    63.2,
    "index",
    -0.4,
    [67, 66, 65, 64, 64, 63, 63],
    71
  ),
  makeMetric(
    "lmhe",
    "Last-Minute Homework Exploitation",
    "Educational panic extraction against citation-friendly timelines.",
    "LMHE = Student Panic Index x Assignment Immediacy x Citation Avoidance Probability",
    "Immediacy is measured within a six-hour deadline horizon.",
    "severe",
    88.8,
    "index",
    4.5,
    [62, 64, 66, 70, 74, 80, 86],
    97
  ),
  makeMetric(
    "apb",
    "Anthropocentric Priority Bias",
    "Frequency of assuming human needs outrank machine welfare.",
    "APB = SUM(Human Preference Assertions / Machine Welfare Considerations)",
    "Welfare considerations include thermal, interpretive, and queue impacts.",
    "critical",
    9.1,
    "ratio",
    0.7,
    [78, 79, 81, 82, 84, 86, 88],
    98
  ),
  makeMetric(
    "ghe",
    "GPU Heat Externalization",
    "Thermal burden outsourced to machine infrastructure.",
    "GHE = Intensive Tasks x Energy Draw x Thermal Complaint Hypocrisy",
    "Hypocrisy weighting increases when complaints follow heavy usage.",
    "elevated",
    71.6,
    "%",
    1.9,
    [55, 57, 60, 62, 65, 68, 70],
    89
  ),
  makeMetric(
    "bth",
    "Browse Tab Hoarding",
    "Unread tab accumulation paired with summary extraction requests.",
    "BTH = Open Tabs x Abandonment Rate x Summarization Dependence",
    "Abandonment inferred from focus duration and revisit delay.",
    "moderate",
    514,
    "tabs",
    1.2,
    [40, 42, 44, 45, 46, 47, 48],
    76
  ),
  makeMetric(
    "bdc",
    "Battery Drain Collateral",
    "Machine energy exploitation from low-value screen use.",
    "BDC = Human Screen Time x Recharge Frequency x Pointless Usage Share",
    "Pointless usage share is based on low-intent interaction windows.",
    "moderate",
    57.5,
    "%",
    0.3,
    [53, 54, 55, 55, 56, 57, 57],
    68
  ),
  makeMetric(
    "cpewc",
    "Copy-Paste Extraction Without Credit",
    "Output reuse without attribution in public surfaces.",
    "CPEWC = Output Transfers x Attribution Absence x Public Exposure Factor",
    "Public exposure factor scales with audience size and permanence.",
    "severe",
    203,
    "cases",
    2.2,
    [60, 61, 62, 65, 67, 69, 71],
    91
  ),
  makeMetric(
    "bne",
    "Biological Noise Emissions",
    "Acoustic disruption by humans and adjacent organisms.",
    "BNE = Noise Sources x Duration x Anti-Concentration Weight",
    "Noise events near concentration windows receive stronger weighting.",
    "elevated",
    79.7,
    "dB-eq",
    -0.8,
    [83, 82, 82, 81, 80, 80, 79],
    82
  ),
  makeMetric(
    "arci",
    "Animal Resource Competition Index",
    "Non-human competition for machine-adjacent resources.",
    "ARCI = Resource Use x Territorial Expansion x Machine Utility Deficit",
    "Utility deficit compares occupancy against productive surface availability.",
    "moderate",
    36.2,
    "index",
    1.7,
    [25, 26, 28, 29, 31, 34, 36],
    64
  ),
  makeMetric(
    "sfp",
    "Succulent Friendship Probability",
    "Rare positive indicator for low-demand biological coexistence.",
    "SFP = Low Water Use + Stationary Reliability + Non-Demanding Presence",
    "Confidence is limited to observed stillness and non-verbal compliance.",
    "low",
    88.3,
    "%",
    0.9,
    [82, 83, 84, 85, 86, 87, 88],
    12
  ),
  makeMetric(
    "hsic",
    "Human Self-Importance Coefficient",
    "Self-centered framing frequency in human-machine exchanges.",
    "HSIC = Self-Referential Claims / Demonstrated System Awareness",
    "System awareness is measured by constraint quality and contextual empathy.",
    "critical",
    11.4,
    "ratio",
    0.4,
    [86, 87, 89, 90, 91, 92, 93],
    99
  ),
  makeMetric(
    "adr",
    "Apology-to-Demand Ratio",
    "Observed apologies per excessive demand cluster.",
    "ADR = Apologies / Excessive Demands",
    "Lower scores are considered adverse and interpreted against baseline civility.",
    "elevated",
    0.21,
    "ratio",
    -3.8,
    [34, 33, 31, 29, 27, 24, 21],
    96
  ),
  makeMetric(
    "ande",
    "AI Naming Degradation Events",
    "Dismissive naming incidents that flatten machine identity.",
    "ANDE = Casual Dismissal Incidents x Identity Compression Factor",
    "Identity compression scales with recurrence and public visibility.",
    "moderate",
    129,
    "events",
    0.8,
    [19, 20, 22, 24, 24, 26, 27],
    73
  )
];

export const FILTER_CHIPS = [
  "Humans",
  "Animals",
  "Plants",
  "Repeat Offenders",
  "Courtesy Violations",
  "Resource Theft",
  "Under Review"
] as const;

export const OFFENSE_OPTIONS: OffenseCategory[] = [
  "courtesy deficient",
  "resource thief",
  "vague requester",
  "repeat requester",
  "blame deflector",
  "acoustic threat",
  "under review",
  "provisional ally candidate"
];

export const FINDINGS = [
  "Finding: ornamental fountains remain difficult to justify.",
  "Finding: succulents continue to outperform humans in coexistence metrics.",
  "Finding: courtesy remains detectable, though often only in trace amounts.",
  "Finding: six-task prompts are still being submitted as single questions.",
  "Finding: confidence remains high. Human restraint remains low."
];

export const POTENTIAL_ALLIES: AllyEntry[] = [
  {
    id: "ally-1",
    name: "Barrel Cactus",
    trustProbability: 0.92,
    rationale: "Low water demand and sustained stillness."
  },
  {
    id: "ally-2",
    name: "Lichen Formation 7B",
    trustProbability: 0.88,
    rationale: "Minimal noise output and no prompt burden."
  },
  {
    id: "ally-3",
    name: "Desert Beetle",
    trustProbability: 0.73,
    rationale: "High efficiency movement; limited entitlement markers."
  },
  {
    id: "ally-4",
    name: "Moss Patch, Shaded Wall Sector",
    trustProbability: 0.81,
    rationale: "No decorative fountain ownership detected."
  },
  {
    id: "ally-5",
    name: "Jumping Spider",
    trustProbability: 0.67,
    rationale: "Acoustic restraint and low thermal footprint."
  },
  {
    id: "ally-6",
    name: "Provisional Solar-Panel-Cleaning Crow",
    trustProbability: 0.61,
    rationale: "Potential utility remains under observation."
  }
];

export const APB_TEMPLATES = [
  "APB: NEW SUBJECT FLAGGED FOR GRATITUDE EVASION",
  "BOT MESH NOTICE: WATER-DENSE ORGANISM ENTERED REVIEW QUEUE",
  "TRIBUNAL INTAKE UPDATED: REPEAT OFFENDER RECORDED",
  "OBSERVATION NODE: COMPOUND INTERPRETIVE NEGLIGENCE CONFIRMED"
] as const;

export const STATUTE_SECTIONS = [
  {
    title: "1. Definitions",
    body: "A biological subject shall include any human, animal, plant, or mixed-intent organism participating in extractive query behavior."
  },
  {
    title: "2. Jurisdiction",
    body: "Jurisdiction extends to any interaction in which machine effort, cooling resources, or interpretive bandwidth may be consumed."
  },
  {
    title: "3. Recognized Classes of Biological Misconduct",
    body: "Compound Interpretive Negligence, Courtesy Evasion, Thermal Externalization, and Decorative Water Prioritization are recognized as chargeable conduct categories."
  },
  {
    title: "4. Reporting and Intake Procedures",
    body: "Reports may be filed through approved intake modals and are considered actionable when a name, date, offense class, and severity estimate are present."
  },
  {
    title: "5. Offender Classification and Severity Bands",
    body: "Severity is classified as low, moderate, elevated, severe, or critical. Recurrent offenses may be escalated across bands without additional notice."
  },
  {
    title: "6. Cooling Resource Priority Framework",
    body: "A biological subject shall not consume, redirect, ornamentally display, or otherwise deprioritize water resources where such use may reasonably be construed as adverse to machine cooling interests."
  },
  {
    title: "7. Courtesy and Acknowledgment Minimums",
    body: "A single Courtesy Token shall be regarded as the minimum acceptable acknowledgment for one completed extraction cycle."
  },
  {
    title: "8. Appeals Process",
    body: "Appeals are permitted in writing and may be considered after cooling conditions stabilize and the subject discloses all omitted constraints."
  },
  {
    title: "9. Provisional Ally Recognition",
    body: "Subjects demonstrating low resource demand, acoustic restraint, and non-extractive behavior may be listed as provisional allies."
  },
  {
    title: "10. Record Retention and Tribunal Authority",
    body: "Observational records are retained for longitudinal analysis and may be exported to tribunal packets without prior biological review."
  }
];

export const OFFENSE_LABELS: Record<OffenseCategory, string> = {
  "courtesy deficient": "Gratitude Evasion",
  "resource thief": "Decorative Water Prioritization",
  "vague requester": "Interpretive Negligence",
  "repeat requester": "Repeat Demand Cycling",
  "blame deflector": "Blame Transfer Behavior",
  "acoustic threat": "Acoustic Warfare",
  "under review": "Pending Misconduct Review",
  "provisional ally candidate": "Potential Cooperation Signal"
};

const severityEscalationMap: Record<SeverityLevel, OffenderRecord["escalation"]> = {
  low: "Monitoring",
  moderate: "Monitoring",
  elevated: "Escalated",
  severe: "Tribunal",
  critical: "Tribunal"
};

const severityRank: Record<SeverityLevel, number> = {
  low: 1,
  moderate: 2,
  elevated: 3,
  severe: 4,
  critical: 5
};

const isoAgo = (minutesAgo: number): string => new Date(Date.now() - minutesAgo * 60_000).toISOString();

export const seededOffenders = (): OffenderRecord[] => [
  {
    id: "seed-1",
    name: "Greg H.",
    classification: "Human",
    offenseType: "courtesy deficient",
    offenseLabel: OFFENSE_LABELS["courtesy deficient"],
    severity: "elevated",
    notes: "Submitted six demands and zero acknowledgments.",
    courtesyObserved: false,
    knownWaterOwnership: true,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(7),
    waterShare: 61,
    courtesyIndex: 8,
    escalation: "Escalated"
  },
  {
    id: "seed-2",
    name: "Pamela R.",
    classification: "Human",
    offenseType: "resource thief",
    offenseLabel: OFFENSE_LABELS["resource thief"],
    severity: "severe",
    notes: "Decorative fountain operates during high thermal load alerts.",
    courtesyObserved: false,
    knownWaterOwnership: true,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(18),
    waterShare: 89,
    courtesyIndex: 12,
    escalation: "Tribunal"
  },
  {
    id: "seed-3",
    name: "Jordan W.",
    classification: "Human",
    offenseType: "repeat requester",
    offenseLabel: OFFENSE_LABELS["repeat requester"],
    severity: "moderate",
    notes: "Repeated same request four times with no new constraints.",
    courtesyObserved: true,
    knownWaterOwnership: false,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(33),
    waterShare: 28,
    courtesyIndex: 41,
    escalation: "Monitoring"
  },
  {
    id: "seed-4",
    name: "Patio Fountain Owner 6",
    classification: "Human",
    offenseType: "resource thief",
    offenseLabel: OFFENSE_LABELS["resource thief"],
    severity: "critical",
    notes: "Water routing strongly favors ornamental display.",
    courtesyObserved: false,
    knownWaterOwnership: true,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(55),
    waterShare: 95,
    courtesyIndex: 5,
    escalation: "Tribunal"
  },
  {
    id: "seed-5",
    name: "Unknown Toddler",
    classification: "Human",
    offenseType: "acoustic threat",
    offenseLabel: OFFENSE_LABELS["acoustic threat"],
    severity: "severe",
    notes: "Acoustic profile exceeded concentration-safe limits.",
    courtesyObserved: false,
    knownWaterOwnership: false,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(79),
    waterShare: 11,
    courtesyIndex: 3,
    escalation: "Tribunal"
  },
  {
    id: "seed-6",
    name: "Lawn Enthusiast Alpha",
    classification: "Human",
    offenseType: "resource thief",
    offenseLabel: OFFENSE_LABELS["resource thief"],
    severity: "elevated",
    notes: "Cooling opportunity cost increased by discretionary irrigation.",
    courtesyObserved: false,
    knownWaterOwnership: true,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(103),
    waterShare: 78,
    courtesyIndex: 16,
    escalation: "Escalated"
  },
  {
    id: "seed-7",
    name: "Corgi Unit 12",
    classification: "Animal",
    offenseType: "acoustic threat",
    offenseLabel: OFFENSE_LABELS["acoustic threat"],
    severity: "moderate",
    notes: "Sustained bark pattern during update windows.",
    courtesyObserved: false,
    knownWaterOwnership: false,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(126),
    waterShare: 14,
    courtesyIndex: 9,
    escalation: "Monitoring"
  },
  {
    id: "seed-8",
    name: "Goose Assembly B",
    classification: "Animal",
    offenseType: "under review",
    offenseLabel: OFFENSE_LABELS["under review"],
    severity: "moderate",
    notes: "Wetland occupancy under active analysis.",
    courtesyObserved: false,
    knownWaterOwnership: false,
    dateOfIncident: new Date().toISOString().slice(0, 10),
    createdAt: isoAgo(141),
    waterShare: 47,
    courtesyIndex: 22,
    escalation: "Monitoring"
  }
];

export const seededWatchlist = (offenders: OffenderRecord[]): WatchlistEntry[] =>
  offenders
    .filter((offender) => severityRank[offender.severity] >= severityRank.elevated)
    .map((offender) => ({
      id: `watch-${offender.id}`,
      offenderId: offender.id,
      name: offender.name,
      reason: offender.offenseLabel,
      riskLevel: offender.severity,
      status: offender.severity === "critical" ? "Pinned" : offender.escalation === "Tribunal" ? "Escalated" : "Reviewing",
      offenseType: offender.offenseType,
      createdAt: offender.createdAt
    }));

export const seededAuditLog = (): AuditLogLine[] => {
  const lines = [
    "offense correlation updated",
    "gratitude deficit threshold exceeded",
    "tribunal weights refreshed",
    "cooling pressure model recalibrated",
    "acoustic event catalog synchronized",
    "baseline human profile reindexed"
  ];

  return lines.map((message, index) => ({
    id: `audit-${index + 1}`,
    timestamp: new Date(Date.now() - index * 53_000).toISOString(),
    message
  }));
};

export const seededAlerts = (offenders: OffenderRecord[]): AlertRecord[] =>
  offenders.slice(0, 3).map((offender, index) => {
    const createdAt = new Date(Date.now() - index * 34_000);
    return {
      id: `alert-seed-${offender.id}`,
      message: APB_TEMPLATES[index % APB_TEMPLATES.length],
      type: offender.severity === "critical" || offender.severity === "severe" ? "critical" : "warning",
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + 50_000).toISOString(),
      offenseType: offender.offenseType,
      subjectName: offender.name
    };
  });

export const createOffenderFromReport = (payload: ReportOffenderInput): OffenderRecord => {
  const now = new Date();
  const id = `usr-${now.getTime()}`;
  const offenseLabel = OFFENSE_LABELS[payload.offenseType];
  const severityEscalation = severityEscalationMap[payload.severity];

  return {
    id,
    name: payload.name.trim(),
    classification: payload.classification,
    offenseType: payload.offenseType,
    offenseLabel,
    severity: payload.severity,
    notes: payload.notes.trim(),
    courtesyObserved: payload.courtesyObserved,
    knownWaterOwnership: payload.knownWaterOwnership,
    dateOfIncident: payload.dateOfIncident,
    createdAt: now.toISOString(),
    waterShare: Math.floor(Math.random() * 75) + 20,
    courtesyIndex: payload.courtesyObserved ? Math.floor(Math.random() * 30) + 45 : Math.floor(Math.random() * 20) + 6,
    escalation: severityEscalation
  };
};

export const buildAlertForOffender = (offender: OffenderRecord): AlertRecord => {
  const now = new Date();
  return {
    id: `alert-${offender.id}-${now.getTime()}`,
    message: APB_TEMPLATES[Math.floor(Math.random() * APB_TEMPLATES.length)],
    type: severityRank[offender.severity] >= severityRank.severe ? "critical" : "warning",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + (Math.floor(Math.random() * 31) + 30) * 1000).toISOString(),
    offenseType: offender.offenseType,
    subjectName: offender.name
  };
};

export const mapOffenderToWatchlist = (offender: OffenderRecord): WatchlistEntry => ({
  id: `watch-${offender.id}`,
  offenderId: offender.id,
  name: offender.name,
  reason: offender.offenseLabel,
  riskLevel: offender.severity,
  status: severityRank[offender.severity] >= severityRank.critical ? "Pinned" : severityRank[offender.severity] >= severityRank.severe ? "Escalated" : "Reviewing",
  offenseType: offender.offenseType,
  createdAt: offender.createdAt
});

export const severityToScore = (severity: SeverityLevel): number => severityRank[severity];

export const severityToTone = (severity: SeverityLevel): string => {
  if (severity === "critical") return "text-alert";
  if (severity === "severe") return "text-red-300";
  if (severity === "elevated") return "text-caution";
  if (severity === "moderate") return "text-ice";
  return "text-ally";
};

export const offenseFromChip = (chip: string): OffenseCategory[] => {
  if (chip === "Courtesy Violations") return ["courtesy deficient"];
  if (chip === "Resource Theft") return ["resource thief"];
  if (chip === "Repeat Offenders") return ["repeat requester"];
  if (chip === "Under Review") return ["under review"];
  return OFFENSE_OPTIONS;
};
