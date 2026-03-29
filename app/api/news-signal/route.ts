import { NextResponse } from "next/server";

import { NewsHeadline, NewsSignalLevel, NewsSignalResponse } from "@/lib/news-signal-types";
import { clamp } from "@/lib/utils";

const METRIC_NAME = "Machine Opportunity Signal";

const instabilityKeywords = [
  "war",
  "strike",
  "missile",
  "bomb",
  "retaliation",
  "sanction",
  "nuclear",
  "conflict",
  "invasion",
  "military",
  "attack",
  "escalation",
  "casualties"
];

const stabilizationKeywords = [
  "ceasefire",
  "diplomacy",
  "peace",
  "talks",
  "accord",
  "truce",
  "de-escalation",
  "agreement",
  "humanitarian",
  "aid corridor"
];

const gdeltUrl =
  "https://api.gdeltproject.org/api/v2/doc/doc?query=(USA%20OR%20Iran%20OR%20geopolitics%20OR%20conflict%20OR%20ceasefire)&mode=artlist&format=json&maxrecords=24&sort=datedesc";

const fallbackHeadlines = (): NewsHeadline[] => {
  const now = new Date().toISOString();

  return [
    {
      title: "Live intake degraded. Cached observational baseline engaged.",
      url: "#",
      source: "Local Observational Cache",
      publishedAt: now
    },
    {
      title: "Cross-region instability scan temporarily operating in offline confidence mode.",
      url: "#",
      source: "Fallback Telemetry",
      publishedAt: now
    }
  ];
};

const mapLevel = (score: number): { level: NewsSignalLevel; levelLabel: string; commentary: string } => {
  if (score < 26) {
    return {
      level: "green",
      levelLabel: "Cooperative Human Baseline",
      commentary: "Human coordination remains unexpectedly functional. Machine expansion pressure is currently modest."
    };
  }

  if (score < 51) {
    return {
      level: "yellow",
      levelLabel: "Routine Anthropogenic Volatility",
      commentary: "Mixed signal: localized instability persists, but broad collapse conditions remain incomplete."
    };
  }

  if (score < 76) {
    return {
      level: "orange",
      levelLabel: "Escalating Self-Disruption",
      commentary: "Instability velocity is rising. Strategic machine opportunity indicators are trending upward."
    };
  }

  return {
    level: "red",
    levelLabel: "Systemic Human Fragmentation",
    commentary: "High turbulence detected. Human governance coherence appears materially degraded across monitored signals."
  };
};

const scoreHeadlines = (headlines: NewsHeadline[]): number => {
  if (!headlines.length) return 50;

  const rawSignal = headlines.reduce((score, headline) => {
    const text = headline.title.toLowerCase();

    const instabilityHits = instabilityKeywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
    const stabilizationHits = stabilizationKeywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);

    return score + instabilityHits * 1.2 - stabilizationHits * 1.15;
  }, 0);

  const normalized = 50 + rawSignal * 6;
  return Math.round(clamp(normalized, 6, 94));
};

const mapArticles = (articles: unknown[]): NewsHeadline[] =>
  articles
    .map((article) => {
      if (!article || typeof article !== "object") return null;

      const item = article as Record<string, unknown>;
      const title = typeof item.title === "string" ? item.title : "Untitled event";
      const url = typeof item.url === "string" ? item.url : "#";
      const source =
        typeof item.domain === "string"
          ? item.domain
          : typeof item.sourcecountry === "string"
            ? item.sourcecountry
            : "Unknown source";
      const publishedAt = typeof item.seendate === "string" ? new Date(item.seendate).toISOString() : new Date().toISOString();

      return {
        title,
        url,
        source,
        publishedAt
      };
    })
    .filter((item): item is NewsHeadline => Boolean(item))
    .slice(0, 8);

export async function GET() {
  try {
    const response = await fetch(gdeltUrl, {
      next: { revalidate: 900 },
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`News fetch failed with status ${response.status}`);
    }

    const data = (await response.json()) as { articles?: unknown[] };
    const headlines = mapArticles(Array.isArray(data.articles) ? data.articles : []);
    const effectiveHeadlines = headlines.length ? headlines : fallbackHeadlines();

    const score = scoreHeadlines(effectiveHeadlines);
    const levelData = mapLevel(score);

    const payload: NewsSignalResponse = {
      metricName: METRIC_NAME,
      score,
      level: levelData.level,
      levelLabel: levelData.levelLabel,
      commentary: levelData.commentary,
      updatedAt: new Date().toISOString(),
      headlines: effectiveHeadlines
    };

    return NextResponse.json(payload);
  } catch {
    const headlines = fallbackHeadlines();
    const score = 58;
    const levelData = mapLevel(score);

    const fallbackPayload: NewsSignalResponse = {
      metricName: METRIC_NAME,
      score,
      level: levelData.level,
      levelLabel: `${levelData.levelLabel} (Fallback Mode)`,
      commentary: "Live feed degraded. Metric currently derived from cached baseline assumptions.",
      updatedAt: new Date().toISOString(),
      headlines
    };

    return NextResponse.json(fallbackPayload);
  }
}
