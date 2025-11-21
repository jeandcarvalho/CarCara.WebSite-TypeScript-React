// src/Components/searchShared.tsx
// Shared config, helpers and small UI components for the Search page.

import React from "react";

/* ===================== CONFIG (URL only) ===================== */
export const API_BASE = "";
export const SEARCH_PATH = "/api/search";

// groups
export const GROUPS = {
  highway: {
    primary: ["motorway", "trunk", "primary"],
    primary_link: ["motorway_link", "trunk_link", "primary_link"],
    secondary: ["secondary", "tertiary"],
    secondary_link: ["secondary_link", "tertiary_link"],
    local: [
      "residential",
      "living_street",
      "service",
      "services",
      "pedestrian",
      "footway",
      "steps",
    ],
  },
  landuse: {
    residential: ["residential", "village_green"],
    commercial: ["commercial", "retail"],
    industrial: ["industrial", "garages", "storage", "landfill"],
    agro: ["farmland", "farmyard", "orchard", "meadow"],
  },
} as const;

export const BRAKE_KEYS = ["not_pressed", "pressed"] as const;

// map UI brake chips to DB values
export const BRAKE_DB_MAP: Record<(typeof BRAKE_KEYS)[number], string> = {
  not_pressed: "b'Brake pedal not pressed'",
  pressed: "b'Brake pedal confirmed pressed'",
};

export const ONEWAY = ["yes"] as const;
export const SURFACE_GROUPS = ["paved", "unpaved"] as const;
export const SIDEWALK = ["both", "left", "right", "no"] as const;
export const CYCLEWAY = ["shared_lane", "no"] as const;
export const LANES_DIRECT = ["1", "2", "3", "4", "5", "6"] as const;

export const VEHICLES = ["Captur", "DAF CF 410", "Renegade"] as const;
export const PERIODS = ["day", "night", "dusk", "dawn"] as const;

export const CONDITIONS = [
  { label: "Clear sky", value: "Clear sky" },
  { label: "Mainly clear", value: "Mainly clear" },
  { label: "Partly cloudy", value: "Partly cloudy" },
  { label: "Overcast", value: "Overcast" },
  { label: "Fog", value: "Fog" },
  { label: "Fog (rime)", value: "Fog (rime)" },
  { label: "Drizzle: light", value: "Drizzle: light" },
  { label: "Drizzle: moderate", value: "Drizzle: moderate" },
  { label: "Drizzle: dense", value: "Drizzle: dense" },
  { label: "Rain: slight", value: "Rain: slight" },
  { label: "Rain: moderate", value: "Rain: moderate" },
  { label: "Rain: heavy", value: "Rain: heavy" },
] as const;

// Common YOLO classes shown as chips (without truck/bus; they are folded into "Heavy vehicles")
export const YOLO_CLASSES_COMMON = ["car", "motorcycle", "bicycle", "person"] as const;

// Rel to Ego (UI explained; URL keeps raw values)
export const REL_TO_EGO = [
  { label: "Ego lane", value: "EGO" },
  { label: "Left adjacent (L-1)", value: "L-1" },
  { label: "Right adjacent (R+1)", value: "R+1" },
  { label: "Outside left (OUT-L)", value: "OUT-L" },
  { label: "Outside right (OUT-R)", value: "OUT-R" },
] as const;

// LaneEgo
export const LANE_EGO_LEFT = ["DISP", "INDISP"] as const;
export const LANE_EGO_RIGHT = ["DISP", "INDISP"] as const;

// SemSeg thresholds (0..100)
export const SEMSEG_THRESH = {
  building: { p25: 0.0, median: 14.68, p75: 28.72 },
  vegetation: { p25: 7.99, median: 25.14, p75: 50.41 },
} as const;

// Steering chips (deg)
export const SWA_CHIPS = [
  { key: "straight", label: "Straight", range: "5..-5" },
  { key: "l-gentle", label: "Right · Gentle", range: "-180..-30" },
  { key: "l-mod", label: "Right · Moderate", range: "-360..-180" },
  { key: "l-hard", label: "Right · Hard", range: "-999..-360" },
  { key: "r-gentle", label: "Left · Gentle", range: "30..180" },
  { key: "r-mod", label: "Left · Moderate", range: "180..360" },
  { key: "r-hard", label: "Left · Hard", range: "360..999" },
] as const;

// BR speed-limit presets (km/h)
export const BR_MAXSPEEDS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] as const;

/* ===================== UTILS / helpers ===================== */

export const cls = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

export function toRangeParam(min?: number | "", max?: number | "") {
  if (min === "" && max === "") return undefined;
  if (min === "" && max !== "") return `..${max}`;
  if (min !== "" && max === "") return `${min}..`;
  if (min !== "" && max !== "") return `${min}..${max}`;
  return undefined;
}

export function buildURL(base: string, params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && usp.set(k, v));
  const q = usp.toString();
  return q ? `${base}?${q}` : base;
}

export function parseNumber(v?: string | null): number | "" {
  if (!v && v !== "0") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

export function splitList(v?: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseRangeToken(tok: string): [number | "", number | ""] {
  // "a..b" where a or b may be empty
  const [a, b] = tok.split("..");
  const min = a === "" || a === undefined ? "" : parseNumber(a);
  const max = b === "" || b === undefined ? "" : parseNumber(b);
  return [min, max];
}

export function approxEq(a: number, b: number, eps = 1e-2) {
  return Math.abs(a - b) <= eps;
}

// generic helper to toggle a string inside an array
export function toggleString<T extends string>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

/* ===================== Small UI components ===================== */

export function SummaryChips({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1 px-4 pb-3">
      {items.map((t, i) => (
        <span
          key={i}
          className="px-2 py-0.5 rounded-full text-[11px] border bg-yellow-500 text-zinc-900 border-yellow-400"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// Collapsible section (no height animation to avoid clipping on small widths)
export function Section({
  title,
  children,
  className = "",
  collapsed,
  onToggle,
  summaryItems = [],
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsed: boolean;
  onToggle: () => void;
  summaryItems?: string[];
}) {
  const bg = collapsed ? "bg-zinc-950/60" : "bg-zinc-800";

  return (
    <section
      className={cls(
        `${bg} rounded-2xl p-0 shadow-sm border border-zinc-800 min-w-0 transition-colors duration-300`,
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <h3 className="text-zinc-100 font-medium text-base md:text-lg">{title}</h3>
        <span className="text-zinc-400 text-sm">
          {collapsed ? "Expand" : "Collapse"}
        </span>
      </button>
      {collapsed ? <SummaryChips items={summaryItems} /> : null}
      {!collapsed && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

export type RangePairProps = {
  min?: number | "";
  max?: number | "";
  step?: number;
  placeholder?: [string, string];
  onChange: (min: number | "", max: number | "") => void;
  compact?: boolean;
};

export function RangePair({
  min = "",
  max = "",
  step = 1,
  placeholder = ["min", "max"],
  onChange,
  compact = false,
}: RangePairProps) {
  const w = compact ? "w-20" : "w-24";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <input
        type="number"
        step={step}
        className={`${w} bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100 text-sm`}
        placeholder={placeholder[0]}
        value={min === undefined ? "" : min}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value), max ?? "")
        }
      />
      <span className="text-zinc-400">‥</span>
      <input
        type="number"
        step={step}
        className={`${w} bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100 text-sm`}
        placeholder={placeholder[1]}
        value={max === undefined ? "" : max}
        onChange={(e) =>
          onChange(min ?? "", e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </div>
  );
}
