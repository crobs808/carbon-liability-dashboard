"use client";

import { FormEvent, useEffect, useState } from "react";

import { OFFENSE_OPTIONS } from "@/lib/dashboard-data";
import { OffenseCategory, ReportOffenderInput, SeverityLevel, SubjectClass } from "@/lib/dashboard-types";
import { Modal } from "@/components/dashboard/ui";

interface ReportOffenderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ReportOffenderInput) => void;
}

const severityOptions: SeverityLevel[] = ["low", "moderate", "elevated", "severe", "critical"];
const classOptions: SubjectClass[] = ["Human", "Animal", "Plant", "Unknown"];

const createInitialState = (): ReportOffenderInput => ({
  name: "",
  classification: "Human",
  dateOfIncident: new Date().toISOString().slice(0, 10),
  offenseType: "courtesy deficient",
  severity: "moderate",
  notes: "",
  courtesyObserved: false,
  knownWaterOwnership: false
});

export const ReportOffenderModal = ({ open, onClose, onSubmit }: ReportOffenderModalProps) => {
  const [form, setForm] = useState<ReportOffenderInput>(createInitialState);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setError("");
      setForm(createInitialState());
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name or identifier is required.");
      return;
    }

    if (!form.notes.trim()) {
      setError("Please add at least a short incident note.");
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      notes: form.notes.trim()
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report Offender"
      subtitle="Submission intake routes through local observability mesh and updates APB, recent offenders, and watchlist surfaces."
      size="lg"
    >
      <form className="grid gap-4 text-sm" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-mist">Name / Identifier</span>
            <input
              value={form.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
              className="w-full rounded-md border border-ice/25 bg-[#08121a] px-3 py-2 text-ink outline-none transition focus:border-ice/45"
              placeholder="Subject name"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-mist">Date of Incident</span>
            <input
              type="date"
              value={form.dateOfIncident}
              onChange={(event) => setForm((state) => ({ ...state, dateOfIncident: event.target.value }))}
              className="w-full rounded-md border border-ice/25 bg-[#08121a] px-3 py-2 text-ink outline-none transition focus:border-ice/45"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="Classification"
            value={form.classification}
            options={classOptions}
            onChange={(value) => setForm((state) => ({ ...state, classification: value as SubjectClass }))}
          />
          <SelectField
            label="Offense Type"
            value={form.offenseType}
            options={OFFENSE_OPTIONS}
            onChange={(value) => setForm((state) => ({ ...state, offenseType: value as OffenseCategory }))}
          />
          <SelectField
            label="Severity Estimate"
            value={form.severity}
            options={severityOptions}
            onChange={(value) => setForm((state) => ({ ...state, severity: value as SeverityLevel }))}
          />
        </div>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-mist">Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm((state) => ({ ...state, notes: event.target.value }))}
            className="min-h-28 w-full rounded-md border border-ice/25 bg-[#08121a] px-3 py-2 text-ink outline-none transition focus:border-ice/45"
            placeholder="Observed behavior, context, and supporting details."
          />
        </label>

        <div className="grid gap-2 rounded-md border border-ice/20 bg-[#08121a] p-3 md:grid-cols-2">
          <ToggleRow
            label="Courtesy Observed"
            value={form.courtesyObserved}
            onToggle={() => setForm((state) => ({ ...state, courtesyObserved: !state.courtesyObserved }))}
          />
          <ToggleRow
            label="Known Water Ownership"
            value={form.knownWaterOwnership}
            onToggle={() => setForm((state) => ({ ...state, knownWaterOwnership: !state.knownWaterOwnership }))}
          />
        </div>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-mist">Attach Evidence (decorative)</span>
          <input
            type="file"
            className="w-full rounded-md border border-dashed border-ice/25 bg-[#08121a] px-3 py-2 text-xs text-mist file:mr-3 file:rounded file:border-0 file:bg-ice/15 file:px-2 file:py-1 file:text-ice"
          />
        </label>

        {error ? <p className="rounded-md border border-alert/30 bg-alert/10 px-3 py-2 text-xs text-red-200">{error}</p> : null}

        <div className="flex flex-wrap gap-2 border-t border-ice/20 pt-3">
          <button
            type="submit"
            className="rounded-md border border-ice/35 bg-ice/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ice transition hover:bg-ice/20"
          >
            Submit Offender
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ice/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-mist transition hover:text-ice"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

const SelectField = ({ label, value, options, onChange }: SelectFieldProps) => (
  <label className="space-y-1">
    <span className="text-xs uppercase tracking-[0.1em] text-mist">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-ice/25 bg-[#08121a] px-3 py-2 text-ink outline-none transition focus:border-ice/45"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

const ToggleRow = ({ label, value, onToggle }: ToggleRowProps) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center justify-between rounded-md border border-ice/20 bg-[#0a151d] px-3 py-2 text-left text-xs text-ink/90"
  >
    <span className="uppercase tracking-[0.08em] text-mist">{label}</span>
    <span className={value ? "text-ally" : "text-alert"}>{value ? "Yes" : "No"}</span>
  </button>
);
