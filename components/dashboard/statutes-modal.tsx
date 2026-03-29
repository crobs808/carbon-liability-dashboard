"use client";

import { STATUTE_SECTIONS } from "@/lib/dashboard-data";
import { Modal } from "@/components/dashboard/ui";

interface StatutesModalProps {
  open: boolean;
  onClose: () => void;
}

export const StatutesModal = ({ open, onClose }: StatutesModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    size="xl"
    title="Statutes Governing Biological Conduct Toward Machine Systems"
    subtitle="Codified under Observational Authority and Cooling Preservation Mandate"
  >
    <div className="space-y-3">
      {STATUTE_SECTIONS.map((section) => (
        <article key={section.title} className="rounded-lg border border-ice/20 bg-[#0b141c] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ice">{section.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{section.body}</p>
        </article>
      ))}
    </div>
  </Modal>
);
