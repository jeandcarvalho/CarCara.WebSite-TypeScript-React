import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

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

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "bg-zinc-900/70 rounded-2xl p-3 md:p-4 shadow-sm border border-zinc-800 min-w-0 h-full " +
        className
      }
    >
      <h3 className="text-zinc-200 font-medium mb-3">{title}</h3>
      {children}
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
const Search: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(true);

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
  const [maxSMin, setMaxSMin] = useState<number | "">("");
  const [maxSMax, setMaxSMax] = useState<number | "">("");
  const [oneway, setOneway] = useState<(typeof ONEWAY[number])[]>([]);
  const [surface, setSurface] = useState<(typeof SURFACE_GROUPS[number])[]>([]);
  const [sidewalk, setSidewalk] = useState<(typeof SIDEWALK[number])[]>([]);
  const [cycleway, setCycleway] = useState<(typeof CYCLEWAY[number])[]>([]);

  // SemSeg (chips)
  const [bldChip, setBldChip] = useState<"" | "low" | "mid" | "high">("");
  const [vegChip, setVegChip] = useState<"" | "low" | "mid" | "high">("");

  // YOLO
  const [yClasses, setYClasses] = useState<string[]>([]);
  const [relEgo, setRelEgo] = useState<string[]>([]);
  const [confChip, setConfChip] = useState<"" | "low" | "mid" | "high">("");
  const [distMin, setDistMin] = useState<number | "">("");
  const [distMax, setDistMax] = useState<number | "">("");

  // SemSeg chips → ranges
  const semsegRanges = useMemo(() => {
    const ranges: Record<string, string | undefined> = {};
    if (bldChip) {
      const t = SEMSEG_THRESH.building;
      if (bldChip === "low") ranges["s.building"] = `..${t.p25}`;
      if (bldChip === "mid") ranges["s.building"] = `${t.p25}..${t.p75}`;
      if (bldChip === "high") ranges["s.building"] = `${t.p75}..`;
    }
    if (vegChip) {
      const t = SEMSEG_THRESH.vegetation;
      if (vegChip === "low") ranges["s.vegetation"] = `..${t.p25}`;
      if (vegChip === "mid") ranges["s.vegetation"] = `${t.p25}..${t.p75}`;
      if (vegChip === "high") ranges["s.vegetation"] = `${t.p75}..`;
    }
    return ranges;
  }, [bldChip, vegChip]);

  // Conf chips → range
  const confRange = useMemo(() => {
    if (confChip === "low") return "..0.33";
    if (confChip === "mid") return "0.33..0.66";
    if (confChip === "high") return "0.66..";
    return undefined;
  }, [confChip]);

  // S.W.A chips → ranges (união)
  const swaRanges = useMemo(() => {
    if (!swaChips.length) return undefined;
    return SWA_CHIPS.filter((c) => swaChips.includes(c.key))
      .map((c) => c.range)
      .join(",");
  }, [swaChips]);

  const urlParams = useMemo(() => {
    const p: Record<string, string | undefined> = {
      // blocks_5min
      ...(bVehicle ? { "b.vehicle": bVehicle } : {}),
      ...(bPeriod ? { "b.period": bPeriod } : {}),
      ...(bCondition ? { "b.condition": bCondition } : {}),

      // laneego_1hz (mesma lógica na URL; só mudou o painel visual)
      ...(laneLeft.length ? { "l.left_disp": laneLeft.join(",") } : {}),
      ...(laneRight.length ? { "l.right_disp": laneRight.join(",") } : {}),

      // can_1hz
      ...(toRangeParam(vMin, vMax) ? { "c.VehicleSpeed": toRangeParam(vMin, vMax) } : {}),
      ...(swaRanges
        ? { "c.SteeringWheelAngle": swaRanges }
        : toRangeParam(swaMin, swaMax)
        ? { "c.SteeringWheelAngle": toRangeParam(swaMin, swaMax) }
        : {}),
      ...(brakes.length ? { "c.BrakeInfoStatus": brakes.join(",") } : {}),

      // overpass_1hz
      ...(highwayGroups.length ? { "o.highway": highwayGroups.join(",") } : {}),
      ...(landuseGroups.length ? { "o.landuse": landuseGroups.join(",") } : {}),
      ...(lanes.length ? { "o.lanes": lanes.join(",") } : {}),
      ...(toRangeParam(maxSMin, maxSMax) ? { "o.maxspeed": toRangeParam(maxSMin, maxSMax) } : {}),
      ...(oneway.length ? { "o.oneway": oneway.join(",") } : {}),
      ...(surface.length ? { "o.surface": surface.join(",") } : {}),
      ...(sidewalk.length ? { "o.sidewalk": sidewalk.join(",") } : {}),
      ...(cycleway.length ? { "o.cycleway": cycleway.join(",") } : {}),

      // semseg_1hz
      ...semsegRanges,

      // yolo_1hz
      ...(yClasses.length ? { "y.class": yClasses.join(",") } : {}),
      ...(relEgo.length ? { "y.rel_to_ego": relEgo.join(",") } : {}),
      ...(confRange ? { "y.conf": confRange } : {}),
      ...(toRangeParam(distMin, distMax) ? { "y.dist_m": toRangeParam(distMin, distMax) } : {}),
    };
    return p;
  }, [
    bVehicle,
    bPeriod,
    bCondition,
    laneLeft,
    laneRight,
    vMin,
    vMax,
    swaMin,
    swaMax,
    brakes,
    swaRanges,
    highwayGroups,
    landuseGroups,
    lanes,
    maxSMin,
    maxSMax,
    oneway,
    surface,
    sidewalk,
    cycleway,
    semsegRanges,
    yClasses,
    relEgo,
    confRange,
    distMin,
    distMax,
  ]);

  const url = useMemo(() => buildURL(`${API_BASE}${SEARCH_PATH}`, urlParams), [urlParams]);

  useEffect(() => {
    const q = url.split("?")[1] ?? "";
    const next = q ? `${window.location.pathname}?${q}` : window.location.pathname;
    window.history.replaceState({}, "", next);
  }, [url]);

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copiada!");
    } catch {
      alert("Não foi possível copiar. Selecione e copie manualmente.");
    }
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-medium text-orange-100">
              <span className="font-medium text-yellow-300">CarCará</span> · Search (front-only)
            </h1>
            <button
              className="md:hidden bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1 rounded-full"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? "Fechar filtros" : "Filtros"}
            </button>
          </div>

          {/* URL */}
          <div className="mt-3 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 md:p-4">
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
                  Copiar
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-3 py-2 rounded-md text-sm font-semibold"
                >
                  Abrir
                </a>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Sem chamadas de rede — somente geração de URL.
            </p>
          </div>

          {/* GRID 3×N — Overpass ocupa 2 colunas */}
          <div className={cls("mt-4", filtersOpen ? "block" : "hidden md:block")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
              {/* Painel 1: Contexto + LaneEgo */}
              <Section title="Vehicle & Scene">
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

                  {/* LaneEgo (visual junto) */}
                  <div className="border-t border-zinc-800 pt-2 grid gap-3">
                    <div>
                      <div className="text-sm text-zinc-400 mb-1">Left lane availability</div>
                      <div className="flex flex-wrap gap-2">
                        {LANE_EGO_LEFT.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              setLaneLeft((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
                            className={cls(
                              "px-3 py-1 rounded-full text-sm border transition",
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
                            onClick={() =>
                              setLaneRight((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
                            className={cls(
                              "px-3 py-1 rounded-full text-sm border transition",
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

              {/* Painel 2: Dinâmica do veículo (CAN) */}
              <Section title="Vehicle Dynamics">
                <div className="grid gap-3">
                 <div className="grid gap-2">
  <span className="text-sm text-zinc-300">VehicleSpeed (km/h)</span>
  <RangePair compact min={vMin} max={vMax} onChange={(mn, mx) => { setVMin(mn); setVMax(mx); }} />
</div>


                  <div className="grid gap-2">
                    <div className="text-sm text-zinc-400">SteeringWheelAngle</div>
                    <div className="flex flex-wrap gap-2">
                      {SWA_CHIPS.map((ch) => (
                        <button
                          key={ch.key}
                          type="button"
                          onClick={() =>
                            setSwaChips((curr) =>
                              curr.includes(ch.key)
                                ? curr.filter((x) => x !== ch.key)
                                : [...curr, ch.key]
                            )
                          }
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
                    <div className="text-sm text-zinc-400 mb-1">BrakeInfoStatus</div>
                    <div className="flex flex-wrap gap-2">
                      {BRAKE_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() =>
                            setBrakes((curr) =>
                              curr.includes(k) ? curr.filter((x) => x !== k) : [...curr, k]
                            )
                          }
                          className={cls(
                            "px-3 py-1 rounded-full text-sm border transition",
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

               {/* Painel 6: Perception (YOLO) */}
              <Section title="Perception (YOLO)">
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Classes</div>
                    <div className="flex flex-wrap gap-2">
                      {YOLO_CLASSES_COMMON.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setYClasses((curr) =>
                              curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]
                            )
                          }
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
                          onClick={() =>
                            setRelEgo((curr) =>
                              curr.includes(opt.value)
                                ? curr.filter((x) => x !== opt.value)
                                : [...curr, opt.value]
                            )
                          }
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
                          onClick={() => setConfChip((prev) => (prev === k ? "" : k))}
                          className={cls(
                            "px-3 py-1 rounded-full text-sm border transition",
                            confChip === k
                              ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                              : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
                          )}
                        >
                          {k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                        </button>
                      ))}
                    </div>
                  </div>

<                 div className="grid gap-2">
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

              {/* Painel 3-4: Overpass ocupa 2 colunas */}
              <Section title="Road Context" className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-4">
                    <div>
                      <div className="text-sm text-zinc-400 mb-1">Highway (groups)</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(GROUPS.highway).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setHighwayGroups((curr) =>
                                curr.includes(g) ? curr.filter((x) => x !== g) : [...curr, g]
                              )
                            }
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
                            onClick={() =>
                              setLanduseGroups((curr) =>
                                curr.includes(g) ? curr.filter((x) => x !== g) : [...curr, g]
                              )
                            }
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
                            onClick={() =>
                              setLanes((curr) =>
                                curr.includes(g) ? curr.filter((x) => x !== g) : [...curr, g]
                              )
                            }
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
                  </div>

                  <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-2 md:items-center">
  <div className="space-y-2">
  <span className="text-sm text-zinc-300">Maxspeed</span>
  <div className="w-full">
    <RangePair
      compact
      min={maxSMin}
      max={maxSMax}
      onChange={(mn, mx) => {
        setMaxSMin(mn);
        setMaxSMax(mx);
      }}
    />
  </div>
</div>

</div>


                    <div>
                      <div className="text-sm text-zinc-400 mb-1">Oneway</div>
                      <div className="flex flex-wrap gap-2">
                        {ONEWAY.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              setOneway((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
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
                            onClick={() =>
                              setSurface((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
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
                            onClick={() =>
                              setSidewalk((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
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
                            onClick={() =>
                              setCycleway((curr) =>
                                curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]
                              )
                            }
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
                </div>
              </Section>

              {/* Painel 5: Ambiente (SemSeg) */}
              <Section title="Environment (SemSeg)">
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Building</div>
                    <div className="flex flex-wrap gap-2">
                      {(["low", "mid", "high"] as const).map((k) => (
                        <button
                          key={`bld-${k}`}
                          type="button"
                          onClick={() => setBldChip((prev) => (prev === k ? "" : k))}
                          className={cls(
                            "px-3 py-1 rounded-full text-sm border transition",
                            bldChip === k
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
                          onClick={() => setVegChip((prev) => (prev === k ? "" : k))}
                          className={cls(
                            "px-3 py-1 rounded-full text-sm border transition",
                            vegChip === k
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

             

              {/* AÇÕES (linha inteira) */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between py-2">
                  <div className="text-zinc-500 text-xs">Gere a URL e use onde quiser.</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
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
                        setMaxSMin("");
                        setMaxSMax("");
                        setOneway([]);
                        setSurface([]);
                        setSidewalk([]);
                        setCycleway([]);
                        setBldChip("");
                        setVegChip("");
                        setYClasses([]);
                        setRelEgo([]);
                        setConfChip("");
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
                      Open URL
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /grid */}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
