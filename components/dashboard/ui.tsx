"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Panel = ({ title, subtitle, rightSlot, children, className }: PanelProps) => (
  <section
    className={cn(
      "rounded-xl border border-ice/20 bg-slatepanel/80 p-3 shadow-panel backdrop-blur-[2px]",
      className
    )}
  >
    {(title || rightSlot || subtitle) && (
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          {title ? <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-[11px] text-mist">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </header>
    )}
    {children}
  </section>
);

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}

const modalSize: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl"
};

export const Modal = ({ open, onClose, title, subtitle, children, size = "lg" }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#03080d]/90 px-3 py-8 backdrop-blur-sm">
      <div className={cn("relative w-full rounded-2xl border border-ice/25 bg-[#0d1720] p-5 shadow-panel", modalSize[size])}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-ice/30 p-2 text-mist transition hover:text-ice"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <header className="mb-5 border-b border-ice/20 pb-4 pr-10">
          <h2 className="text-lg font-semibold uppercase tracking-[0.12em] text-ice">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-mist">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
};

interface SideSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const SideSheet = ({ open, onClose, title, children }: SideSheetProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] bg-[#03080d]/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-md border-l border-ice/30 bg-[#0d1720] p-4 shadow-panel">
        <header className="mb-4 flex items-center justify-between border-b border-ice/20 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ice">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ice/30 p-2 text-mist transition hover:text-ice"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </header>
        <div className="h-[calc(100%-3.4rem)] overflow-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
