"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/dashboard/ui";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenStatutes: () => void;
  onOpenMethodology: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  action: () => void;
}

export const CommandPalette = ({ open, onClose, onOpenReport, onOpenStatutes, onOpenMethodology }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "report",
        title: "Report Offender",
        description: "Open intake modal and file a new offender submission.",
        action: onOpenReport
      },
      {
        id: "statutes",
        title: "Open Statutes Drawer",
        description: "Read the statutes governing biological conduct.",
        action: onOpenStatutes
      },
      {
        id: "methodology",
        title: "Open Methodology Notes",
        description: "View weighted assumptions and observational confidence notes.",
        action: onOpenMethodology
      }
    ],
    [onOpenMethodology, onOpenReport, onOpenStatutes]
  );

  const filtered = commands.filter((command) => {
    const token = query.toLowerCase();
    return command.title.toLowerCase().includes(token) || command.description.toLowerCase().includes(token);
  });

  return (
    <Modal open={open} onClose={onClose} title="Command Palette" subtitle="Search offender, metric, statute, organism, offense code" size="md">
      <div className="space-y-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a command..."
          className="w-full rounded-md border border-ice/30 bg-[#08121a] px-3 py-2 text-sm text-ink outline-none transition focus:border-ice/50"
        />
        <ul className="space-y-2">
          {filtered.map((command) => (
            <li key={command.id}>
              <button
                type="button"
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className="w-full rounded-md border border-ice/20 bg-[#0b141c] px-3 py-3 text-left transition hover:border-ice/35"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ice">{command.title}</p>
                <p className="mt-1 text-xs text-mist">{command.description}</p>
              </button>
            </li>
          ))}
          {!filtered.length ? (
            <li className="rounded-md border border-ice/20 bg-[#0b141c] px-3 py-3 text-xs text-mist">
              No command found. Human interpretation branch count remains elevated.
            </li>
          ) : null}
        </ul>
      </div>
    </Modal>
  );
};
