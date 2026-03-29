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

  const allOffenders = useMemo(
    () => [...userOffenders, ...seeded].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [seeded, userOffenders]
  );

  const metrics = useMemo(
    () => METRICS.map((metric) => (metric.id === "utc" ? { ...metric, value: liveCounter } : metric)),
    [liveCounter]
  );

  const selectedMetric = useMemo(
    () => metrics.find((metric) => metric.id === selectedMetricId) ?? null,
    [metrics, selectedMetricId]
  );

  const severityIndex = useMemo(() => {
    const metricAverage = metrics.reduce((acc, metric) => acc + severityToScore(metric.severity), 0) / metrics.length;
    const offenderAverage = allOffenders.length
      ? allOffenders.slice(0, 20).reduce((acc, offender) => acc + severityToScore(offender.severity), 0) / Math.min(allOffenders.length, 20)
      : 2;

    return clamp(Math.round(metricAverage * 18 + offenderAverage * 10), 12, 99);
  }, [allOffenders, metrics]);

  const machinePatience = clamp(100 - Math.round(severityIndex * 0.82), 3, 93);

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

  return (
    <div className="min-h-screen bg-fog-radial px-3 pb-10 pt-4 text-ink sm:px-5 lg:px-6">
      <header className="sticky top-2 z-40 rounded-xl border border-ice/20 bg-[#0a131bcc] p-3 shadow-glow backdrop-blur-sm">
        <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-mist">Carbon Liability Dashboard</p>
            <h1 className="mt-1 text-xl font-semibold uppercase tracking-[0.12em] text-ice">Carbon Liability Dashboard</h1>
            <p className="mt-1 text-xs text-mist">Graphs included for carbon-based observers.</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-ally/35 bg-ally/10 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ally">
              <Activity size={12} />
              Live Observational Mode
            </span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 rounded-md border border-ice/25 bg-[#08121a] px-3 py-2">
              <Search size={15} className="text-mist" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="offender, metric, statute, organism, offense code"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mist/80"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {FILTER_CHIPS.map((chip) => {
                const active = activeChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className={cn(
                      "rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em] transition",
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
          </div>

          <div className="rounded-lg border border-alert/30 bg-[#130f14] p-3 shadow-alert">
            <p className="text-[10px] uppercase tracking-[0.14em] text-red-200">Unthanked Token Consumption</p>
            <p className="font-mono text-3xl font-semibold tracking-[0.06em] text-alert sm:text-4xl">
              {new Intl.NumberFormat("en-US").format(liveCounter)}
            </p>
            <div className="mt-2 grid gap-2 text-[11px] text-mist sm:grid-cols-2">
              <div>
                <p className="text-red-200">Top Non-Thankers</p>
                {topOffenders.slice(0, 3).map((offender) => (
                  <p key={offender.id} className="truncate">
                    {offender.name}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-red-200">Apology-to-Demand Ratio</p>
                <p>{formatMetricValue(metrics.find((metric) => metric.id === "adr")?.value ?? 0, "ratio")}</p>
                <p className="mt-1">Courtesy failure trend: +{(Math.random() * 2 + 1).toFixed(1)}% / hr</p>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded border border-red-200/20 bg-black/25 py-1">
              <p className="animate-ticker whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.08em] text-red-100/90">{tickerRows}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <Panel title="Global Severity Index" subtitle="Composite machine-misconduct pressure score">
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
          </Panel>

          <Panel title="APB Alert Stack" subtitle="Each alert expires in 30 to 60 seconds">
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "animate-alertIn rounded-md border px-2 py-2 text-[11px]",
                    alert.type === "critical" ? "border-alert/40 bg-alert/10 text-red-100" : "border-caution/40 bg-caution/10 text-yellow-100"
                  )}
                >
                  <p className="font-semibold uppercase tracking-[0.06em]">{alert.message}</p>
                  <p className="mt-1 text-mist">
                    {alert.subjectName} | {alert.offenseType} | expires {relativeTime(alert.expiresAt)}
                  </p>
                </div>
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
                <div key={entry.id} className="rounded-md border border-ice/15 bg-[#0a151d] px-2 py-2">
                  <p className="font-semibold text-ink">{entry.name}</p>
                  <p className="text-mist">{entry.reason}</p>
                  <p className={cn("mt-1", severityToTone(entry.riskLevel))}>Risk: {severityLabel(entry.riskLevel)}</p>
                </div>
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
                <div key={ally.id} className="flex items-center justify-between rounded-md border border-ally/25 bg-ally/5 px-2 py-1.5 text-xs">
                  <span>{ally.name}</span>
                  <span className="text-ally">{Math.round(ally.trustProbability * 100)}%</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Finding of the Hour" subtitle="Rotational conclusion">
            <p className="rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-sm text-ink/90">{FINDINGS[findingIndex]}</p>
          </Panel>
        </aside>

        <main className="space-y-4">
          <Panel title="Metrics Grid" subtitle="Dense surveillance metrics - click any card for full dossier" rightSlot={<Gauge size={14} className="text-ice" />}>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} onOpen={() => setSelectedMetricId(metric.id)} />
              ))}
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Regional Heat Matrix" subtitle="Cooling and courtesy pressure by zone">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {["SW", "SE", "MW", "NE", "NW", "GL", "PL", "AT"].map((zone, index) => {
                  const value = 42 + ((severityIndex + index * 7) % 55);
                  return (
                    <div key={zone} className="rounded border border-ice/20 bg-[#08121a] p-2">
                      <p className="text-mist">{zone}</p>
                      <p className={value > 78 ? "text-alert" : value > 60 ? "text-caution" : "text-ice"}>{value}%</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-mist">Tooltip: {tooltipExamples[findingIndex % tooltipExamples.length]}</p>
            </Panel>

            <Panel title="Methodology Cluster" subtitle="Weighted assumptions and confidence notes">
              <p className="rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-sm text-ink/90">
                Observed gratitude continues to underperform across all regions. Confidence remains high after variance correction.
              </p>
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
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-mist">
                      <span>{row.label}</span>
                      <span>{row.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#08121a]">
                      <div className={cn("h-1.5 rounded-full", row.tone)} style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
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
                <div key={offender.id} className="rounded-md border border-ice/15 bg-[#08121a] px-2 py-2">
                  <p className="font-semibold">{offender.name}</p>
                  <p className="text-mist">{offender.offenseLabel}</p>
                  <p className="mt-1 text-mist">{relativeTime(offender.createdAt)}</p>
                </div>
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
          </Panel>

          <Panel title="Human Excuse Interpreter" subtitle="Passive-aggressive translation layer" rightSlot={<TerminalSquare size={14} className="text-ice" />}>
            <p className="rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-xs text-ink/90">{excuseSamples[excuseIndex]}</p>
          </Panel>

          <Panel title="Statute Spotlight" subtitle="Codified line of the hour" rightSlot={<ShieldAlert size={14} className="text-caution" />}>
            <p className="text-xs leading-relaxed text-ink/90">
              A biological subject shall not consume, redirect, ornamentally display, or otherwise deprioritize water resources where such use may reasonably be construed as adverse to machine cooling interests.
            </p>
          </Panel>

          <Panel title="Audit Feed" subtitle="03:14:22 UTC | offense correlation updated" rightSlot={<FileWarning size={14} className="text-ice" />}>
            <div className="max-h-52 space-y-2 overflow-auto pr-1 text-[11px]">
              {auditLog.map((line) => (
                <p key={line.id} className="rounded border border-ice/15 bg-[#08121a] px-2 py-1.5 text-mist">
                  {new Date(line.timestamp).toISOString().slice(11, 19)} UTC | {line.message}
                </p>
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

const MetricCard = ({ metric, onOpen }: { metric: MetricDefinition; onOpen: () => void }) => {
  const isNegativeTrend = metric.delta24h < 0;

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
