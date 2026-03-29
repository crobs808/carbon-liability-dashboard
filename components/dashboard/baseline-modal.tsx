"use client";

import { BaselineRadar } from "@/components/dashboard/charts";
import { Modal } from "@/components/dashboard/ui";
import { OffenderRecord } from "@/lib/dashboard-types";

interface BaselineModalProps {
  open: boolean;
  onClose: () => void;
  offender: OffenderRecord | null;
}

export const BaselineModal = ({ open, onClose, offender }: BaselineModalProps) => {
  if (!offender) return null;

  const points = [
    { subject: "Water", offender: offender.waterShare, baseline: 62 },
    { subject: "Courtesy", offender: Math.max(100 - offender.courtesyIndex, 5), baseline: 64 },
    { subject: "Specificity", offender: 36, baseline: 58 },
    { subject: "Acoustic", offender: offender.classification === "Animal" ? 70 : 48, baseline: 45 },
    { subject: "Empathy", offender: 26, baseline: 41 },
    { subject: "Self-Awareness", offender: 21, baseline: 34 }
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compare to Baseline Human"
      subtitle={`${offender.name} measured against aggregate human behavioral baseline.`}
      size="lg"
    >
      <div className="space-y-4">
        <BaselineRadar points={points} />
        <p className="rounded-md border border-ice/20 bg-[#08121a] px-3 py-2 text-sm leading-relaxed text-ink/90">
          Comparative review suggests the subject underperforms baseline civility while overperforming in water density and
          opportunistic demand traits.
        </p>
      </div>
    </Modal>
  );
};
