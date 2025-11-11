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
      "residential","living_street","unclassified","service","services","platform",
      "pedestrian","footway","steps","path","cycleway","busway","track",
    ],
  },
  landuse: {
    residential: ["residential","village_green"],
    commercial: ["commercial","retail"],
    industrial: ["industrial","garages","storage","landfill"],
    agro: ["farmland","farmyard","orchard","meadow"],
    green: ["forest","grass","scrub","recreation","recreation_ground","cemetery","flowerbed","greenfield"],
  },
} as const;

const BRAKE_KEYS = ["not_pressed", "pressed"] as const;
const ONEWAY = ["yes", "no"] as const;
const SURFACE_GROUPS = ["paved", "unpaved"] as const;
const SIDEWALK = ["both", "left", "right", "no", "unpaved"] as const;
const CYCLEWAY = ["shared_lane", "no"] as const;
const LANES_DIRECT = ["1","2","3","4","5","6","7","8"] as const;

const VEHICLES = ["Captur", "DAF CF 410", "Renegade"];
const PERIODS = ["day", "night", "dusk", "dawn"];

// Conditions: rótulo sem número; valor bruto na URL
const CONDITIONS = [
  { label: "Clear sky",       value: "Clear sky" },
  { label: "Mainly clear",    value: "Mainly clear" },
  { label: "Partly cloudy",   value: "Partly cloudy" },
  { label: "Overcast",        value: "Overcast" },
  { label: "Fog",             value: "Fog" },
  { label: "Fog (rime)",      value: "Fog (rime)" },
  { label: "Drizzle: light",  value: "Drizzle: light" },
  { label: "Drizzle: moderate", value: "Drizzle: moderate" },
  { label: "Drizzle: dense",  value: "Drizzle: dense" },
  { label: "Rain: slight",    value: "Rain: slight" },
  { label: "Rain: moderate",  value: "Rain: moderate" },
  { label: "Rain: heavy",     value: "Rain: heavy" },
];

const YOLO_CLASSES_COMMON = ["car","truck","bus","motorcycle","bicycle","person"];

// Rel to Ego: rótulos explicados; URL mantém os valores brutos
const REL_TO_EGO = [
  { label: "Ego lane", value: "EGO" },
  { label: "Left adjacent (L-1)", value: "L-1" },
  { label: "Right adjacent (R+1)", value: "R+1" },
  { label: "Outside left (OUT-L)", value: "OUT-L" },
  { label: "Outside right (OUT-R)", value: "OUT-R" },
] as const;

// LaneEgo (valores brutos na URL)
const LANE_EGO_LEFT = ["DISP","INDISP"] as const;
const LANE_EGO_RIGHT = ["DISP","INDISP"] as const;

// ===================== SemSeg thresholds (snapshot) =====================
// Interpretação em % (0..100). Chips mapeiam p/ intervalos na URL.
const SEMSEG_THRESH = {
  building:  { p25: 0.00, median: 0.68, p75: 8.72 },
  vegetation:{ p25: 23.99, median: 40.14, p75: 59.41 },
} as const;

// ===================== UTILS =====================
const cls = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

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

// UI
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-zinc-900/70 rounded-2xl p-3 md:p-5 shadow-sm border border-zinc-800 min-w-0">
      <h3 className="text-zinc-200 font-medium mb-3">{title}</h3>
      {children}
    </section>
  );
}
function CheckboxChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void; }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cls(
        "px-3 py-1 rounded-full text-sm border transition",
        checked
          ? "bg-yellow-500 text-zinc-900 border-yellow-400"
          : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600"
      )}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}

// === UI helper: RangePair (inputs min..max) ===
type RangePairProps = {
  min?: number | "";
  max?: number | "";
  step?: number;
  placeholder?: [string, string];
  onChange: (min: number | "", max: number | "") => void;
};

function RangePair({
  min = "",
  max = "",
  step = 1,
  placeholder = ["min", "max"],
  onChange,
}: RangePairProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <input
        type="number"
        step={step}
        className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100"
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
        className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-100"
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
  // collapse (mobile)
  const [filtersOpen, setFiltersOpen] = useState(true);

  // blocks_5min
  const [bVehicle, setBVehicle] = useState<string>("");
  const [bPeriod, setBPeriod]   = useState<string>("");
  const [bCondition, setBCondition] = useState<string>("");

  // can_1hz
  const [vMin, setVMin] = useState<number | "">("");
  const [vMax, setVMax] = useState<number | "">("");
  const [swaMin, setSwaMin] = useState<number | "">("");
  const [swaMax, setSwaMax] = useState<number | "">("");
  const [brakes, setBrakes] = useState<("not_pressed" | "pressed")[]>([]);

  // overpass_1hz
  const [highwayGroups, setHighwayGroups] = useState<string[]>([]);
  const [landuseGroups, setLanduseGroups] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  const [maxSMin, setMaxSMin] = useState<number | "">("");
  const [maxSMax, setMaxSMax] = useState<number | "">("");
  const [oneway, setOneway] = useState<(typeof ONEWAY[number])[]>([]);
  const [surface, setSurface] = useState<(typeof SURFACE_GROUPS[number])[]>([]);
  const [sidewalk, setSidewalk] = useState<(typeof SIDEWALK[number])[]>([]);
  const [cycleway, setCycleway] = useState<(typeof CYCLEWAY[number])[]>([]);

  // laneego_1hz
  const [laneLeft, setLaneLeft] = useState<(typeof LANE_EGO_LEFT[number])[]>([]);
  const [laneRight, setLaneRight] = useState<(typeof LANE_EGO_RIGHT[number])[]>([]);

  // semseg_1hz (chips only: building/vegetation)
  const [bldChip, setBldChip] = useState<"" | "low" | "mid" | "high">("");
  const [vegChip, setVegChip] = useState<"" | "low" | "mid" | "high">("");

  // yolo_1hz
  const [yClasses, setYClasses] = useState<string[]>([]);
  const [relEgo, setRelEgo] = useState<string[]>([]);
  const [confChip, setConfChip] = useState<"" | "low" | "mid" | "high">("");

  // chips (SemSeg) → intervalos (0..100)
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

  // chips (Confidence) → intervalos (0..1)
  const confRange = useMemo(() => {
    if (confChip === "low") return "..0.33";
    if (confChip === "mid") return "0.33..0.66";
    if (confChip === "high") return "0.66..";
    return undefined;
  }, [confChip]);

  const urlParams = useMemo(() => {
    const p: Record<string, string | undefined> = {
      // blocks_5min
      ...(bVehicle ? { "b.vehicle": bVehicle } : {}),
      ...(bPeriod ? { "b.period": bPeriod } : {}),
      ...(bCondition ? { "b.condition": bCondition } : {}),

      // can_1hz
      ...(toRangeParam(vMin, vMax) ? { "c.VehicleSpeed": toRangeParam(vMin, vMax) } : {}),
      ...(toRangeParam(swaMin, swaMax) ? { "c.SteeringWheelAngle": toRangeParam(swaMin, swaMax) } : {}),
      ...(brakes.length ? { "c.BrakeInfoStatus": brakes.join(",") } : {}),

      // overpass_1hz
      ...(highwayGroups.length ? { "o.highway": highwayGroups.join(",") } : {}),
      ...(landuseGroups.length ? { "o.landuse": landuseGroups.join(",") } : {}),
      ...(lanes.length ? { "o.lanes": lanes.join(",") } : {}), // 1..8
      ...(toRangeParam(maxSMin, maxSMax) ? { "o.maxspeed": toRangeParam(maxSMin, maxSMax) } : {}),
      ...(oneway.length ? { "o.oneway": oneway.join(",") } : {}),
      ...(surface.length ? { "o.surface": surface.join(",") } : {}),
      ...(sidewalk.length ? { "o.sidewalk": sidewalk.join(",") } : {}),
      ...(cycleway.length ? { "o.cycleway": cycleway.join(",") } : {}),

      // laneego_1hz
      ...(laneLeft.length  ? { "l.left_disp": laneLeft.join(",") } : {}),
      ...(laneRight.length ? { "l.right_disp": laneRight.join(",") } : {}),

      // semseg_1hz (chips → ranges)
      ...semsegRanges,

      // yolo_1hz
      ...(yClasses.length ? { "y.class": yClasses.join(",") } : {}),
      ...(relEgo.length ? { "y.rel_to_ego": relEgo.join(",") } : {}),
      ...(confRange ? { "y.conf": confRange } : {}),
    };
    return p;
  }, [
    bVehicle, bPeriod, bCondition,
    vMin, vMax, swaMin, swaMax, brakes,
    highwayGroups, landuseGroups, lanes, maxSMin, maxSMax, oneway, surface, sidewalk, cycleway,
    laneLeft, laneRight,
    semsegRanges,
    yClasses, relEgo, confRange
  ]);

  const url = useMemo(() => buildURL(`${API_BASE}${SEARCH_PATH}`, urlParams), [urlParams]);

  useEffect(() => {
    const q = url.split("?")[1] ?? "";
    const next = q ? `${window.location.pathname}?${q}` : window.location.pathname;
    window.history.replaceState({}, "", next);
  }, [url]);

  const copyURL = async () => {
    try { await navigator.clipboard.writeText(url); alert("URL copiada!"); }
    catch { alert("Não foi possível copiar. Selecione e copie manualmente."); }
  };

  // ====== RENDER ======
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-medium text-orange-100">
              <span className="font-medium text-yellow-300">CarCará</span> · Search (front-only)
            </h1>
            <button
              className="md:hidden bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1 rounded-full"
              onClick={() => setFiltersOpen(v => !v)}
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
                <button onClick={copyURL} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm">
                  Copiar
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-3 py-2 rounded-md text-sm font-semibold">
                  Abrir
                </a>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2">Sem chamadas de rede — somente geração de URL.</p>
          </div>

          {/* FILTROS empilhados */}
          <div className={cls("mt-4 space-y-4", filtersOpen ? "block" : "hidden md:block")}>
            {/* BLOCKS */}
            <Section title="Blocks (5 min)">
              <div className="grid gap-3 md:grid-cols-3">
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100" value={bVehicle} onChange={(e) => setBVehicle(e.target.value)}>
                  <option value="">Vehicle</option>{VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100" value={bPeriod} onChange={(e) => setBPeriod(e.target.value)}>
                  <option value="">Period</option>{PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-zinc-100" value={bCondition} onChange={(e) => setBCondition(e.target.value)}>
                  <option value="">Condition</option>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </Section>

            {/* CAN */}
            <Section title="CAN (1 Hz)">
              <div className="grid gap-3">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="text-sm text-zinc-300">VehicleSpeed (km/h)</span>
                  <RangePair min={vMin} max={vMax} onChange={(mn, mx) => { setVMin(mn); setVMax(mx); }} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="text-sm text-zinc-300">SteeringWheelAngle (°)</span>
                  <RangePair min={swaMin} max={swaMax} onChange={(mn, mx) => { setSwaMin(mn); setSwaMax(mx); }} />
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">BrakeInfoStatus</div>
                  <div className="flex flex-wrap gap-2">
                    {BRAKE_KEYS.map(k => (
                      <CheckboxChip
                        key={k}
                        label={k}
                        checked={brakes.includes(k)}
                        onChange={(next) => setBrakes(curr => next ? [...curr, k] : curr.filter(x => x !== k))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* OVERPASS */}
            <Section title="Overpass (1 Hz)">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Highway (groups)</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(GROUPS.highway).map(g => (
                      <CheckboxChip
                        key={g}
                        label={g}
                        checked={highwayGroups.includes(g)}
                        onChange={(next) => setHighwayGroups(curr => next ? [...curr, g] : curr.filter(x => x !== g))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Landuse (groups)</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(GROUPS.landuse).map(g => (
                      <CheckboxChip
                        key={g}
                        label={g}
                        checked={landuseGroups.includes(g)}
                        onChange={(next) => setLanduseGroups(curr => next ? [...curr, g] : curr.filter(x => x !== g))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Lanes (1..8)</div>
                  <div className="flex flex-wrap gap-2">
                    {LANES_DIRECT.map(g => (
                      <CheckboxChip
                        key={g}
                        label={g}
                        checked={lanes.includes(g)}
                        onChange={(next) => setLanes(curr => next ? [...curr, g] : curr.filter(x => x !== g))}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="text-sm text-zinc-300">Maxspeed</span>
                  <RangePair min={maxSMin} max={maxSMax} onChange={(mn, mx) => { setMaxSMin(mn); setMaxSMax(mx); }} />
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Oneway</div>
                  <div className="flex flex-wrap gap-2">
                    {ONEWAY.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v}
                        checked={oneway.includes(v)}
                        onChange={(next) => setOneway(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Surface</div>
                  <div className="flex flex-wrap gap-2">
                    {SURFACE_GROUPS.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v}
                        checked={surface.includes(v)}
                        onChange={(next) => setSurface(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Sidewalk</div>
                  <div className="flex flex-wrap gap-2">
                    {SIDEWALK.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v}
                        checked={sidewalk.includes(v)}
                        onChange={(next) => setSidewalk(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Cycleway</div>
                  <div className="flex flex-wrap gap-2">
                    {CYCLEWAY.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v}
                        checked={cycleway.includes(v)}
                        onChange={(next) => setCycleway(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* LANE EGO */}
            <Section title="LaneEgo (1 Hz)">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Left availability</div>
                  <div className="flex flex-wrap gap-2">
                    {LANE_EGO_LEFT.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v === "DISP" ? "Left available" : "Left unavailable"}
                        checked={laneLeft.includes(v)}
                        onChange={(next) => setLaneLeft(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Right availability</div>
                  <div className="flex flex-wrap gap-2">
                    {LANE_EGO_RIGHT.map(v => (
                      <CheckboxChip
                        key={v}
                        label={v === "DISP" ? "Right available" : "Right unavailable"}
                        checked={laneRight.includes(v)}
                        onChange={(next) => setLaneRight(curr => next ? [...curr, v] : curr.filter(x => x !== v))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* SEMSEG (chips only) */}
            <Section title="SemSeg (1 Hz)">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Building</div>
                  <div className="flex flex-wrap gap-2">
                    {(["low","mid","high"] as const).map(k => (
                      <CheckboxChip
                        key={`bld-${k}`}
                        label={k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                        checked={bldChip === k}
                        onChange={(next) => setBldChip(next ? k : "")}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Vegetation</div>
                  <div className="flex flex-wrap gap-2">
                    {(["low","mid","high"] as const).map(k => (
                      <CheckboxChip
                        key={`veg-${k}`}
                        label={k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                        checked={vegChip === k}
                        onChange={(next) => setVegChip(next ? k : "")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* YOLO */}
            <Section title="YOLO (1 Hz)">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Classes</div>
                  <div className="flex flex-wrap gap-2">
                    {YOLO_CLASSES_COMMON.map(c => (
                      <CheckboxChip
                        key={c}
                        label={c}
                        checked={yClasses.includes(c)}
                        onChange={(next) => setYClasses(curr => next ? [...curr, c] : curr.filter(x => x !== c))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Rel. to Ego</div>
                  <div className="flex flex-wrap gap-2">
                    {REL_TO_EGO.map(opt => (
                      <CheckboxChip
                        key={opt.value}
                        label={opt.label}
                        checked={relEgo.includes(opt.value)}
                        onChange={(next) => setRelEgo(curr => next ? [...curr, opt.value] : curr.filter(x => x !== opt.value))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-400 mb-1">Confidence</div>
                  <div className="flex flex-wrap gap-2">
                    {(["low","mid","high"] as const).map(k => (
                      <CheckboxChip
                        key={k}
                        label={k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
                        checked={confChip === k}
                        onChange={(next) => setConfChip(next ? k : "")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* ações */}
            <div className="flex items-center justify-between py-2">
              <div className="text-zinc-500 text-xs">Gere a URL e use onde quiser.</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBVehicle(""); setBPeriod(""); setBCondition("");
                    setVMin(""); setVMax(""); setSwaMin(""); setSwaMax(""); setBrakes([]);
                    setHighwayGroups([]); setLanduseGroups([]); setLanes([]); setMaxSMin(""); setMaxSMax(""); setOneway([]); setSurface([]); setSidewalk([]); setCycleway([]);
                    setLaneLeft([]); setLaneRight([]);
                    setBldChip(""); setVegChip("");
                    setYClasses([]); setRelEgo([]); setConfChip("");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm"
                >
                  Clear
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-4 py-2 rounded-md text-sm font-semibold">
                  Open URL
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
