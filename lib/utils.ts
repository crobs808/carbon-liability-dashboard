import { clsx } from "clsx";

import { SeverityLevel } from "@/lib/dashboard-types";

export const cn = (...inputs: Array<string | false | null | undefined>): string => clsx(inputs);

export const formatMetricValue = (value: number, unit?: string): string => {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "ratio") {
    return value.toFixed(2);
  }

  if (unit === "index") {
    return value.toFixed(1);
  }

  if (unit === "tokens" || unit === "events" || unit === "tabs" || unit === "cases") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  }

  if (unit === "dB-eq") {
    return `${value.toFixed(1)} dB`;
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
};

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(iso));

export const relativeTime = (iso: string): string => {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(deltaMs / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export const severityBadgeClass = (severity: SeverityLevel): string => {
  if (severity === "critical") return "bg-alert/20 text-alert border-alert/40";
  if (severity === "severe") return "bg-red-400/15 text-red-200 border-red-300/30";
  if (severity === "elevated") return "bg-caution/15 text-caution border-caution/30";
  if (severity === "moderate") return "bg-ice/15 text-ice border-ice/30";
  return "bg-ally/15 text-ally border-ally/30";
};

export const severityLabel = (severity: SeverityLevel): string => severity.charAt(0).toUpperCase() + severity.slice(1);

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
