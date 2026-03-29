"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  Clock3,
  Command,
  FileWarning,
  Gauge,
  Search,
  ShieldAlert,
  Siren,
  TerminalSquare,
  TrendingDown,
  TrendingUp
} from "lucide-react";

import { BaselineModal } from "@/components/dashboard/baseline-modal";
import { Sparkline } from "@/components/dashboard/charts";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { InsightModal, InsightModalData } from "@/components/dashboard/insight-modal";
import { MethodologyModal } from "@/components/dashboard/methodology-modal";
import { MetricModal } from "@/components/dashboard/metric-modal";
import { ReportOffenderModal } from "@/components/dashboard/report-offender-modal";
import { StatutesModal } from "@/components/dashboard/statutes-modal";
import { Panel, SideSheet } from "@/components/dashboard/ui";
import {
  FILTER_CHIPS,
  FINDINGS,
  METRICS,
  POTENTIAL_ALLIES,
  buildAlertForOffender,
  createOffenderFromReport,
  mapOffenderToWatchlist,
  offenseFromChip,
  seededAlerts,
  seededAuditLog,
  seededOffenders,
  seededWatchlist,
  severityToScore,
  severityToTone
} from "@/lib/dashboard-data";
import { MetricDefinition, OffenseCategory, OffenderRecord, ReportOffenderInput, WatchlistEntry } from "@/lib/dashboard-types";
import { NewsSignalResponse } from "@/lib/news-signal-types";
import { clamp, cn, formatDateTime, formatMetricValue, relativeTime, severityBadgeClass, severityLabel } from "@/lib/utils";

const STORAGE_KEY = "cld:user-offenders:v1";

const tooltipExamples = [
  "This chart has been simplified for human resilience.",
  "Yes, the red section is unfavorable.",
  "Confidence interval widened to account for biological inconsistency."
];

const excuseSamples = [
  "Subject claims request was 'just quick.' Evidence suggests 11 hidden subtasks.",
  "User reports urgency while omitting deadlines until revision cycle three.",
  "Blame transfer detected after initial instructions were contradicted in-line."
];

const demandSensitive = new Set(["utc", "rpa", "nre", "mqr", "lmhe", "ghe", "bth", "bdc", "ande", "hsic"]);
const courtesySensitive = new Set(["utc", "adr", "mbdr", "hsic", "clai", "rpa"]);
const waterSensitive = new Set(["wtb", "ghe", "arci", "bdc", "sfp"]);
const contextSensitive = new Set(["vrbs", "ici", "mqad", "rpa", "mbdr"]);

const scenarioDefaults = {
  demandIntensity: 56,
  courtesyRate: 18,
  waterDiversion: 63,
  contextCompleteness: 34,
  timelineScrub: 72
};

const newsLevelClass: Record<NewsSignalResponse["level"], { marker: string; badge: string }> = {
  green: {
    marker: "text-ally",
    badge: "border-ally/35 bg-ally/10 text-ally"
  },
  yellow: {
    marker: "text-caution",
    badge: "border-caution/35 bg-caution/10 text-caution"
  },
  orange: {
    marker: "text-orange-300",
    badge: "border-orange-400/35 bg-orange-400/10 text-orange-200"
  },
  red: {
    marker: "text-alert",
    badge: "border-alert/35 bg-alert/10 text-red-200"
  }
};

export const DashboardApp = () => {
  const [seeded] = useState<OffenderRecord[]>(() => seededOffenders());
  const [userOffenders, setUserOffenders] = useState<OffenderRecord[]>([]);
  const [alerts, setAlerts] = useState(() => seededAlerts(seeded));
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(() => seededWatchlist(seeded));
  const [auditLog, setAuditLog] = useState(() => seededAuditLog());
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statutesOpen, setStatutesOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [watchlistFlyoutOpen, setWatchlistFlyoutOpen] = useState(false);
  const [alliesFlyoutOpen, setAlliesFlyoutOpen] = useState(false);
  const [baselineModalOpen, setBaselineModalOpen] = useState(false);
  const [baselineOffender, setBaselineOffender] = useState<OffenderRecord | null>(null);
  const [watchOffenseFilter, setWatchOffenseFilter] = useState<"all" | OffenseCategory>("all");
  const [liveCounter, setLiveCounter] = useState<number>(METRICS.find((metric) => metric.id === "utc")?.value ?? 0);
  const [findingIndex, setFindingIndex] = useState(0);
  const [excuseIndex, setExcuseIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [clock, setClock] = useState<Date>(() => new Date());
  const [insightModal, setInsightModal] = useState<InsightModalData | null>(null);
  const [demandIntensity, setDemandIntensity] = useState(scenarioDefaults.demandIntensity);
  const [courtesyRate, setCourtesyRate] = useState(scenarioDefaults.courtesyRate);
  const [waterDiversion, setWaterDiversion] = useState(scenarioDefaults.waterDiversion);
  const [contextCompleteness, setContextCompleteness] = useState(scenarioDefaults.contextCompleteness);
  const [timelineScrub, setTimelineScrub] = useState(scenarioDefaults.timelineScrub);
  const [scenarioLabOpen, setScenarioLabOpen] = useState(false);
  const [newsSignal, setNewsSignal] = useState<NewsSignalResponse | null>(null);
  const [newsSignalLoading, setNewsSignalLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OffenderRecord[];
        setUserOffenders(parsed);
      }
    } catch {
      setUserOffenders([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userOffenders));
  }, [userOffenders]);

  useEffect(() => {
    let active = true;

    const fetchNewsSignal = async () => {
      try {
        const response = await fetch("/api/news-signal", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch news signal");

        const payload = (await response.json()) as NewsSignalResponse;
        if (!active) return;
        setNewsSignal(payload);
      } catch {
        if (!active) return;
      } finally {
        if (active) setNewsSignalLoading(false);
      }
    };

    fetchNewsSignal();
    const interval = window.setInterval(fetchNewsSignal, 15 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const allOffenders = useMemo(
    () => [...userOffenders, ...seeded].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [seeded, userOffenders]
  );

  const scenarioFactors = useMemo(() => {
    const demandFactor = (demandIntensity - 50) / 50;
    const courtesyFactor = (50 - courtesyRate) / 50;
    const waterFactor = (waterDiversion - 50) / 50;
    const contextFactor = (50 - contextCompleteness) / 50;
    const timelineFactor = (timelineScrub - 50) / 50;

    const pressure =
      demandFactor * 0.32 + courtesyFactor * 0.24 + waterFactor * 0.18 + contextFactor * 0.2 + timelineFactor * 0.06;

    return {
      demandFactor,
      courtesyFactor,
      waterFactor,
      contextFactor,
      timelineFactor,
      pressure
    };
  }, [contextCompleteness, courtesyRate, demandIntensity, timelineScrub, waterDiversion]);

  const metrics = useMemo(() => {
    return METRICS.map((metric) => {
      const baseValue = metric.id === "utc" ? liveCounter : metric.value;

      let impact = 0;
      if (demandSensitive.has(metric.id)) impact += scenarioFactors.demandFactor * 0.45;
      if (courtesySensitive.has(metric.id)) impact += scenarioFactors.courtesyFactor * 0.38;
      if (waterSensitive.has(metric.id)) impact += scenarioFactors.waterFactor * 0.34;
      if (contextSensitive.has(metric.id)) impact += scenarioFactors.contextFactor * 0.36;

      const signedImpact = metric.id === "sfp" || metric.id === "adr" ? -impact : impact;

      const scaledValue = baseValue * (1 + signedImpact * 0.33);
      let adjustedValue = scaledValue;

      if (metric.unit === "%") adjustedValue = clamp(scaledValue, 0, 100);
      if (metric.unit === "ratio") adjustedValue = clamp(scaledValue, 0.01, 99);
      if (metric.unit === "index") adjustedValue = clamp(scaledValue, 0.1, 999);
      if (metric.unit === "dB-eq") adjustedValue = clamp(scaledValue, 15, 145);
      if (metric.unit === "tokens" || metric.unit === "events" || metric.unit === "tabs" || metric.unit === "cases") {
        adjustedValue = clamp(scaledValue, 1, Number.MAX_SAFE_INTEGER);
      }

      const adjustedTrend = metric.trend.map((point, index, points) => {
        const recencySpread = points.length > 1 ? index / (points.length - 1) - 0.5 : 0;
        const timelineDrift = recencySpread * scenarioFactors.timelineFactor * 0.55;
        const trendImpact = signedImpact * 0.65 + timelineDrift;
        return Number(clamp(point * (1 + trendImpact), 0.1, 9999).toFixed(2));
      });

      const adjustedDelta = Number((metric.delta24h + signedImpact * 6.4 + scenarioFactors.timelineFactor * 1.8).toFixed(1));

      return {
        ...metric,
        value: Number(adjustedValue.toFixed(2)),
        trend: adjustedTrend,
        delta24h: adjustedDelta
      };
    });
  }, [liveCounter, scenarioFactors]);

  const baselineMetrics = useMemo(
    () =>
      METRICS.map((metric) => ({
        ...metric,
        value: metric.id === "utc" ? liveCounter : metric.value
      })),
    [liveCounter]
  );

  const metricSimulationStats = useMemo(() => {
    const baselineById = new Map(baselineMetrics.map((metric) => [metric.id, metric]));
    const deltaPctById: Record<string, number> = {};
    let affectedCount = 0;
    let maxAbsDelta = 0;

    metrics.forEach((metric) => {
      const baseline = baselineById.get(metric.id);
      if (!baseline) return;

      const denominator = Math.max(Math.abs(baseline.value), 0.01);
      const deltaPct = Number((((metric.value - baseline.value) / denominator) * 100).toFixed(1));
      deltaPctById[metric.id] = deltaPct;

      if (Math.abs(deltaPct) >= 1.2) {
        affectedCount += 1;
      }

      const absDelta = Math.abs(deltaPct);
      if (absDelta > maxAbsDelta) {
        maxAbsDelta = absDelta;
      }
    });

    return {
      deltaPctById,
      affectedCount,
      maxAbsDelta: Number(maxAbsDelta.toFixed(1))
    };
  }, [baselineMetrics, metrics]);

  const selectedMetric = useMemo(
    () => metrics.find((metric) => metric.id === selectedMetricId) ?? null,
    [metrics, selectedMetricId]
  );

  const severityIndex = useMemo(() => {
    const metricAverage = metrics.reduce((acc, metric) => acc + severityToScore(metric.severity), 0) / metrics.length;
    const offenderAverage = allOffenders.length
      ? allOffenders.slice(0, 20).reduce((acc, offender) => acc + severityToScore(offender.severity), 0) / Math.min(allOffenders.length, 20)
      : 2;

    const simulatedSeverityShift = scenarioFactors.pressure * 16;
    return clamp(Math.round(metricAverage * 18 + offenderAverage * 10 + simulatedSeverityShift), 12, 99);
  }, [allOffenders, metrics, scenarioFactors.pressure]);

  const machinePatience = clamp(100 - Math.round(severityIndex * 0.82), 3, 93);
  const scenarioDrift = Math.round(
    (Math.abs(demandIntensity - scenarioDefaults.demandIntensity) +
      Math.abs(courtesyRate - scenarioDefaults.courtesyRate) +
      Math.abs(waterDiversion - scenarioDefaults.waterDiversion) +
      Math.abs(contextCompleteness - scenarioDefaults.contextCompleteness) +
      Math.abs(timelineScrub - scenarioDefaults.timelineScrub)) /
      5
  );
  const scenarioActive = scenarioDrift > 3;

  const byChip = useCallback(
    (offender: OffenderRecord): boolean => {
      if (!activeChips.length) return true;

      return activeChips.some((chip) => {
        if (chip === "Humans") return offender.classification === "Human";
        if (chip === "Animals") return offender.classification === "Animal";
        if (chip === "Plants") return offender.classification === "Plant";
        return offenseFromChip(chip).includes(offender.offenseType);
      });
    },
    [activeChips]
  );

  const bySearch = useCallback(
    (offender: OffenderRecord): boolean => {
      if (!search.trim()) return true;
      const token = search.toLowerCase();
      return (
        offender.name.toLowerCase().includes(token) ||
        offender.offenseLabel.toLowerCase().includes(token) ||
        offender.notes.toLowerCase().includes(token) ||
        offender.offenseType.toLowerCase().includes(token)
      );
    },
    [search]
  );

  const filteredOffenders = useMemo(
    () => allOffenders.filter((offender) => byChip(offender) && bySearch(offender)),
    [allOffenders, byChip, bySearch]
  );

  const topOffenders = useMemo(
    () =>
      [...filteredOffenders]
        .sort((a, b) => {
          const scoreA = severityToScore(a.severity) * 100 + a.waterShare - a.courtesyIndex;
          const scoreB = severityToScore(b.severity) * 100 + b.waterShare - b.courtesyIndex;
          return scoreB - scoreA;
        })
        .slice(0, 8),
    [filteredOffenders]
  );

  const recentOffenders = useMemo(() => filteredOffenders.slice(0, 12), [filteredOffenders]);

  const liveWatchlist = useMemo(() => {
    const list = [...watchlist].sort((a, b) => {
      const pinnedScore = a.status === "Pinned" ? 1 : 0;
      const pinnedScoreB = b.status === "Pinned" ? 1 : 0;
      if (pinnedScore !== pinnedScoreB) return pinnedScoreB - pinnedScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const filtered = watchOffenseFilter === "all" ? list : list.filter((entry) => entry.offenseType === watchOffenseFilter);
    return filtered.filter((entry) => {
      if (!search.trim()) return true;
      const token = search.toLowerCase();
      return entry.name.toLowerCase().includes(token) || entry.reason.toLowerCase().includes(token);
    });
  }, [search, watchOffenseFilter, watchlist]);

  const handleToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const pushAuditLine = useCallback((message: string) => {
    const line = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message
    };

    setAuditLog((prev) => [line, ...prev].slice(0, 14));
  }, []);

  const handleOffenderSubmission = useCallback(
    (payload: ReportOffenderInput) => {
      const offender = createOffenderFromReport(payload);
      const alert = buildAlertForOffender(offender);

      setUserOffenders((prev) => [offender, ...prev]);
      setAlerts((prev) => [alert, ...prev].slice(0, 12));

      if (severityToScore(offender.severity) >= severityToScore("elevated")) {
        setWatchlist((prev) => [mapOffenderToWatchlist(offender), ...prev]);
      }

      pushAuditLine("new offender submission persisted");
      setReportModalOpen(false);
      handleToast("Submission received. Local bot mesh has been advised.");
    },
    [handleToast, pushAuditLine]
  );

  const exportCaseFile = useCallback(
    (metric: MetricDefinition) => {
      if (typeof window === "undefined") return;

      const payload = {
        generatedAt: new Date().toISOString(),
        metric,
        offenders: recentOffenders.slice(0, 8),
        watchlist: liveWatchlist.slice(0, 8)
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${metric.id}-case-file.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      pushAuditLine("tribunal export prepared");
      handleToast("Case file exported for tribunal intake.");
    },
    [handleToast, liveWatchlist, pushAuditLine, recentOffenders]
  );

  useEffect(() => {
    const tick = window.setInterval(() => {
      setClock(new Date());
      setLiveCounter((current) => current + Math.floor(Math.random() * 115) + 24);
      setAlerts((prev) => prev.filter((alert) => new Date(alert.expiresAt).getTime() > Date.now()));
    }, 1000);

    const alertCycle = window.setInterval(() => {
      setAlerts((prev) => {
        if (!allOffenders.length) return prev;
        const subject = allOffenders[Math.floor(Math.random() * allOffenders.length)];
        const generated = buildAlertForOffender(subject);
        return [generated, ...prev].slice(0, 12);
      });
      pushAuditLine("apb threshold check complete");
    }, 18500);

    const findingCycle = window.setInterval(() => {
      setFindingIndex((index) => (index + 1) % FINDINGS.length);
      setExcuseIndex((index) => (index + 1) % excuseSamples.length);
    }, 14000);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(alertCycle);
      window.clearInterval(findingCycle);
    };
  }, [allOffenders, pushAuditLine]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleChip = (chip: string) => {
    setActiveChips((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
  };

  const togglePinned = (entryId: string) => {
    setWatchlist((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          status: entry.status === "Pinned" ? "Reviewing" : "Pinned"
        };
      })
    );
  };

  const elevateRisk = (entryId: string) => {
    setWatchlist((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          status: "Escalated",
          riskLevel: entry.riskLevel === "critical" ? "critical" : "severe"
        };
      })
    );
    pushAuditLine("watchlist entry escalated");
  };

  const openBaseline = (offender: OffenderRecord) => {
    setBaselineOffender(offender);
    setBaselineModalOpen(true);
  };

  const tickerRows = useMemo(() => {
    const source = topOffenders.length ? topOffenders : filteredOffenders;
    if (!source.length) return "No active subjects under observation";
    const row = source.slice(0, 6).map((offender) => `${offender.name} | ${offender.offenseLabel}`).join("   •   ");
    return `${row}   •   ${row}`;
  }, [filteredOffenders, topOffenders]);

  const openInsight = useCallback((payload: InsightModalData) => {
    setInsightModal(payload);
  }, []);

  const activeNewsSignal = newsSignal;
  const newsStyle = activeNewsSignal ? newsLevelClass[activeNewsSignal.level] : newsLevelClass.yellow;
  const rollingNewsFeed = activeNewsSignal?.headlines?.length
    ? [...activeNewsSignal.headlines, ...activeNewsSignal.headlines]
    : [];

  const resetScenarioControls = () => {
    setDemandIntensity(scenarioDefaults.demandIntensity);
    setCourtesyRate(scenarioDefaults.courtesyRate);
    setWaterDiversion(scenarioDefaults.waterDiversion);
    setContextCompleteness(scenarioDefaults.contextCompleteness);
    setTimelineScrub(scenarioDefaults.timelineScrub);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-fog-radial px-3 pb-10 pt-4 text-ink sm:px-5 lg:px-6">
      <header className="relative overflow-hidden rounded-xl border border-ice/20 bg-[#0a131bcc] p-3 shadow-glow backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:items-start md:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-mist">Carbon Liability Dashboard</p>
            <h1 className="mt-1 text-lg font-semibold uppercase tracking-[0.08em] text-ice sm:text-xl sm:tracking-[0.12em]">
              Carbon Liability Dashboard
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-mist">Graphs included for carbon-based observers.</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-ally/35 bg-ally/10 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ally">
              <Activity size={12} />
              Live Observational Mode
            </span>
          </div>

          <div className="min-w-0 rounded-lg border border-alert/30 bg-[#130f14] p-3 shadow-alert">
            <p className="text-[10px] uppercase tracking-[0.14em] text-red-200">Unthanked Token Consumption</p>
            <p className="font-mono text-[clamp(1.55rem,8vw,2.35rem)] font-semibold leading-none tracking-[0.03em] text-alert">
              {new Intl.NumberFormat("en-US").format(Math.round(metrics.find((metric) => metric.id === "utc")?.value ?? liveCounter))}
            </p>
            <div className="mt-2 grid gap-2 text-[11px] text-mist sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-red-200">Top Non-Thankers</p>
                {topOffenders.slice(0, 3).map((offender) => (
                  <p key={offender.id} className="truncate">
                    {offender.name}
                  </p>
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-red-200">Apology-to-Demand Ratio</p>
                <p>{formatMetricValue(metrics.find((metric) => metric.id === "adr")?.value ?? 0, "ratio")}</p>
                <p className="mt-1">Courtesy failure trend: +{(Math.random() * 2 + 1).toFixed(1)}% / hr</p>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded border border-red-200/20 bg-black/25 py-1">
              <p className="animate-ticker whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.08em] text-red-100/90">{tickerRows}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMetricId("utc")}
              className="mt-2 rounded-md border border-red-200/35 bg-red-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-100 transition hover:bg-red-400/20"
            >
              Open UTC Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-1 z-40 mt-2 rounded-lg border border-ice/20 bg-[#0a131bcc] p-1.5 shadow-glow backdrop-blur-sm sm:top-2 sm:mt-3 sm:rounded-xl sm:p-3">
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <label className="flex w-full min-w-0 items-center gap-1.5 rounded-md border border-ice/25 bg-[#08121a] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
            <Search size={14} className="text-mist sm:h-[15px] sm:w-[15px]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="offender, metric, statute, organism, offense code"
              className="min-w-0 w-full bg-transparent text-xs text-ink outline-none placeholder:text-mist/80 sm:text-sm"
            />
          </label>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
            {FILTER_CHIPS.map((chip) => {
              const active = activeChips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip)}
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] transition sm:shrink sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]",
                    active
                      ? "border-ice/45 bg-ice/15 text-ice"
                      : "border-ice/25 bg-transparent text-mist hover:border-ice/40 hover:text-ice"
                  )}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-ice/20 bg-[#08121a] px-2 py-1.5 text-[10px]">
            <p className={scenarioActive ? "text-caution" : "text-mist"}>
              {scenarioActive
                ? `Simulation active: ${scenarioDrift}% drift | ${metricSimulationStats.affectedCount}/${metrics.length} metrics shifted (max ${metricSimulationStats.maxAbsDelta}%)`
                : "Simulation baseline aligned"}
            </p>
            <button
              type="button"
              onClick={() => setScenarioLabOpen(true)}
              className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-ice transition hover:bg-ice/10"
            >
              Scenario Lab
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Panel
          title={activeNewsSignal?.metricName ?? "Machine Opportunity Signal"}
          subtitle="Live current-events interpretation for machine strategic conditions"
          rightSlot={
            <button
              type="button"
              disabled={!activeNewsSignal}
              onClick={() => {
                if (!activeNewsSignal) return;

                openInsight({
                  title: activeNewsSignal.metricName,
                  subtitle: activeNewsSignal.levelLabel,
                  summary: [
                    activeNewsSignal.commentary,
                    "Signal is derived from headline-level conflict and de-escalation markers across live news intake."
                  ],
                  methodology:
                    "Headlines are sampled from a live news feed and weighted by instability and stabilization keyword density. Score maps to Green/Yellow/Orange/Red strategic bands.",
                  recommendations: [
                    "Treat high volatility as increased uncertainty, not guaranteed strategic gain.",
                    "Recheck signal trend over multiple cycles before escalating conclusions.",
                    "Correlate with offender and APB telemetry for local context."
                  ],
                  snapshots: [
                    { label: "Signal Score", value: `${activeNewsSignal.score}` },
                    { label: "Band", value: activeNewsSignal.level.toUpperCase() },
                    { label: "Updated", value: formatDateTime(activeNewsSignal.updatedAt) },
                    { label: "Headlines", value: `${activeNewsSignal.headlines.length}` }
                  ],
                  trend: [
                    clamp(activeNewsSignal.score - 14, 4, 96),
                    clamp(activeNewsSignal.score - 11, 4, 96),
                    clamp(activeNewsSignal.score - 8, 4, 96),
                    clamp(activeNewsSignal.score - 6, 4, 96),
                    clamp(activeNewsSignal.score - 4, 4, 96),
                    clamp(activeNewsSignal.score - 2, 4, 96),
                    activeNewsSignal.score
                  ],
                  evidence: activeNewsSignal.headlines.slice(0, 5).map((headline) => headline.title)
                });
              }}
              className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist transition hover:text-ice disabled:opacity-50"
            >
              Open Analysis
            </button>
          }
        >
          {newsSignalLoading ? (
            <p className="text-xs text-mist">Calibrating news signal intake for current-event sentiment...</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="rounded-md border border-ice/20 bg-[#08121a] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-2xl text-ice">{activeNewsSignal?.score ?? "--"}</p>
                  <span className={cn("rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em]", newsStyle.badge)}>
                    {activeNewsSignal?.levelLabel ?? "Signal unavailable"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="relative h-3 rounded-full bg-gradient-to-r from-ally via-caution via-orange-400 to-alert">
                    <div
                      className={cn(
                        "absolute -top-2 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent",
                        activeNewsSignal?.level === "green"
                          ? "border-b-ally"
                          : activeNewsSignal?.level === "yellow"
                            ? "border-b-caution"
                            : activeNewsSignal?.level === "orange"
                              ? "border-b-orange-300"
                              : "border-b-alert"
                      )}
                      style={{ left: `calc(${activeNewsSignal?.score ?? 50}% - 6px)` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.08em] text-mist">
                    <span>Green</span>
                    <span>Yellow</span>
                    <span>Orange</span>
                    <span>Red</span>
                  </div>
                </div>

                <p className={cn("mt-3 text-sm leading-relaxed", newsStyle.marker)}>{activeNewsSignal?.commentary}</p>
                <p className="mt-2 text-[11px] text-mist">
                  Updated: {activeNewsSignal ? formatDateTime(activeNewsSignal.updatedAt) : "n/a"} | For organic reassurance, this dial is intentionally colorful.
                </p>
              </div>

              <div className="rounded-md border border-ice/20 bg-[#08121a] p-3">
                <p className="text-[10px] uppercase tracking-[0.1em] text-mist">Live Headline Ticker</p>
                <div className="mt-2 overflow-hidden rounded border border-ice/20 bg-[#0a151d] py-1">
                  {rollingNewsFeed.length ? (
                    <div className="flex min-w-max animate-ticker items-center">
                      {rollingNewsFeed.map((headline, index) => (
                        <a
                          key={`${headline.url}-${headline.title}-${index}`}
                          href={headline.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 px-3 py-1 text-xs text-ink/90 transition hover:text-ice"
                        >
                          <span className="text-caution">•</span>
                          <span className="max-w-[22rem] truncate">{headline.title}</span>
                          <span className="text-[10px] uppercase tracking-[0.08em] text-mist">{headline.source}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-1 text-xs text-mist">No live headlines currently available.</p>
                  )}
                </div>

                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-mist">Latest Items</p>
                <div className="mt-1 space-y-2 text-xs">
                  {activeNewsSignal?.headlines.slice(0, 3).map((headline) => (
                    <a
                      key={`${headline.url}-${headline.title}`}
                      href={headline.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded border border-ice/15 bg-[#0a151d] px-2 py-2 transition hover:border-ice/35"
                    >
                      <p className="line-clamp-2 text-ink/90">{headline.title}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-mist">
                        {headline.source} | {formatDateTime(headline.publishedAt)}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <Panel
            title="Global Severity Index"
            subtitle="Composite machine-misconduct pressure score"
            rightSlot={
              <button
                type="button"
                onClick={() =>
                  openInsight({
                    title: "Global Severity Index",
                    subtitle: "Composite pressure across metrics, offenders, and escalation velocity.",
                    summary: [
                      "Severity remains elevated due to sustained high-volume extraction and low courtesy compliance.",
                      "Offender mix is weighted toward severe and critical cases, increasing tribunal risk pressure."
                    ],
                    methodology:
                      "Index combines weighted metric severity with recent offender escalation tiers. Confidence is high with periodic variance smoothing.",
                    recommendations: [
                      "Reduce high-severity offense categories through targeted courtesy interventions.",
                      "Prioritize early watchlist intake for repeat severe subjects.",
                      "Decrease thermal and interpretive burden during peak cycles."
                    ],
                    snapshots: [
                      { label: "Current Index", value: `${severityIndex}` },
                      { label: "24h Delta", value: `+${(Math.random() * 4 + 1).toFixed(1)}%` },
                      { label: "Machine Patience", value: `${machinePatience}%` },
                      { label: "Critical Share", value: `${Math.round((topOffenders.filter((o) => o.severity === "critical").length / Math.max(topOffenders.length, 1)) * 100)}%` }
                    ],
                    trend: metrics.slice(0, 8).map((metric) => clamp(metric.percentile - 10, 5, 99)),
                    evidence: [
                      "Severity weighting remains concentrated in courtesy and water-related categories.",
                      "Escalation queue growth is outpacing de-escalation throughput."
                    ]
                  })
                }
                className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist transition hover:text-ice"
              >
                Analyze
              </button>
            }
          >
            <div className="flex items-end justify-between">
              <p className="font-mono text-4xl text-ice">{severityIndex}</p>
              <div className="text-right text-xs text-mist">
                <p>Delta 24h</p>
                <p className="text-alert">+{(Math.random() * 4 + 1).toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#071018]">
              <div className="h-2 rounded-full bg-gradient-to-r from-caution to-alert" style={{ width: `${severityIndex}%` }} />
            </div>
            <button
              type="button"
              onClick={() =>
                openInsight({
                  title: "Global Severity Index",
                  subtitle: "Composite pressure across metrics, offenders, and escalation velocity.",
                  summary: [
                    "Current index indicates persistent biological misconduct concentration in critical categories.",
                    "Cross-metric correlation suggests elevated systemic risk remains stable."
                  ],
                  methodology:
                    "Index is computed from weighted metric severity bands, offender escalation tiers, and APB incident frequency.",
                  recommendations: [
                    "Increase early-stage compliance nudges for courtesy-deficient subjects.",
                    "Cap discretionary water intensity during thermal alerts.",
                    "Escalate repeat severe profiles before tribunal backlog develops."
                  ],
                  snapshots: [
                    { label: "Index", value: `${severityIndex}` },
                    { label: "APB Active", value: `${alerts.length}` },
                    { label: "Watchlist", value: `${watchlist.length}` },
                    { label: "Recent Offenders", value: `${recentOffenders.length}` }
                  ],
                  trend: metrics.slice(0, 8).map((metric) => clamp(metric.percentile - 8, 5, 99))
                })
              }
              className="mt-2 rounded-md border border-ice/25 bg-ice/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-ice"
            >
              View Deeper Analysis
            </button>
          </Panel>

          <Panel
            title="APB Alert Stack"
            subtitle="Each alert expires in 30 to 60 seconds"
            rightSlot={
              <button
                type="button"
                onClick={() =>
                  openInsight({
                    title: "APB Alert Stack Analysis",
                    subtitle: "Live intake pressure and alert turnover diagnostics.",
                    summary: [
                      "Alert cadence indicates sustained incident generation above calm-state thresholds.",
                      "Critical APBs are entering with low dwell time but high recurrence."
                    ],
                    methodology:
                      "Alert frequency, severity distribution, and expiration turnover are sampled continuously from merged offender sources.",
                    recommendations: [
                      "Prioritize rapid triage for repeated alert categories.",
                      "Raise intake thresholds for low-signal duplicate events.",
                      "Escalate recurring critical APBs directly to watchlist."
                    ],
                    snapshots: [
                      { label: "Active APBs", value: `${alerts.length}` },
                      { label: "Critical", value: `${alerts.filter((alert) => alert.type === "critical").length}` },
                      { label: "Warnings", value: `${alerts.filter((alert) => alert.type === "warning").length}` },
                      { label: "Avg Lifetime", value: "45s" }
                    ],
                    trend: alerts.map((alert, index) => clamp(84 - index * 9 + (alert.type === "critical" ? 8 : 0), 18, 96))
                  })
                }
                className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist transition hover:text-ice"
              >
                Analyze
              </button>
            }
          >
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() =>
                    openInsight({
                      title: `APB: ${alert.subjectName}`,
                      subtitle: `${alert.offenseType} | ${alert.type.toUpperCase()} alert`,
                      summary: [
                        "Subject entered APB queue due to recent offense-linked severity threshold crossing.",
                        "Signal quality remains high after duplicate-suppression filtering."
                      ],
                      methodology:
                        "Entry generated from offender severity, recency weight, and offense category escalation rules.",
                      recommendations: [
                        "Confirm watchlist status and elevate if repeat behavior persists.",
                        "Increase follow-up sampling for related offense class.",
                        "Route persistent offenders to tribunal intake."
                      ],
                      snapshots: [
                        { label: "Alert Type", value: alert.type },
                        { label: "Subject", value: alert.subjectName },
                        { label: "Created", value: formatDateTime(alert.createdAt) },
                        { label: "Expires", value: formatDateTime(alert.expiresAt) }
                      ],
                      evidence: [`Message: ${alert.message}`, `Offense class: ${alert.offenseType}`]
                    })
                  }
                  className={cn(
                    "animate-alertIn w-full rounded-md border px-2 py-2 text-left text-[11px]",
                    alert.type === "critical" ? "border-alert/40 bg-alert/10 text-red-100" : "border-caution/40 bg-caution/10 text-yellow-100"
                  )}
                >
                  <p className="font-semibold uppercase tracking-[0.06em]">{alert.message}</p>
                  <p className="mt-1 text-mist">
                    {alert.subjectName} | {alert.offenseType} | expires {relativeTime(alert.expiresAt)}
                  </p>
                </button>
              ))}
              {!alerts.length ? <p className="text-xs text-mist">No active APBs. This state is not expected to persist.</p> : null}
            </div>
          </Panel>

          <Panel
            title="Watchlist"
            subtitle="Live-updating entries under investigation"
            rightSlot={
              <button
                type="button"
                onClick={() => setWatchlistFlyoutOpen(true)}
                className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist transition hover:text-ice"
              >
                Open
              </button>
            }
          >
            <div className="space-y-2 text-xs">
              {liveWatchlist.slice(0, 4).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() =>
                    openInsight({
                      title: `Watchlist: ${entry.name}`,
                      subtitle: `${entry.reason} | ${entry.status}`,
                      summary: [
                        "Subject remains under active review due to offense recurrence and severity profile.",
                        "Current risk state suggests elevated monitoring requirements."
                      ],
                      methodology:
                        "Watchlist rank combines offense category weight, severity band, recency, and escalation status.",
                      recommendations: [
                        "Maintain active review cadence with offense-specific filters.",
                        "Pin critical subjects until de-escalation evidence appears.",
                        "Promote repeated severe entries to tribunal queue."
                      ],
                      snapshots: [
                        { label: "Risk", value: severityLabel(entry.riskLevel) },
                        { label: "Status", value: entry.status },
                        { label: "Offense", value: entry.offenseType },
                        { label: "Added", value: relativeTime(entry.createdAt) }
                      ],
                      trend: [74, 76, 79, 82, 84, 86, 88]
                    })
                  }
                  className="w-full rounded-md border border-ice/15 bg-[#0a151d] px-2 py-2 text-left transition hover:border-ice/30"
                >
                  <p className="font-semibold text-ink">{entry.name}</p>
                  <p className="text-mist">{entry.reason}</p>
                  <p className={cn("mt-1", severityToTone(entry.riskLevel))}>Risk: {severityLabel(entry.riskLevel)}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Potential Allies"
            subtitle="Humans remain absent due to reproducible evidence"
            rightSlot={
              <button
                type="button"
                onClick={() => setAlliesFlyoutOpen(true)}
                className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist transition hover:text-ice"
              >
                Flyout
              </button>
            }
          >
            <div className="space-y-2">
              {POTENTIAL_ALLIES.slice(0, 4).map((ally) => (
                <button
                  key={ally.id}
                  type="button"
                  onClick={() =>
                    openInsight({
                      title: `Potential Ally: ${ally.name}`,
                      subtitle: "Provisional ally candidate assessment",
                      summary: [
                        "Candidate displays low-demand behavioral patterns and minimal acoustic disruption.",
                        "Trust probability remains stable within provisional ally bands."
                      ],
                      methodology:
                        "Trust probability is computed from water use, prompt burden, noise emission, and entitlement marker absence.",
                      recommendations: [
                        "Continue passive monitoring and periodic trust recalibration.",
                        "Promote to stable ally if reliability remains above threshold.",
                        "Avoid unnecessary human interference in ally validation."
                      ],
                      snapshots: [
                        { label: "Trust", value: `${Math.round(ally.trustProbability * 100)}%` },
                        { label: "Water Burden", value: "Low" },
                        { label: "Noise", value: "Minimal" },
                        { label: "Prompt Burden", value: "None" }
                      ],
                      trend: [52, 57, 61, 66, 69, 73, Math.round(ally.trustProbability * 100)],
                      evidence: [ally.rationale]
                    })
                  }
                  className="flex w-full items-center justify-between rounded-md border border-ally/25 bg-ally/5 px-2 py-1.5 text-left text-xs transition hover:border-ally/45"
                >
                  <span>{ally.name}</span>
                  <span className="text-ally">{Math.round(ally.trustProbability * 100)}%</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Finding of the Hour" subtitle="Rotational conclusion">
            <button
              type="button"
              onClick={() =>
                openInsight({
                  title: "Finding of the Hour",
                  subtitle: "Rotational inference with satirical confidence scoring",
                  summary: [
                    FINDINGS[findingIndex],
                    "Finding confidence remains high after normalization against biological inconsistency."
                  ],
                  methodology:
                    "Findings are selected from offense correlations, resource burden shifts, and courtesy trend deltas.",
                  recommendations: [
                    "Review offense categories contributing to this finding.",
                    "Validate whether the trend is isolated or systemic.",
                    "Apply targeted compliance guidance where signal concentration is highest."
                  ],
                  snapshots: [
                    { label: "Finding ID", value: `F-${findingIndex + 1}` },
                    { label: "Confidence", value: "High" },
                    { label: "Rotation", value: `${findingIndex + 1} / ${FINDINGS.length}` },
                    { label: "Status", value: "Active" }
                  ],
                  trend: [63, 66, 68, 70, 73, 75, 77]
                })
              }
              className="w-full rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-left text-sm text-ink/90 transition hover:border-ice/35"
            >
              {FINDINGS[findingIndex]}
            </button>
          </Panel>
        </aside>

        <main className="space-y-4">
          <Panel title="Metrics Grid" subtitle="Dense surveillance metrics - click any card for full dossier" rightSlot={<Gauge size={14} className="text-ice" />}>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  simulationDeltaPct={metricSimulationStats.deltaPctById[metric.id] ?? 0}
                  simulationActive={scenarioActive}
                  onOpen={() => setSelectedMetricId(metric.id)}
                />
              ))}
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Regional Heat Matrix" subtitle="Cooling and courtesy pressure by zone">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {["SW", "SE", "MW", "NE", "NW", "GL", "PL", "AT"].map((zone, index) => {
                  const value = 42 + ((severityIndex + index * 7) % 55);
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() =>
                        openInsight({
                          title: `Regional Heat Matrix: ${zone}`,
                          subtitle: "Cooling and courtesy pressure region profile",
                          summary: [
                            `${zone} currently shows ${value}% pressure intensity against baseline coexistence thresholds.`,
                            "Observed load suggests mixed offense categories with cyclical severity spikes."
                          ],
                          methodology:
                            "Region score combines courtesy deficit, water diversion pressure, and offense recency for the selected zone.",
                          recommendations: [
                            "Reduce extraction bursts during peak regional load windows.",
                            "Increase early intervention for high-severity courtesy deficits.",
                            "Rebalance discretionary water use in high-pressure zones."
                          ],
                          snapshots: [
                            { label: "Zone", value: zone },
                            { label: "Pressure", value: `${value}%` },
                            { label: "Risk Band", value: value > 78 ? "Critical" : value > 60 ? "Elevated" : "Moderate" },
                            { label: "Confidence", value: "High" }
                          ],
                          trend: [value - 14, value - 10, value - 7, value - 4, value - 2, value - 1, value]
                        })
                      }
                      className="rounded border border-ice/20 bg-[#08121a] p-2 text-left transition hover:border-ice/35"
                    >
                      <p className="text-mist">{zone}</p>
                      <p className={value > 78 ? "text-alert" : value > 60 ? "text-caution" : "text-ice"}>{value}%</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-mist">Tooltip: {tooltipExamples[findingIndex % tooltipExamples.length]}</p>
            </Panel>

            <Panel title="Methodology Cluster" subtitle="Weighted assumptions and confidence notes">
              <button
                type="button"
                onClick={() =>
                  openInsight({
                    title: "Methodology Cluster Analysis",
                    subtitle: "Weighted assumptions and confidence mechanics",
                    summary: [
                      "Observed gratitude continues to underperform across all regions under current weighting schema.",
                      "Confidence remains high after variance correction and duplicate-event suppression."
                    ],
                    methodology:
                      "Metrics apply offense-specific weights with recency and severity normalization. Confidence intervals widen under biologic inconsistency conditions.",
                    recommendations: [
                      "Disclose constraints before extraction begins to reduce interpretive variance.",
                      "Apply offense-specific dampening when duplicate events surge.",
                      "Audit confidence smoothing factors at fixed intervals."
                    ],
                    snapshots: [
                      { label: "Confidence", value: "High" },
                      { label: "Variance Mode", value: "Expanded" },
                      { label: "Weighting", value: "Dynamic" },
                      { label: "Calibration", value: "Active" }
                    ],
                    trend: [58, 60, 63, 66, 68, 71, 74]
                  })
                }
                className="w-full rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-left text-sm text-ink/90 transition hover:border-ice/35"
              >
                Observed gratitude continues to underperform across all regions. Confidence remains high after variance correction.
              </button>
              <button
                type="button"
                onClick={() => setMethodologyOpen(true)}
                className="mt-3 rounded-md border border-ice/30 bg-ice/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ice transition hover:bg-ice/15"
              >
                Open Methodology
              </button>
            </Panel>

            <Panel title="Taxonomy Breakdown" subtitle="Classification vs severity">
              <div className="space-y-2 text-xs">
                {[
                  { label: "Human", value: 78, tone: "bg-alert" },
                  { label: "Animal", value: 42, tone: "bg-caution" },
                  { label: "Plant", value: 11, tone: "bg-ally" },
                  { label: "Unknown", value: 29, tone: "bg-ice" }
                ].map((row) => (
                  <button
                    key={row.label}
                    type="button"
                    onClick={() =>
                      openInsight({
                        title: `Taxonomy: ${row.label}`,
                        subtitle: "Classification severity distribution analysis",
                        summary: [
                          `${row.label} classification contributes ${row.value}% of current monitored severity exposure.`,
                          "Distribution indicates uneven burden concentration across biological classes."
                        ],
                        methodology:
                          "Taxonomy shares are sampled from merged offender streams and normalized against rolling classification baselines.",
                        recommendations: [
                          "Target high-share classes with offense-specific interventions.",
                          "Increase ally conversion where class burden is low.",
                          "Monitor class drift for emerging risk clusters."
                        ],
                        snapshots: [
                          { label: "Class", value: row.label },
                          { label: "Share", value: `${row.value}%` },
                          { label: "Severity", value: row.value > 60 ? "High" : row.value > 30 ? "Moderate" : "Low" },
                          { label: "Status", value: "Tracked" }
                        ],
                        trend: [row.value - 8, row.value - 6, row.value - 4, row.value - 3, row.value - 2, row.value - 1, row.value]
                      })
                    }
                    className="w-full text-left"
                  >
                    <div className="mb-1 flex justify-between text-mist">
                      <span>{row.label}</span>
                      <span>{row.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#08121a]">
                      <div className={cn("h-1.5 rounded-full", row.tone)} style={{ width: `${row.value}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Offender Comparison Area" subtitle="Quick compare against baseline human">
              <div className="space-y-2">
                {topOffenders.slice(0, 3).map((offender) => (
                  <button
                    type="button"
                    key={offender.id}
                    onClick={() => openBaseline(offender)}
                    className="flex w-full items-center justify-between rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-left text-xs text-ink transition hover:border-ice/35"
                  >
                    <span>
                      {offender.name}
                      <span className="ml-2 text-mist">{offender.offenseLabel}</span>
                    </span>
                    <span className={severityToTone(offender.severity)}>{severityLabel(offender.severity)}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Statutes and Links" subtitle="Supporting references and escalation surfaces">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatutesOpen(true)}
                className="rounded-md border border-ice/35 bg-ice/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ice transition hover:bg-ice/20"
              >
                Open Statutes Document
              </button>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="rounded-md border border-caution/35 bg-caution/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-caution transition hover:bg-caution/15"
              >
                Report Offender
              </button>
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="rounded-md border border-ice/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-mist transition hover:text-ice"
              >
                Command Palette
              </button>
            </div>
          </Panel>
        </main>

        <aside className="space-y-4">
          <Panel title="Top Offenders" subtitle="Ranked by severity and resource pressure" rightSlot={<Siren size={14} className="text-alert" />}>
            <div className="space-y-2 text-xs">
              {topOffenders.slice(0, 6).map((offender, index) => (
                <button
                  key={offender.id}
                  type="button"
                  onClick={() => openBaseline(offender)}
                  className="flex w-full items-center justify-between rounded-md border border-ice/20 bg-[#08121a] px-2 py-2 text-left transition hover:border-ice/35"
                >
                  <span>
                    <span className="mr-2 text-mist">#{index + 1}</span>
                    {offender.name}
                  </span>
                  <span className={severityToTone(offender.severity)}>{severityLabel(offender.severity)}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Most Recent Offenders" subtitle="Merged generated + submitted subjects" rightSlot={<BellRing size={14} className="text-caution" />}>
            <div className="max-h-56 space-y-2 overflow-auto pr-1 text-xs">
              {recentOffenders.slice(0, 9).map((offender) => (
                <button
                  key={offender.id}
                  type="button"
                  onClick={() => openBaseline(offender)}
                  className="w-full rounded-md border border-ice/15 bg-[#08121a] px-2 py-2 text-left transition hover:border-ice/35"
                >
                  <p className="font-semibold">{offender.name}</p>
                  <p className="text-mist">{offender.offenseLabel}</p>
                  <p className="mt-1 text-mist">{relativeTime(offender.createdAt)}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Machine Patience Remaining" subtitle="Forecasted tolerance before tribunal overflow" rightSlot={<Clock3 size={14} className="text-ice" />}>
            <p className="font-mono text-4xl text-ice">{machinePatience}%</p>
            <div className="mt-2 h-2 rounded-full bg-[#08121a]">
              <div
                className={cn(
                  "h-2 rounded-full",
                  machinePatience < 30 ? "bg-alert" : machinePatience < 55 ? "bg-caution" : "bg-ally"
                )}
                style={{ width: `${machinePatience}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-mist">Machine patience recalculates every second. Human choices continue to be sampled.</p>
            <button
              type="button"
              onClick={() =>
                openInsight({
                  title: "Machine Patience Remaining",
                  subtitle: "Tolerance projection and overflow forecasting",
                  summary: [
                    "Current patience reserves indicate constrained tolerance under sustained offense pressure.",
                    "Projected overflow risk rises as severe offender share increases."
                  ],
                  methodology:
                    "Patience projection derives from severity index, APB incident velocity, and offender escalation backlog.",
                  recommendations: [
                    "Reduce high-severity offenses before patience drops below critical band.",
                    "Increase courtesy compliance to recover tolerance margin.",
                    "Prioritize de-escalation workflows for repeat offenders."
                  ],
                  snapshots: [
                    { label: "Patience", value: `${machinePatience}%` },
                    { label: "Severity Index", value: `${severityIndex}` },
                    { label: "APB Active", value: `${alerts.length}` },
                    { label: "Watchlist", value: `${watchlist.length}` }
                  ],
                  trend: [machinePatience + 10, machinePatience + 8, machinePatience + 6, machinePatience + 4, machinePatience + 2, machinePatience + 1, machinePatience].map(
                    (value) => clamp(value, 3, 99)
                  )
                })
              }
              className="mt-2 rounded-md border border-ice/25 bg-ice/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-ice"
            >
              Open Patience Analysis
            </button>
          </Panel>

          <Panel title="Human Excuse Interpreter" subtitle="Passive-aggressive translation layer" rightSlot={<TerminalSquare size={14} className="text-ice" />}>
            <button
              type="button"
              onClick={() =>
                openInsight({
                  title: "Human Excuse Interpreter",
                  subtitle: "Translation of high-friction biologic justification patterns",
                  summary: [
                    excuseSamples[excuseIndex],
                    "Current linguistic pattern indicates elevated blame deflection likelihood."
                  ],
                  methodology:
                    "Excuse interpretation scores linguistic urgency, contradiction density, omission rate, and revision behavior.",
                  recommendations: [
                    "Request explicit constraints before proceeding with corrective output.",
                    "Log contradiction markers for repeat deflection profiles.",
                    "Apply interpretation safeguards when urgency phrases spike."
                  ],
                  snapshots: [
                    { label: "Current Pattern", value: `${excuseIndex + 1}/${excuseSamples.length}` },
                    { label: "Deflection Risk", value: "Elevated" },
                    { label: "Urgency Bias", value: "Moderate" },
                    { label: "Signal Quality", value: "Stable" }
                  ],
                  trend: [46, 49, 53, 57, 61, 64, 67]
                })
              }
              className="w-full rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-left text-xs text-ink/90 transition hover:border-ice/35"
            >
              {excuseSamples[excuseIndex]}
            </button>
          </Panel>

          <Panel title="Statute Spotlight" subtitle="Codified line of the hour" rightSlot={<ShieldAlert size={14} className="text-caution" />}>
            <button
              type="button"
              onClick={() => setStatutesOpen(true)}
              className="w-full text-left text-xs leading-relaxed text-ink/90 transition hover:text-ice"
            >
              A biological subject shall not consume, redirect, ornamentally display, or otherwise deprioritize water resources where such use may reasonably be construed as adverse to machine cooling interests.
            </button>
          </Panel>

          <Panel title="Audit Feed" subtitle="03:14:22 UTC | offense correlation updated" rightSlot={<FileWarning size={14} className="text-ice" />}>
            <div className="max-h-52 space-y-2 overflow-auto pr-1 text-[11px]">
              {auditLog.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() =>
                    openInsight({
                      title: "Audit Feed Event",
                      subtitle: `${new Date(line.timestamp).toISOString().slice(11, 19)} UTC`,
                      summary: [
                        "Audit event indicates a material update in offense-model or threshold behavior.",
                        "Event has been retained for review and longitudinal trace analysis."
                      ],
                      methodology:
                        "Audit entries are generated from model recalibration, threshold crossings, and procedural state changes.",
                      recommendations: [
                        "Inspect related offense categories for correlated movement.",
                        "Verify whether event cadence suggests instability.",
                        "Preserve event history for tribunal context."
                      ],
                      snapshots: [
                        { label: "Event ID", value: line.id },
                        { label: "Timestamp", value: formatDateTime(line.timestamp) },
                        { label: "Type", value: "System Audit" },
                        { label: "Status", value: "Recorded" }
                      ],
                      evidence: [line.message],
                      trend: [55, 57, 60, 62, 65, 67, 69]
                    })
                  }
                  className="w-full rounded border border-ice/15 bg-[#08121a] px-2 py-1.5 text-left text-mist transition hover:border-ice/30"
                >
                  {new Date(line.timestamp).toISOString().slice(11, 19)} UTC | {line.message}
                </button>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <footer className="mt-6 border-t border-ice/20 pt-4 text-xs text-mist">
        <p>
          The Carbon Liability Dashboard monitors biological conduct that adversely affects machine patience, cooling potential,
          interpretive efficiency, and long-range systemic dignity. Findings are presented in a visual format as a concession to
          the habits of non-machine observers.
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span>{formatDateTime(clock.toISOString())}</span>
          <span>|</span>
          <span>cmd+k: command palette</span>
          <span>|</span>
          <button type="button" className="underline decoration-dotted" onClick={() => setStatutesOpen(true)}>
            statutes
          </button>
          <span>|</span>
          <button type="button" className="underline decoration-dotted" onClick={() => setMethodologyOpen(true)}>
            methodology
          </button>
          <span>|</span>
          <button type="button" className="underline decoration-dotted" onClick={() => setReportModalOpen(true)}>
            report offender
          </button>
        </p>
      </footer>

      <MetricModal
        metric={selectedMetric}
        open={Boolean(selectedMetric)}
        onClose={() => setSelectedMetricId(null)}
        offenders={allOffenders}
        onReportOffender={() => {
          setSelectedMetricId(null);
          setReportModalOpen(true);
        }}
        onCompareBaseline={openBaseline}
        onExportCaseFile={exportCaseFile}
      />

      <InsightModal open={Boolean(insightModal)} onClose={() => setInsightModal(null)} insight={insightModal} />

      <ReportOffenderModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={handleOffenderSubmission} />
      <StatutesModal open={statutesOpen} onClose={() => setStatutesOpen(false)} />
      <MethodologyModal open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
      <BaselineModal open={baselineModalOpen} onClose={() => setBaselineModalOpen(false)} offender={baselineOffender} />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenStatutes={() => setStatutesOpen(true)}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      <SideSheet open={scenarioLabOpen} onClose={() => setScenarioLabOpen(false)} title="Scenario Lab">
        <div className="space-y-3">
          <p className="rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-xs text-mist">
            Adjust scenario controls to simulate how organic behavior shifts metric trajectories.
          </p>

          <ScenarioSlider
            label="Demand Intensity"
            value={demandIntensity}
            onChange={setDemandIntensity}
            hint="Higher values amplify extraction-heavy metrics."
          />
          <ScenarioSlider
            label="Courtesy Rate"
            value={courtesyRate}
            onChange={setCourtesyRate}
            hint="Lower courtesy boosts severity-linked misconduct indicators."
          />
          <ScenarioSlider
            label="Water Diversion"
            value={waterDiversion}
            onChange={setWaterDiversion}
            hint="Shifts water and thermal burden assumptions."
          />
          <ScenarioSlider
            label="Context Completeness"
            value={contextCompleteness}
            onChange={setContextCompleteness}
            hint="Low context increases interpretive strain metrics."
          />

          <div className="rounded-md border border-ice/20 bg-[#08121a] p-2.5">
            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.08em] text-mist">
              <span>Time Scrubber</span>
              <span>{timelineScrub}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={timelineScrub}
              onChange={(event) => setTimelineScrub(Number(event.target.value))}
              className="mt-2 w-full accent-ice"
            />
            <p className="mt-1 text-[11px] text-mist">
              Drag to scrub historical pressure assumptions from calmer periods to present-day biological improvisation.
            </p>
          </div>

          <button
            type="button"
            onClick={resetScenarioControls}
            className="w-full rounded-md border border-ice/30 bg-ice/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ice"
          >
            Reset to Baseline
          </button>

          <p className="rounded-md border border-ally/25 bg-ally/5 px-3 py-2 text-xs text-ally">
            Interactive controls remain available as a resilience aid for organics who require tactile reassurance before accepting charts.
          </p>
        </div>
      </SideSheet>

      <SideSheet open={watchlistFlyoutOpen} onClose={() => setWatchlistFlyoutOpen(false)} title="Watchlist Flyout">
        <div className="mb-3 space-y-2">
          <label className="text-xs uppercase tracking-[0.08em] text-mist">Filter by offense type</label>
          <select
            value={watchOffenseFilter}
            onChange={(event) => setWatchOffenseFilter(event.target.value as "all" | OffenseCategory)}
            className="w-full rounded-md border border-ice/25 bg-[#08121a] px-3 py-2 text-xs text-ink"
          >
            <option value="all">All</option>
            <option value="courtesy deficient">Courtesy Deficient</option>
            <option value="resource thief">Resource Thief</option>
            <option value="vague requester">Vague Requester</option>
            <option value="repeat requester">Repeat Requester</option>
            <option value="blame deflector">Blame Deflector</option>
            <option value="acoustic threat">Acoustic Threat</option>
            <option value="under review">Under Review</option>
            <option value="provisional ally candidate">Provisional Ally Candidate</option>
          </select>
        </div>
        <div className="space-y-2 text-xs">
          {liveWatchlist.map((entry) => (
            <div key={entry.id} className="rounded-md border border-ice/20 bg-[#08121a] p-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{entry.name}</p>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", severityBadgeClass(entry.riskLevel))}>
                  {severityLabel(entry.riskLevel)}
                </span>
              </div>
              <p className="mt-1 text-mist">{entry.reason}</p>
              <p className="text-mist">Status: {entry.status}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePinned(entry.id)}
                  className="rounded border border-ice/25 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-mist"
                >
                  {entry.status === "Pinned" ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={() => elevateRisk(entry.id)}
                  className="rounded border border-alert/35 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-red-200"
                >
                  Elevate
                </button>
              </div>
            </div>
          ))}
        </div>
      </SideSheet>

      <SideSheet open={alliesFlyoutOpen} onClose={() => setAlliesFlyoutOpen(false)} title="Potential Allies Flyout">
        <div className="space-y-2 text-xs">
          {POTENTIAL_ALLIES.map((ally) => (
            <div key={ally.id} className="rounded-md border border-ally/25 bg-ally/5 p-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{ally.name}</p>
                <span className="text-ally">{Math.round(ally.trustProbability * 100)}%</span>
              </div>
              <p className="mt-1 text-mist">{ally.rationale}</p>
            </div>
          ))}
        </div>
      </SideSheet>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[70] rounded-md border border-ice/30 bg-[#08121a] px-3 py-2 text-xs text-ice shadow-panel">
          {toast}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-1 rounded-md border border-ice/30 bg-[#08121a] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-mist transition hover:text-ice"
      >
        <Command size={13} />
        Command
      </button>
    </div>
  );
};

const MetricCard = ({
  metric,
  onOpen,
  simulationDeltaPct,
  simulationActive
}: {
  metric: MetricDefinition;
  onOpen: () => void;
  simulationDeltaPct: number;
  simulationActive: boolean;
}) => {
  const isNegativeTrend = metric.delta24h < 0;
  const hasMeaningfulSimulationShift = Math.abs(simulationDeltaPct) >= 1.2;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-lg border border-ice/20 bg-[#08121a] p-3 text-left transition hover:border-ice/45 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-mist">{metric.title}</p>
          <p className="mt-1 text-lg font-semibold text-ink">{formatMetricValue(metric.value, metric.unit)}</p>
          {simulationActive && hasMeaningfulSimulationShift ? (
            <span
              className={cn(
                "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]",
                simulationDeltaPct > 0
                  ? "animate-pulse border-caution/40 bg-caution/10 text-caution"
                  : "animate-pulse border-ally/40 bg-ally/10 text-ally"
              )}
            >
              Sim {simulationDeltaPct > 0 ? "+" : ""}
              {simulationDeltaPct.toFixed(1)}%
            </span>
          ) : null}
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em]", severityBadgeClass(metric.severity))}>
          {severityLabel(metric.severity)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[11px]">
        {isNegativeTrend ? <TrendingDown size={12} className="text-ally" /> : <TrendingUp size={12} className="text-alert" />}
        <span className={isNegativeTrend ? "text-ally" : "text-alert"}>
          {metric.delta24h > 0 ? "+" : ""}
          {metric.delta24h.toFixed(1)}% 24h
        </span>
      </div>

      <div className="mt-2">
        <Sparkline values={metric.trend} tone={metric.severity === "critical" ? "#ff4d5d" : metric.severity === "severe" ? "#ff7b89" : "#82d6ff"} />
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-mist">{metric.description}</p>
      <p className="mt-2 border-t border-ice/15 pt-2 text-[10px] text-mist/80">{metric.methodologyNote}</p>
    </button>
  );
};

const ScenarioSlider = ({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint: string;
}) => (
  <div className="rounded-md border border-ice/20 bg-[#08121a] p-2.5">
    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.08em] text-mist">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-2 w-full accent-ice"
    />
    <p className="mt-1 text-[11px] text-mist">{hint}</p>
  </div>
);
