export type NewsSignalLevel = "green" | "yellow" | "orange" | "red";

export interface NewsHeadline {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface NewsSignalResponse {
  metricName: string;
  score: number;
  level: NewsSignalLevel;
  levelLabel: string;
  commentary: string;
  updatedAt: string;
  headlines: NewsHeadline[];
}
