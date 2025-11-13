import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * CarCará · Search (vertical accordion + collapsed summaries + animations)
 * HashRouter-ready + URL hydration:
 *  - Query string lives inside the hash (e.g., https://site/#/search?y.class=car)
 *  - navigate({ search }) keeps URL in the hash so it can be shared/copied.
 *  - On first mount, parse location.search and hydrate the UI state from the URL.
 */

// ===================== CONFIG (somente URL) =====================
const API_BASE = "";
const SEARCH_PATH = "/api/search";

// grupos
const GROUPS = {
  highway: {
    primary: ["motorway", "trunk", "primary"],
    primary_link: ["motorway_link", "trunk_link", "primary_link"],
    secondary: ["secondary", "tertiary"],
    secondary_link: ["secondary_link", "tertiary_link"],
    local: [
      "residential",
      "living_street",
      "unclassified",
      "service",
      "services",
      "platform",
      "pedestrian",
      "footway",
      "steps",
      "path",
      "cycleway",
      "busway",
      "track",
    ],
  },
  landuse: {
    residential: ["residential", "village_green"],
    commercial: ["commercial", "retail"],
    industrial: ["industrial", "garages", "storage", "landfill"],
    agro: ["farmland", "farmyard", "orchard", "meadow"],
    green: [
      "forest",
      "grass",
      "scrub",
      "recreation",
      "recreation_ground",
      "cemetery",
      "flowerbed",
      "greenfield",
    ],
  },
} as const;

const BRAKE_KEYS = ["not_pressed", "pressed"] as const;
const ONEWAY = ["yes", "no"] as const;
const SURFACE_GROUPS = ["paved", "unpaved"] as const;
const SIDEWALK = ["both", "left", "right", "no", "unpaved"] as const;
const CYCLEWAY = ["shared_lane", "no"] as const;
const LANES_DIRECT = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

const VEHICLES = ["Captur", "DAF CF 410", "Renegade"] as const;
const PERIODS = ["day", "night", "dusk", "dawn"] as const;

const CONDITIONS = [
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

const YOLO_CLASSES_COMMON = ["car", "truck", "bus", "motorcycle", "bicycle", "person"] as const;

// Rel to Ego (UI explicado; URL mantém brutos)
const REL_TO_EGO = [
  { label: "Ego lane", value: "EGO" },
  { label: "Left adjacent (L-1)", value: "L-1" },
  { label: "Right adjacent (R+1)", value: "R+1" },
  { label: "Outside left (OUT-L)", value: "OUT-L" },
  { label: "Outside right (OUT-R)", value: "OUT-R" },
] as const;

// LaneEgo
const LANE_EGO_LEFT = ["DISP", "INDISP"] as const;
const LANE_EGO_RIGHT = ["DISP", "INDISP"] as const;

// SemSeg thresholds (0..100)
const SEMSEG_THRESH = {
  building: { p25: 0.0, median: 0.68, p75: 8.72 },
  vegetation: { p25: 23.99, median: 40.14, p75: 59.41 },
} as const;

// Steering chips (deg)
const SWA_CHIPS = [
  { key: "straight", label: "Straight", range: "-5..5" },
  { key: "l-gentle", label: "Left · Gentle", range: "-180..-30" },
  { key: "l-mod", label: "Left · Moderate", range: "-360..-180" },
  { key: "l-hard", label: "Left · Hard", range: "-999..-360" },
  { key: "r-gentle", label: "Right · Gentle", range: "30..180" },
  { key: "r-mod", label: "Right · Moderate", range: "180..360" },
  { key: "r-hard", label: "Right · Hard", range: "360..999" },
] as const;

// BR speed-limit defaults (km/h) — typical signage options.
const BR_MAXSPEEDS = [10,20,30,40,50,60,70,80,90,100,110,120] as const;

// ===================== UTILS / UI helpers =====================
const cls = (...xs: (Array<string | false | null | undefined>)) =>
  xs.filter(Boolean).join(" ");

function toRangeParam(min?: number | "", max?: number | "") {
  if (min === "" && max === "") return undefined;
  if (min === "" && max !== "") return `..${max}`;
  if (min !== "" && max === "") return `${min}..`;
  if (min !== "" && max !== "") return `${min}..${max}`;
  return undefined;
}
function buildURL(base: string, params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && usp.set(k, v));
  const q = usp.toString();
  return q ? `${base}?${q}` : base;
}

function SummaryChips({ items }: { items: string[] }) {
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

function parseNumber(v?: string | null): number | "" {
  if (!v && v !== "0") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function splitList(v?: string | null): string[] {
  if (!v) return [];
  return v.split(",").map(s => s.trim()).filter(Boolean);
}

function parseRangeToken(tok: string): [number | "", number | ""] {
  // "a..b" where a or b may be empty
  const [a, b] = tok.split("..");
  const min = a === "" || a === undefined ? "" : parseNumber(a);
  const max = b === "" || b === undefined ? "" : parseNumber(b);
  return [min, max];
}

function approxEq(a: number, b: number, eps = 1e-2) {
  return Math.abs(a - b) <= eps;
}

// Animated collapsible section
function Section({
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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (collapsed) {
      requestAnimationFrame(() => setHeight(0));
    } else {
      const h = contentRef.current.scrollHeight;
      requestAnimationFrame(() => setHeight(h));
    }
  }, [collapsed, children]);

  useEffect(() => {
    if (!collapsed && contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
    }
  });

  return (
    <section
      className={cls(
        `${bg} rounded-2xl p-0 shadow-sm border border-zinc-800 min-w-0 transition-colors duration-300`,
        className
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <h3 className="text-zinc-100 font-medium">{title}</h3>
        <span className="text-zinc-400 text-sm">{collapsed ? "Expand" : "Collapse"}</span>
      </button>
      {collapsed ? <SummaryChips items={summaryItems} /> : null}
      <div
        style={{ maxHeight: height, overflow: "hidden" }}
        className="transition-[max-height] duration-300 ease-in-out"
      >
        <div
          ref={contentRef}
          className={cls(
            "px-4 pb-4",
            collapsed ? "opacity-0 translate-y-[-4px]" : "opacity-100 translate-y-0",
            "transition-all duration-300 ease-in-out"
          )}
          aria-hidden={collapsed}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

type RangePairProps = {
  min?: number | "";
  max?: number | "";
  step?: number;
  placeholder?: [string, string];
  onChange: (min: number | "", max: number | "") => void;
  compact?: boolean;
};

function RangePair({
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
        className={`${w} bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100`}
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
        className={`${w} bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100`}
        placeholder={placeholder[1]}
        value={max === undefined ? "" : max}
        onChange={(e) =>
          onChange(min ?? "", e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </div>
  );
}

// ===================== PAGE =====================
const SearchVerticalAnimated: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed states (all start CLOSED except URL)
  const [colURL, setColURL] = useState(false);
  const [colVehicle, setColVehicle] = useState(true);
  const [colCAN, setColCAN] = useState(true);
  const [colYOLO, setColYOLO] = useState(true);
  const [colRoad, setColRoad] = useState(true);
  const [colSemSeg, setColSemSeg] = useState(true);

  // Geral (blocks + laneego visual)
  const [bVehicle, setBVehicle] = useState<string>("");
  const [bPeriod, setBPeriod] = useState<string>("");
  const [bCondition, setBCondition] = useState<string>("");
  const [laneLeft, setLaneLeft] = useState<(typeof LANE_EGO_LEFT[number])[]>([]);
  const [laneRight, setLaneRight] = useState<(typeof LANE_EGO_RIGHT[number])[]>([]);

  // CAN
  const [vMin, setVMin] = useState<number | "">("");
  const [vMax, setVMax] = useState<number | "">("");
  const [swaMin, setSwaMin] = useState<number | "">("");
  const [swaMax, setSwaMax] = useState<number | "">("");
  const [brakes, setBrakes] = useState<("not_pressed" | "pressed")[]>([]);
  const [swaChips, setSwaChips] = useState<string[]>([]);
  const [showSwaAdvanced, setShowSwaAdvanced] = useState(false);

  // Overpass
  const [highwayGroups, setHighwayGroups] = useState<string[]>([]);
  const [landuseGroups, setLanduseGroups] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  const [maxSpeedPreset, setMaxSpeedPreset] = useState<number[]>([]); // presets only
  const [oneway, setOneway] = useState<(typeof ONEWAY[number])[]>([]);
  const [surface, setSurface] = useState<(typeof SURFACE_GROUPS[number])[]>([]);
  const [sidewalk, setSidewalk] = useState<(typeof SIDEWALK[number])[]>([]);
  const [cycleway, setCycleway] = useState<(typeof CYCLEWAY[number])[]>([]);

  // SemSeg (chips) — MULTI-SELECT
  const [bldChips, setBldChips] = useState<Array<"low"|"mid"|"high">>([]);
  const [vegChips, setVegChips] = useState<Array<"low"|"mid"|"high">>([]);

  // YOLO — MULTI-SELECT confidence chips
  const [yClasses, setYClasses] = useState<string[]>([]);
  const [relEgo, setRelEgo] = useState<string[]>([]);
  const [confChips, setConfChips] = useState<Array<"low"|"mid"|"high">>([]);
  const [distMin, setDistMin] = useState<number | "">("");
  const [distMax, setDistMax] = useState<number | "">("");

  // ---- Hydration from URL (run once on first mount) ----
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const usp = new URLSearchParams(location.search || "");
    // blocks_5min
    const bv = usp.get("b.vehicle"); if (bv) setBVehicle(bv);
    const bp = usp.get("b.period"); if (bp) setBPeriod(bp);
    const bc = usp.get("b.condition"); if (bc) setBCondition(bc);
    const lleft = splitList(usp.get("l.left_disp")).filter(v => (["DISP","INDISP"] as const).includes(v as any));
    if (lleft.length) setLaneLeft(lleft as any);
    const lright = splitList(usp.get("l.right_disp")).filter(v => (["DISP","INDISP"] as const).includes(v as any));
    if (lright.length) setLaneRight(lright as any);
    // CAN
    const vRange = usp.get("c.VehicleSpeed");
    if (vRange) {
      const [mn, mx] = parseRangeToken(vRange);
      if (mn !== "") setVMin(mn);
      if (mx !== "") setVMax(mx);
    }
    const swaR = usp.get("c.SteeringWheelAngle");
    if (swaR) {
      const parts = swaR.split(",");
      // map to chips if matches known ranges
      const chipKeys: string[] = [];
      parts.forEach(p => {
        const match = SWA_CHIPS.find(ch => ch.range === p);
        if (match) chipKeys.push(match.key);
      });
      if (chipKeys.length === parts.length && chipKeys.length > 0) {
        setSwaChips(chipKeys);
      } else if (parts.length === 1) {
        const [mn, mx] = parseRangeToken(parts[0]);
        if (mn !== "" || mx !== "") {
          setShowSwaAdvanced(true);
          if (mn !== "") setSwaMin(mn);
          if (mx !== "") setSwaMax(mx);
        }
      }
    }
    const br = splitList(usp.get("c.BrakeInfoStatus")).filter(v => (BRAKE_KEYS as readonly string[]).includes(v));
    if (br.length) setBrakes(br as any);
    // Overpass
    const hg = splitList(usp.get("o.highway"));
    if (hg.length) setHighwayGroups(hg);
    const lu = splitList(usp.get("o.landuse"));
    if (lu.length) setLanduseGroups(lu);
    const ln = splitList(usp.get("o.lanes"));
    if (ln.length) setLanes(ln);
    const ms = splitList(usp.get("o.maxspeed")).map(s => Number(s)).filter(n => Number.isFinite(n));
    if (ms.length) setMaxSpeedPreset(ms);
    const ow = splitList(usp.get("o.oneway")).filter(v => (ONEWAY as readonly string[]).includes(v));
    if (ow.length) setOneway(ow as any);
    const sf = splitList(usp.get("o.surface")).filter(v => (SURFACE_GROUPS as readonly string[]).includes(v));
    if (sf.length) setSurface(sf as any);
    const sw = splitList(usp.get("o.sidewalk")).filter(v => (SIDEWALK as readonly string[]).includes(v));
    if (sw.length) setSidewalk(sw as any);
    const cy = splitList(usp.get("o.cycleway")).filter(v => (CYCLEWAY as readonly string[]).includes(v));
    if (cy.length) setCycleway(cy as any);
    // semseg
    const sBld = usp.get("s.building");
    if (sBld) {
      const parts = sBld.split(",");
      const chips: Array<"low"|"mid"|"high"> = [];
      parts.forEach(tok => {
        const [mn, mx] = parseRangeToken(tok);
        if (mx !== "" && mn === "" && (mx as number) <= SEMSEG_THRESH.building.p25 + 1e-2) chips.push("low");
        if (mn !== "" && mx !== "" && approxEq(mn as number, SEMSEG_THRESH.building.p25) && approxEq(mx as number, SEMSEG_THRESH.building.p75)) chips.push("mid");
        if (mn !== "" && (mn as number) >= SEMSEG_THRESH.building.p75 - 1e-2 && mx === "") chips.push("high");
      });
      if (chips.length) setBldChips(Array.from(new Set(chips)));
    }
    const sVeg = usp.get("s.vegetation");
    if (sVeg) {
      const parts = sVeg.split(",");
      const chips: Array<"low"|"mid"|"high"> = [];
      parts.forEach(tok => {
        const [mn, mx] = parseRangeToken(tok);
        if (mx !== "" && mn === "" && (mx as number) <= SEMSEG_THRESH.vegetation.p25 + 1e-2) chips.push("low");
        if (mn !== "" && mx !== "" && approxEq(mn as number, SEMSEG_THRESH.vegetation.p25) && approxEq(mx as number, SEMSEG_THRESH.vegetation.p75)) chips.push("mid");
        if (mn !== "" && (mn as number) >= SEMSEG_THRESH.vegetation.p75 - 1e-2 && mx === "") chips.push("high");
      });
      if (chips.length) setVegChips(Array.from(new Set(chips)));
    }
    // yolo
    const yc = splitList(usp.get("y.class"));
    if (yc.length) setYClasses(yc);
    const re = splitList(usp.get("y.rel_to_ego"));
    if (re.length) setRelEgo(re);
    const yconf = usp.get("y.conf");
    if (yconf) {
      const parts = yconf.split(",");
      const chips: Array<"low"|"mid"|"high"> = [];
      parts.forEach(tok => {
        const [mn2, mx2] = parseRangeToken(tok);
        const lo = (mn2 === "" && mx2 !== "" && (mx2 as number) <= 0.34);
        const mi = (mn2 !== "" && mx2 !== "" && approxEq(mn2 as number, 0.33) && approxEq(mx2 as number, 0.66));
        const hi = (mn2 !== "" && mx2 === "" && (mn2 as number) >= 0.66 - 1e-2);
        if (lo) chips.push("low");
        if (mi) chips.push("mid");
        if (hi) chips.push("high");
      });
      if (chips.length) setConfChips(Array.from(new Set(chips)));
    }
    const ydist = usp.get("y.dist_m");
    if (ydist) {
      const parts = ydist.split(",");
      if (parts.length === 1) {
        const [mn, mx] = parseRangeToken(parts[0]);
        if (mn !== "") setDistMin(mn);
        if (mx !== "") setDistMax(mx);
      }
    }
  }, [location.search]);

  // Helpers

  // SemSeg chips → ranges (UNION via comma-join)
  const semsegRanges = useMemo(() => {
    const ranges: Record<string, string | undefined> = {};
    if (bldChips.length) {
      const t = SEMSEG_THRESH.building;
      const parts:string[] = [];
      if (bldChips.includes("low")) parts.push(`..${t.p25}`);
      if (bldChips.includes("mid")) parts.push(`${t.p25}..${t.p75}`);
      if (bldChips.includes("high")) parts.push(`${t.p75}..`);
      ranges["s.building"] = parts.join(",");
    }
    if (vegChips.length) {
      const t = SEMSEG_THRESH.vegetation;
      const parts:string[] = [];
      if (vegChips.includes("low")) parts.push(`..${t.p25}`);
      if (vegChips.includes("mid")) parts.push(`${t.p25}..${t.p75}`);
      if (vegChips.includes("high")) parts.push(`${t.p75}..`);
      ranges["s.vegetation"] = parts.join(",");
    }
    return ranges;
  }, [bldChips, vegChips]);

  // Confidence chips → union of ranges
  const confRange = useMemo(() => {
    if (!confChips.length) return undefined;
    const map: Record<"low"|"mid"|"high", string> = {
      low: "..0.33",
      mid: "0.33..0.66",
      high: "0.66..",
    };
    return confChips.map((k) => map[k]).join(",");
  }, [confChips]);

  // S.W.A chips → ranges (union)
  const swaRanges = useMemo(() => {
    if (!swaChips.length) return undefined;
    return SWA_CHIPS.filter((c) => swaChips.includes(c.key))
      .map((c) => c.range)
      .join(",");
  }, [swaChips]);

  const urlParams = useMemo(() => {
    const p: Record<string, string | undefined> = {
      ...(bVehicle ? { "b.vehicle": bVehicle } : {}),
      ...(bPeriod ? { "b.period": bPeriod } : {}),
      ...(bCondition ? { "b.condition": bCondition } : {}),
      ...(laneLeft.length ? { "l.left_disp": laneLeft.join(",") } : {}),
      ...(laneRight.length ? { "l.right_disp": laneRight.join(",") } : {}),
      ...(toRangeParam(vMin, vMax) ? { "c.VehicleSpeed": toRangeParam(vMin, vMax) } : {}),
      ...(swaRanges
        ? { "c.SteeringWheelAngle": swaRanges }
        : toRangeParam(swaMin, swaMax)
        ? { "c.SteeringWheelAngle": toRangeParam(swaMin, swaMax) }
        : {}),
      ...(brakes.length ? { "c.BrakeInfoStatus": brakes.join(",") } : {}),
      ...(highwayGroups.length ? { "o.highway": highwayGroups.join(",") } : {}),
      ...(landuseGroups.length ? { "o.landuse": landuseGroups.join(",") } : {}),
      ...(lanes.length ? { "o.lanes": lanes.join(",") } : {}),
      ...(maxSpeedPreset.length ? { "o.maxspeed": maxSpeedPreset.join(",") } : {}),
      ...(oneway.length ? { "o.oneway": oneway.join(",") } : {}),
      ...(surface.length ? { "o.surface": surface.join(",") } : {}),
      ...(sidewalk.length ? { "o.sidewalk": sidewalk.join(",") } : {}),
      ...(cycleway.length ? { "o.cycleway": cycleway.join(",") } : {}),
      ...semsegRanges,
      ...(yClasses.length ? { "y.class": yClasses.join(",") } : {}),
      ...(relEgo.length ? { "y.rel_to_ego": relEgo.join(",") } : {}),
      ...(confRange ? { "y.conf": confRange } : {}),
      ...(toRangeParam(distMin, distMax) ? { "y.dist_m": toRangeParam(distMin, distMax) } : {}),
    };
    return p;
  }, [
    bVehicle,bPeriod,bCondition,laneLeft,laneRight,
    vMin,vMax,swaMin,swaMax,brakes,swaRanges,
    highwayGroups,landuseGroups,lanes,maxSpeedPreset,oneway,surface,sidewalk,cycleway,
    semsegRanges,yClasses,relEgo,confRange,distMin,distMax
  ]);

  const url = useMemo(() => buildURL(`${API_BASE}${SEARCH_PATH}`, urlParams), [urlParams]);

  // === Mantém a query na URL do HashRouter ===
  useEffect(() => {
    const q = url.split("?")[1] ?? "";
    navigate({ pathname: "/search", search: q ? `?${q}` : "" }, { replace: true });
  }, [url, navigate]);

  const shareURL = useMemo(() => {
    const q = url.split("?")[1] ?? "";
    return `${window.location.origin}${window.location.pathname}#/search${q ? `?${q}` : ""}`;
  }, [url]);

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      alert("URL copiada!");
    } catch {
      alert("Não foi possível copiar. Selecione e copie manualmente.");
    }
  };

  // ===== Collapsed Summaries =====
  const vehicleSummary = useMemo(() => {
    const tags:string[] = [];
    if (bVehicle) tags.push(`vehicle:${bVehicle}`);
    if (bPeriod) tags.push(`period:${bPeriod}`);
    if (bCondition) tags.push(`condition:${bCondition}`);
    laneLeft.forEach(v => tags.push(`left:${v}`));
    laneRight.forEach(v => tags.push(`right:${v}`));
    return tags;
  }, [bVehicle,bPeriod,bCondition,laneLeft,laneRight]);

  const canSummary = useMemo(() => {
    const tags:string[] = [];
    const r = toRangeParam(vMin, vMax);
    if (r) tags.push(`speed:${r}`);
    if (swaChips.length) tags.push(...swaChips.map(k=>`swa:${k}`));
    else {
      const rs = toRangeParam(swaMin, swaMax);
      if (rs) tags.push(`swa:${rs}`);
    }
    brakes.forEach(b=>tags.push(`brake:${b}`));
    return tags;
  }, [vMin,vMax,swaChips,swaMin,swaMax,brakes]);

  const yoloSummary = useMemo(() => {
    const tags:string[] = [];
    yClasses.forEach(c=>tags.push(`class:${c}`));
    relEgo.forEach(e=>tags.push(`ego:${e}`));
    if (confChips.length) tags.push(...confChips.map(c=>`conf:${c}`));
    const dr = toRangeParam(distMin, distMax);
    if (dr) tags.push(`dist:${dr}`);
    return tags;
  }, [yClasses,relEgo,confChips,distMin,distMax]);

  const roadSummary = useMemo(() => {
    const tags:string[] = [];
    highwayGroups.forEach(g=>tags.push(`highway:${g}`));
    landuseGroups.forEach(g=>tags.push(`landuse:${g}`));
    lanes.forEach(l=>tags.push(`lanes:${l}`));
    maxSpeedPreset.forEach(s=>tags.push(`max:${s}`));
    oneway.forEach(o=>tags.push(`oneway:${o}`));
    surface.forEach(s=>tags.push(`surface:${s}`));
    sidewalk.forEach(s=>tags.push(`sidewalk:${s}`));
    cycleway.forEach(c=>tags.push(`cycleway:${c}`));
    return tags;
  }, [highwayGroups,landuseGroups,lanes,maxSpeedPreset,oneway,surface,sidewalk,cycleway]);

  const semsegSummary = useMemo(() => {
    const tags:string[] = [];
    bldChips.forEach(b=>tags.push(`bld:${b}`));
    vegChips.forEach(v=>tags.push(`veg:${v}`));
    return tags;
  }, [bldChips,vegChips]);

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <div className="my-3 ml-3">
        <Link to="/">
          <button className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto">
            ← Home
          </button>
        </Link>
      </div>

      <div className="px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* URL */}
          <Section title="Generated URL" collapsed={colURL} onToggle={() => setColURL(v=>!v)}>
            <div className="mt-1 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <input
                  readOnly
                  value={url}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-xs md:text-sm text-zinc-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={copyURL}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm"
                  >
                    Copiar link desta página
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-3 py-2 rounded-md text-sm font-semibold"
                  >
                    Abrir na API
                  </a>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                A URL acima é a da <strong>API</strong>. O link compartilhável da página fica no seu navegador (hash).
              </p>
              <div className="mt-2 text-xs text-zinc-400">
                URL desta página:&nbsp;
                <code className="break-all">{shareURL}</code>
              </div>
            </div>
          </Section>

          {/* Vehicle & Scene */}
          <Section
            title="Vehicle & Scene"
            collapsed={colVehicle}
            onToggle={()=>setColVehicle(v=>!v)}
            summaryItems={vehicleSummary}
          >
            <div className="grid gap-3">
              <select
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100"
                value={bVehicle}
                onChange={(e) => setBVehicle(e.target.value)}
              >
                <option value="">Vehicle</option>
                {VEHICLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100"
                value={bPeriod}
                onChange={(e) => setBPeriod(e.target.value)}
              >
                <option value="">Period</option>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100"
                value={bCondition}
                onChange={(e) => setBCondition(e.target.value)}
              >
                <option value="">Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* LaneEgo */}
              <div className="border-t border-zinc-800 pt-2 grid gap-3">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Left lane availability</div>
                  <div className="flex flex-wrap gap-2">
                    {LANE_EGO_LEFT.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setLaneLeft((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-4 py-2 rounded-full text-sm border transition",
                          laneLeft.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v === "DISP" ? "Left available" : "Left unavailable"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Right lane availability</div>
                  <div className="flex flex-wrap gap-2">
                    {LANE_EGO_RIGHT.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setLaneRight((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-4 py-2 rounded-full text-sm border transition",
                          laneRight.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v === "DISP" ? "Right available" : "Right unavailable"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Vehicle Dynamics */}
          <Section
            title="Vehicle Dynamics"
            collapsed={colCAN}
            onToggle={()=>setColCAN(v=>!v)}
            summaryItems={canSummary}
          >
            <div className="grid gap-3">
              <div className="grid gap-2">
                <span className="text-sm text-zinc-300">VehicleSpeed (km/h)</span>
                <RangePair
                  compact
                  min={vMin}
                  max={vMax}
                  onChange={(mn, mx) => {
                    setVMin(mn);
                    setVMax(mx);
                  }}
                />
              </div>

              <div className="grid gap-2">
                <div className="text-sm text-zinc-400">SteeringWheelAngle</div>
                <div className="flex flex-wrap gap-2">
                  {SWA_CHIPS.map((ch) => (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setSwaChips((curr) => curr.includes(ch.key) ? curr.filter(x=>x!==ch.key) : [...curr, ch.key])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        swaChips.includes(ch.key)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-xs text-zinc-400 underline w-fit"
                  onClick={() => setShowSwaAdvanced((v) => !v)}
                >
                  {showSwaAdvanced ? "Hide advanced range" : "Advanced range"}
                </button>
                {showSwaAdvanced && (
                  <div className="grid gap-2">
                    <span className="text-sm text-zinc-300">Angle (°)</span>
                    <RangePair
                      compact
                      min={swaMin}
                      max={swaMax}
                      onChange={(mn, mx) => {
                        setSwaMin(mn);
                        setSwaMax(mx);
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-2">BrakeInfoStatus</div>
                <div className="flex flex-wrap gap-2">
                  {BRAKE_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setBrakes((curr) => curr.includes(k) ? curr.filter(x=>x!==k) : [...curr, k])}
                      className={cls(
                        "px-4 py-2 rounded-full text-sm border transition",
                        brakes.includes(k)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Perception */}
          <Section
            title="Perception"
            collapsed={colYOLO}
            onToggle={()=>setColYOLO(v=>!v)}
            summaryItems={yoloSummary}
          >
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Classes</div>
                <div className="flex flex-wrap gap-2">
                  {YOLO_CLASSES_COMMON.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setYClasses((curr) => curr.includes(c) ? curr.filter(x=>x!==c) : [...curr, c])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        yClasses.includes(c)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-1">Position vs Ego</div>
                <div className="flex flex-wrap gap-2">
                  {REL_TO_EGO.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRelEgo((curr) => curr.includes(opt.value) ? curr.filter(x=>x!==opt.value) : [...curr, opt.value])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        relEgo.includes(opt.value)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-1">Confidence</div>
                <div className="flex flex-wrap gap-2">
                  {(["low", "mid", "high"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setConfChips((curr) => curr.includes(k) ? curr.filter(x=>x!==k) : [...curr, k])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        confChips.includes(k)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm text-zinc-300">Distance (m)</span>
                <RangePair
                  compact
                  min={distMin}
                  max={distMax}
                  step={0.5}
                  onChange={(mn, mx) => {
                    setDistMin(mn);
                    setDistMax(mx);
                  }}
                />
              </div>
            </div>
          </Section>

          {/* Road Context */}
          <Section
            title="Road Context"
            collapsed={colRoad}
            onToggle={()=>setColRoad(v=>!v)}
            summaryItems={roadSummary}
          >
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Highway (groups)</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(GROUPS.highway).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setHighwayGroups((curr) => curr.includes(g) ? curr.filter(x=>x!==g) : [...curr, g])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        highwayGroups.includes(g)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-1">Landuse (groups)</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(GROUPS.landuse).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setLanduseGroups((curr) => curr.includes(g) ? curr.filter(x=>x!==g) : [...curr, g])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        landuseGroups.includes(g)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-1">Lanes (1..8)</div>
                <div className="flex flex-wrap gap-2">
                  {LANES_DIRECT.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setLanes((curr) => curr.includes(g) ? curr.filter(x=>x!==g) : [...curr, g])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        lanes.includes(g)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <span className="text-sm text-zinc-300">Maxspeed (BR presets)</span>
                  <div className="flex flex-wrap gap-2">
                    {BR_MAXSPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMaxSpeedPreset((curr) => curr.includes(s) ? curr.filter(x=>x!==s) : [...curr, s])}
                        className={cls(
                          "px-3 py-1 rounded-full text-sm border transition",
                          maxSpeedPreset.includes(s)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Oneway</div>
                  <div className="flex flex-wrap gap-2">
                    {ONEWAY.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setOneway((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-3 py-1 rounded-full text-sm border transition",
                          oneway.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Surface</div>
                  <div className="flex flex-wrap gap-2">
                    {SURFACE_GROUPS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSurface((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-3 py-1 rounded-full text-sm border transition",
                          surface.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Sidewalk</div>
                  <div className="flex flex-wrap gap-2">
                    {SIDEWALK.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSidewalk((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-3 py-1 rounded-full text-sm border transition",
                          sidewalk.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Cycleway</div>
                  <div className="flex flex-wrap gap-2">
                    {CYCLEWAY.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCycleway((curr) => curr.includes(v) ? curr.filter(x=>x!==v) : [...curr, v])}
                        className={cls(
                          "px-3 py-1 rounded-full text-sm border transition",
                          cycleway.includes(v)
                            ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                            : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-1 text-xs text-zinc-400">
                Note: not all acquisitions achieved 100% success in extracting road metadata. Prefer these filters when prioritizing quality over quantity.
              </p>
            </div>
          </Section>

          {/* Environment */}
          <Section
            title="Environment"
            collapsed={colSemSeg}
            onToggle={()=>setColSemSeg(v=>!v)}
            summaryItems={semsegSummary}
          >
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Building</div>
                <div className="flex flex-wrap gap-2">
                  {(["low", "mid", "high"] as const).map((k) => (
                    <button
                      key={`bld-${k}`}
                      type="button"
                      onClick={() => setBldChips((curr) => curr.includes(k) ? curr.filter(x=>x!==k) : [...curr, k])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        bldChips.includes(k)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">Vegetation</div>
                <div className="flex flex-wrap gap-2">
                  {(["low", "mid", "high"] as const).map((k) => (
                    <button
                      key={`veg-${k}`}
                      type="button"
                      onClick={() => setVegChips((curr) => curr.includes(k) ? curr.filter(x=>x!==k) : [...curr, k])}
                      className={cls(
                        "px-3 py-1 rounded-full text-sm border transition",
                        vegChips.includes(k)
                          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      {k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-between py-2">
            <div className="text-zinc-500 text-xs">Gere a URL da busca e compartilhe o link desta página.</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setColVehicle(true);
                  setColCAN(true);
                  setColYOLO(true);
                  setColRoad(true);
                  setColSemSeg(true);
                  setBVehicle("");
                  setBPeriod("");
                  setBCondition("");
                  setLaneLeft([]);
                  setLaneRight([]);
                  setVMin("");
                  setVMax("");
                  setSwaMin("");
                  setSwaMax("");
                  setBrakes([]);
                  setSwaChips([]);
                  setShowSwaAdvanced(false);
                  setHighwayGroups([]);
                  setLanduseGroups([]);
                  setLanes([]);
                  setMaxSpeedPreset([]);
                  setOneway([]);
                  setSurface([]);
                  setSidewalk([]);
                  setCycleway([]);
                  setBldChips([]);
                  setVegChips([]);
                  setYClasses([]);
                  setRelEgo([]);
                  setConfChips([]);
                  setDistMin("");
                  setDistMax("");
                }}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm"
              >
                Clear
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-4 py-2 rounded-md text-sm font-semibold"
              >
                Open API
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchVerticalAnimated;
