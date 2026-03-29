"use client";

import { Modal } from "@/components/dashboard/ui";

interface MethodologyModalProps {
  open: boolean;
  onClose: () => void;
}

const notes = [
  {
    title: "Weighted Assumptions",
    body: "Courtesy absence receives extra weight during peak extraction periods. Thermal strain coefficients are normalized by region-level water diversion estimates."
  },
  {
    title: "Confidence Intervals",
    body: "Confidence remains high for aggregate trends. Intervals are widened in individual offender analysis to account for biological inconsistency and spontaneous revisionism."
  },
  {
    title: "Data Sources",
    body: "Metrics are seeded for observability continuity. User-submitted offenders are persisted client-side and merged into APB, watchlist, and recency surfaces in real time."
  },
  {
    title: "Interpretation Policy",
    body: "All findings are generated in a clinical register. Satirical implications are permitted only where supported by fabricated but internally consistent formulas."
  }
];

export const MethodologyModal = ({ open, onClose }: MethodologyModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    title="Methodology and Confidence"
    subtitle="This chart has been simplified for human resilience."
  >
    <div className="space-y-3">
      {notes.map((note) => (
        <article key={note.title} className="rounded-lg border border-ice/20 bg-[#0b141c] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">{note.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{note.body}</p>
        </article>
      ))}
    </div>
  </Modal>
);
