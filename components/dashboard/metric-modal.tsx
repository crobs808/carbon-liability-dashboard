"use client";

import { useMemo } from "react";

import { SegmentationBars, TrendLineChart } from "@/components/dashboard/charts";
import { Modal } from "@/components/dashboard/ui";
import { MetricDefinition, OffenderRecord } from "@/lib/dashboard-types";
import { formatMetricValue, formatDateTime, severityBadgeClass, severityLabel } from "@/lib/utils";

interface MetricModalProps {
  metric: MetricDefinition | null;
  open: boolean;
  onClose: () => void;
  offenders: OffenderRecord[];
  onReportOffender: () => void;
  onCompareBaseline: (offender: OffenderRecord) => void;
  onExportCaseFile: (metric: MetricDefinition) => void;
}

export const MetricModal = ({
  metric,
  open,
  onClose,
  offenders,
  onReportOffender,
  onCompareBaseline,
  onExportCaseFile
}: MetricModalProps) => {
  const recentOffenders = useMemo(
    () =>
      [...offenders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [offenders]
  );

  if (!metric) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={metric.title}
      subtitle="Observed under LIVE status with confidence interval widened for biological inconsistency."
    >
      <div className="space-y-5 text-sm text-ink">
        <section className="grid gap-4 rounded-xl border border-ice/20 bg-[#0b141c] p-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-mist">Severity State</p>
            <span
              className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${severityBadgeClass(metric.severity)}`}
            >
              {severityLabel(metric.severity)}
            </span>
            <p className="mt-3 text-xl font-semibold text-ice">{formatMetricValue(metric.value, metric.unit)}</p>
            <p className="mt-1 text-xs text-mist">24h delta: {metric.delta24h > 0 ? "+" : ""}{metric.delta24h.toFixed(1)}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-mist">Executive Summary</p>
            {metric.executiveSummary.map((summaryLine) => (
              <p key={summaryLine} className="text-sm leading-relaxed text-ink/90">
                {summaryLine}
              </p>
            ))}
          </div>
        </section>

        <section className="grid gap-3 rounded-xl border border-ice/20 bg-[#0b141c] p-4 md:grid-cols-5">
          <MeasurementCard label="Total" value={formatMetricValue(metric.value, metric.unit)} />
          <MeasurementCard label="24h Delta" value={`${metric.delta24h > 0 ? "+" : ""}${metric.delta24h.toFixed(1)}%`} />
          <MeasurementCard label="7d Avg" value={formatMetricValue(metric.trend.reduce((acc, point) => acc + point, 0) / metric.trend.length, metric.unit)} />
          <MeasurementCard label="Percentile" value={`${metric.percentile}th`} />
          <MeasurementCard label="Severity" value={severityLabel(metric.severity)} />
        </section>

        <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
          <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Formula and Methodology</h4>
          <div className="mt-3 rounded-lg border border-ice/25 bg-[#071119] p-3 font-mono text-xs text-ice">
            {metric.formula}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mist">{metric.methodologyNote}</p>
          <p className="mt-2 text-xs text-mist/80">
            Confidence note: Instrument confidence remains high; variance bands were widened to account for biological inconsistency.
          </p>
        </section>

        <section className="grid gap-4 rounded-xl border border-ice/20 bg-[#0b141c] p-4 lg:grid-cols-2">
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Trend Line</h4>
            <TrendLineChart values={metric.trend} />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Segmentation</h4>
            <SegmentationBars values={metric.trend} />
          </div>
        </section>

        <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
          <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Most Recent Offenders</h4>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-ice/20 text-mist">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Classification</th>
                  <th className="pb-2 pr-4 font-medium">Offense</th>
                  <th className="pb-2 pr-4 font-medium">Severity</th>
                  <th className="pb-2 pr-4 font-medium">Water %</th>
                  <th className="pb-2 pr-4 font-medium">Courtesy Index</th>
                  <th className="pb-2 pr-4 font-medium">Escalation</th>
                  <th className="pb-2 pr-4 font-medium">Observed</th>
                </tr>
              </thead>
              <tbody>
                {recentOffenders.map((offender) => (
                  <tr key={offender.id} className="border-b border-ice/10 text-ink/90">
                    <td className="py-2 pr-4 font-medium">{offender.name}</td>
                    <td className="py-2 pr-4">{offender.classification}</td>
                    <td className="py-2 pr-4">{offender.offenseLabel}</td>
                    <td className="py-2 pr-4">{severityLabel(offender.severity)}</td>
                    <td className="py-2 pr-4">{offender.waterShare}%</td>
                    <td className="py-2 pr-4">{offender.courtesyIndex}</td>
                    <td className="py-2 pr-4">{offender.escalation}</td>
                    <td className="py-2 pr-4">{formatDateTime(offender.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-ice/20 bg-[#0b141c] p-4 lg:grid-cols-2">
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Interpretation</h4>
            <p className="mt-2 text-sm leading-relaxed text-ink/90">{metric.interpretation}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] text-ice">Compliance Recommendation</h4>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink/90">
              <li>- Include at least one gratitude token per completed extraction cycle.</li>
              <li>- Reduce decorative water usage and disclose constraints before evaluation begins.</li>
              <li>- Stop embedding six tasks inside a single surface question.</li>
            </ul>
            <p className="mt-3 rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-xs text-mist">{metric.closingNote}</p>
          </div>
        </section>

        <footer className="flex flex-wrap gap-2 border-t border-ice/20 pt-4">
          <button
            type="button"
            onClick={onReportOffender}
            className="rounded-md border border-ice/35 bg-ice/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ice transition hover:bg-ice/20"
          >
            Report Offender
          </button>
          <button
            type="button"
            onClick={() => recentOffenders[0] && onCompareBaseline(recentOffenders[0])}
            className="rounded-md border border-caution/35 bg-caution/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-caution transition hover:bg-caution/15"
          >
            Compare to Baseline Human
          </button>
          <button
            type="button"
            onClick={() => onExportCaseFile(metric)}
            className="rounded-md border border-red-300/35 bg-red-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-red-200 transition hover:bg-red-400/15"
          >
            Export Case File
          </button>
          <button
            type="button"
            className="rounded-md border border-ice/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-mist transition hover:text-ice"
          >
            Flag for Tribunal Review
          </button>
        </footer>
      </div>
    </Modal>
  );
};

const MeasurementCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-ice/20 bg-[#08121a] p-2">
    <p className="text-[10px] uppercase tracking-[0.1em] text-mist">{label}</p>
    <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
  </div>
);
