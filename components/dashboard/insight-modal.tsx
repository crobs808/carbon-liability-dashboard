"use client";

import { SegmentationBars, TrendLineChart } from "@/components/dashboard/charts";
import { Modal } from "@/components/dashboard/ui";

export interface InsightModalData {
  title: string;
  subtitle: string;
  summary: string[];
  methodology: string;
  recommendations: string[];
  snapshots: Array<{ label: string; value: string }>;
  trend?: number[];
  evidence?: string[];
}

interface InsightModalProps {
  open: boolean;
  onClose: () => void;
  insight: InsightModalData | null;
}

export const InsightModal = ({ open, onClose, insight }: InsightModalProps) => {
  if (!insight) return null;

  return (
    <Modal open={open} onClose={onClose} size="lg" title={insight.title} subtitle={insight.subtitle}>
      <div className="space-y-4 text-sm">
        <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Executive Summary</h3>
          <div className="mt-2 space-y-2 text-ink/90">
            {insight.summary.map((line) => (
              <p key={line} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="grid gap-2 rounded-xl border border-ice/20 bg-[#0b141c] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {insight.snapshots.map((snapshot) => (
            <div key={snapshot.label} className="rounded-md border border-ice/20 bg-[#08121a] p-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-mist">{snapshot.label}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{snapshot.value}</p>
            </div>
          ))}
        </section>

        {insight.trend ? (
          <section className="grid gap-4 rounded-xl border border-ice/20 bg-[#0b141c] p-4 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Trend View</h3>
              <TrendLineChart values={insight.trend} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Segmentation</h3>
              <SegmentationBars values={insight.trend} />
            </div>
          </section>
        ) : null}

        <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Methodology</h3>
          <p className="mt-2 leading-relaxed text-mist">{insight.methodology}</p>
        </section>

        {insight.evidence?.length ? (
          <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Supporting Evidence</h3>
            <ul className="mt-2 space-y-2 text-ink/90">
              {insight.evidence.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-xl border border-ice/20 bg-[#0b141c] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">Compliance Recommendation</h3>
          <ul className="mt-2 space-y-2 text-ink/90">
            {insight.recommendations.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
};
