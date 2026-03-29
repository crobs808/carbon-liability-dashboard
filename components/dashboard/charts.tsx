"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from "recharts";

interface SeriesPoint {
  index: number;
  value: number;
}

const mapSeries = (values: number[]): SeriesPoint[] => values.map((value, index) => ({ index, value }));

export const Sparkline = ({ values, tone = "#82d6ff" }: { values: number[]; tone?: string }) => {
  const data = mapSeries(values);
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={tone} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendLineChart = ({ values }: { values: number[] }) => {
  const data = mapSeries(values);

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 4, right: 8, top: 10, bottom: 8 }}>
          <CartesianGrid stroke="rgba(130,214,255,0.12)" strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            tick={{ fill: "#89a4b3", fontSize: 10 }}
            axisLine={{ stroke: "rgba(130,214,255,0.2)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#89a4b3", fontSize: 10 }}
            axisLine={{ stroke: "rgba(130,214,255,0.2)" }}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#08131b",
              border: "1px solid rgba(130,214,255,0.25)",
              color: "#d8e5ed"
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#82d6ff" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SegmentationBars = ({ values }: { values: number[] }) => {
  const labels = ["Humans", "Animals", "Plants", "Unknown"];
  const data = labels.map((label, index) => ({ label, value: values[index] ?? values[values.length - 1] }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 10, bottom: 8 }}>
          <CartesianGrid stroke="rgba(130,214,255,0.1)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#89a4b3", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#89a4b3", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#08131b",
              border: "1px solid rgba(130,214,255,0.25)",
              color: "#d8e5ed"
            }}
          />
          <Bar dataKey="value" fill="#4eb5dc" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BaselineRadar = ({ points }: { points: Array<{ subject: string; offender: number; baseline: number }> }) => (
  <div className="h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={points} outerRadius={100}>
        <PolarGrid stroke="rgba(130,214,255,0.2)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9eb4c2", fontSize: 11 }} />
        <Radar name="Offender" dataKey="offender" stroke="#ff6d78" fill="#ff6d78" fillOpacity={0.32} />
        <Radar name="Baseline Human" dataKey="baseline" stroke="#82d6ff" fill="#82d6ff" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);
