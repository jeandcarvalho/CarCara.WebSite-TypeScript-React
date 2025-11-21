// src/Components/Search.tsx
/**
 * CarCará · Search (accordion + responsive layout)
 * - URL hydration via HashRouter
 * - Filters only (no explicit "Generated URL" panel)
 * - URL in the browser is kept in sync with the selected filters
 * - "View here" button sends the built query directly to /View
 * - All panels stacked vertically; internal 2-column layouts on md+
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";

import SearchVehicleScenePanel from "./SearchVehicleScenePanel";
import SearchVehicleDynamicsPanel from "./SearchVehicleDynamicsPanel";
import SearchPerceptionPanel from "./SearchPerceptionPanel";
import SearchEnvironmentPanel from "./SearchEnvironmentPanel";
import SearchRoadContextPanel from "./SearchRoadContextPanel";
import SearchLanesPanel from "./SearchLanesPanel";

import {
  API_BASE,
  BRAKE_DB_MAP,
  CYCLEWAY,
  LANE_EGO_LEFT,
  LANE_EGO_RIGHT,
  ONEWAY,
  SEMSEG_THRESH,
  SIDEWALK,
  SURFACE_GROUPS,
  buildURL,
  parseRangeToken,
  splitList,
  toRangeParam,
  approxEq,
  SWA_CHIPS,
} from "./searchShared";

type OneWayVal = (typeof ONEWAY)[number];
type SurfaceVal = (typeof SURFACE_GROUPS)[number];
type SidewalkVal = (typeof SIDEWALK)[number];
type CyclewayVal = (typeof CYCLEWAY)[number];
type LaneLeftVal = (typeof LANE_EGO_LEFT)[number];
type LaneRightVal = (typeof LANE_EGO_RIGHT)[number];
type BrakeKey = "not_pressed" | "pressed";
type ConfChip = "low" | "mid" | "high";
type SemsegChip = "low" | "mid" | "high";

const SearchVerticalAnimated: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed states (all start CLOSED)
  const [colVehicle, setColVehicle] = useState(true);
  const [colCAN, setColCAN] = useState(true);
  const [colYOLO, setColYOLO] = useState(true);
  const [colSemSeg, setColSemSeg] = useState(true);
  const [colRoad, setColRoad] = useState(true);
  const [colLanes, setColLanes] = useState(true);

  // General (blocks) — MULTI for vehicle/period/condition
  const [bVehicles, setBVehicles] = useState<string[]>([]);
  const [bPeriods, setBPeriods] = useState<string[]>([]);
  const [bConditions, setBConditions] = useState<string[]>([]);

  // LaneEgo
  const [laneLeft, setLaneLeft] = useState<LaneLeftVal[]>([]);
  const [laneRight, setLaneRight] = useState<LaneRightVal[]>([]);

  // CAN
  const [vMin, setVMin] = useState<number | "">("");
  const [vMax, setVMax] = useState<number | "">("");
  const [swaMin, setSwaMin] = useState<number | "">("");
  const [swaMax, setSwaMax] = useState<number | "">("");
  const [brakes, setBrakes] = useState<BrakeKey[]>([]);
  const [swaChips, setSwaChips] = useState<string[]>([]);
  const [showSwaAdvanced, setShowSwaAdvanced] = useState(false);

  // Overpass
  const [highwayGroups, setHighwayGroups] = useState<string[]>([]);
  const [landuseGroups, setLanduseGroups] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  const [maxSpeedPreset, setMaxSpeedPreset] = useState<number[]>([]); // presets only
  const [oneway, setOneway] = useState<OneWayVal[]>([]);
  const [surface, setSurface] = useState<SurfaceVal[]>([]);
  const [sidewalk, setSidewalk] = useState<SidewalkVal[]>([]);
  const [cycleway, setCycleway] = useState<CyclewayVal[]>([]);

  // SemSeg (chips) — MULTI-SELECT
  const [bldChips, setBldChips] = useState<SemsegChip[]>([]);
  const [vegChips, setVegChips] = useState<SemsegChip[]>([]);

  // YOLO — MULTI-SELECT confidence chips
  const [yClasses, setYClasses] = useState<string[]>([]);
  const [relEgo, setRelEgo] = useState<string[]>([]);
  const [confChips, setConfChips] = useState<ConfChip[]>([]);
  const [distMin, setDistMin] = useState<number | "">("");
  const [distMax, setDistMax] = useState<number | "">("");

  // ---- Hydration from URL (run once on first mount) ----
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const usp = new URLSearchParams(location.search || "");

    // blocks_5min MULTI
    const bvs = splitList(usp.get("b.vehicle"));
    if (bvs.length) setBVehicles(bvs);
    const bps = splitList(usp.get("b.period"));
    if (bps.length) setBPeriods(bps);
    const bcs = splitList(usp.get("b.condition"));
    if (bcs.length) setBConditions(bcs);

    // laneego
    const lleft = splitList(usp.get("l.left")).filter((v) =>
      (["DISP", "INDISP"] as const).includes(v as any),
    );
    if (lleft.length) setLaneLeft(lleft as LaneLeftVal[]);
    const lright = splitList(usp.get("l.right")).filter((v) =>
      (["DISP", "INDISP"] as const).includes(v as any),
    );
    if (lright.length) setLaneRight(lright as LaneRightVal[]);

    // CAN - vehicle speed (c.v)
    const vRange = usp.get("c.v");
    if (vRange) {
      const [mn, mx] = parseRangeToken(vRange);
      if (mn !== "") setVMin(mn);
      if (mx !== "") setVMax(mx);
    }

    // CAN - SteeringWheelAngle (c.swa)
    const swaR = usp.get("c.swa");
    if (swaR) {
      const parts = swaR.split(",");
      const chipKeys: string[] = [];
      parts.forEach((p) => {
        const match = SWA_CHIPS.find((ch) => ch.range === p);
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

    // CAN - brakes (c.brakes)
    const brRaw = splitList(usp.get("c.brakes"));
    if (brRaw.length) {
      const keys: BrakeKey[] = [];
      brRaw.forEach((v) => {
        if (v === BRAKE_DB_MAP.not_pressed) keys.push("not_pressed");
        if (v === BRAKE_DB_MAP.pressed) keys.push("pressed");
      });
      if (keys.length) setBrakes(keys);
    }

    // Overpass
    const hg = splitList(usp.get("o.highway"));
    if (hg.length) setHighwayGroups(hg);
    const lu = splitList(usp.get("o.landuse"));
    if (lu.length) setLanduseGroups(lu);
    const ln = splitList(usp.get("o.lanes"));
    if (ln.length) setLanes(ln);
    const ms = splitList(usp.get("o.maxspeed"))
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (ms.length) setMaxSpeedPreset(ms as number[]);
    const ow = splitList(usp.get("o.oneway")).filter((v) =>
      (ONEWAY as readonly string[]).includes(v),
    );
    if (ow.length) setOneway(ow as OneWayVal[]);
    const sf = splitList(usp.get("o.surface")).filter((v) =>
      (SURFACE_GROUPS as readonly string[]).includes(v),
    );
    if (sf.length) setSurface(sf as SurfaceVal[]);
    const sw = splitList(usp.get("o.sidewalk")).filter((v) =>
      (SIDEWALK as readonly string[]).includes(v),
    );
    if (sw.length) setSidewalk(sw as SidewalkVal[]);
    const cy = splitList(usp.get("o.cycleway")).filter((v) =>
      (CYCLEWAY as readonly string[]).includes(v),
    );
    if (cy.length) setCycleway(cy as CyclewayVal[]);

    // SemSeg building
    const sBld = usp.get("s.building");
    if (sBld) {
      const parts = sBld.split(",");
      const chips: SemsegChip[] = [];
      parts.forEach((tok) => {
        const [mn, mx] = parseRangeToken(tok);
        if (mx !== "" && mn === "" && (mx as number) <= SEMSEG_THRESH.building.p25 + 1e-2)
          chips.push("low");
        if (
          mn !== "" &&
          mx !== "" &&
          approxEq(mn as number, SEMSEG_THRESH.building.p25) &&
          approxEq(mx as number, SEMSEG_THRESH.building.p75)
        )
          chips.push("mid");
        if (mn !== "" && (mn as number) >= SEMSEG_THRESH.building.p75 - 1e-2 && mx === "")
          chips.push("high");
      });
      if (chips.length) setBldChips(Array.from(new Set(chips)));
    }

    // SemSeg vegetation
    const sVeg = usp.get("s.vegetation");
    if (sVeg) {
      const parts = sVeg.split(",");
      const chips: SemsegChip[] = [];
      parts.forEach((tok) => {
        const [mn, mx] = parseRangeToken(tok);
        if (mx !== "" && mn === "" && (mx as number) <= SEMSEG_THRESH.vegetation.p25 + 1e-2)
          chips.push("low");
        if (
          mn !== "" &&
          mx !== "" &&
          approxEq(mn as number, SEMSEG_THRESH.vegetation.p25) &&
          approxEq(mx as number, SEMSEG_THRESH.vegetation.p75)
        )
          chips.push("mid");
        if (mn !== "" && (mn as number) >= SEMSEG_THRESH.vegetation.p75 - 1e-2 && mx === "")
          chips.push("high");
      });
      if (chips.length) setVegChips(Array.from(new Set(chips)));
    }

    // YOLO classes
    const yc = splitList(usp.get("y.class"));
    if (yc.length) setYClasses(yc);

    // YOLO rel_to_ego (y.rel)
    const re = splitList(usp.get("y.rel"));
    if (re.length) setRelEgo(re);

    // YOLO confidence
    const yconf = usp.get("y.conf");
    if (yconf) {
      const parts = yconf.split(",");
      const chips: ConfChip[] = [];
      parts.forEach((tok) => {
        const [mn2, mx2] = parseRangeToken(tok);
        const lo = mn2 === "" && mx2 !== "" && (mx2 as number) <= 0.34;
        const mi =
          mn2 !== "" &&
          mx2 !== "" &&
          approxEq(mn2 as number, 0.33) &&
          approxEq(mx2 as number, 0.66);
        const hi = mn2 !== "" && mx2 === "" && (mn2 as number) >= 0.66 - 1e-2;
        if (lo) chips.push("low");
        if (mi) chips.push("mid");
        if (hi) chips.push("high");
      });
      if (chips.length) setConfChips(Array.from(new Set(chips)));
    }

    // YOLO distance
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

  // SemSeg chips -> ranges (UNION via comma-join)
  const semsegRanges = useMemo(() => {
    const ranges: Record<string, string | undefined> = {};
    if (bldChips.length) {
      const t = SEMSEG_THRESH.building;
      const parts: string[] = [];
      if (bldChips.includes("low")) parts.push(`..${t.p25}`);
      if (bldChips.includes("mid")) parts.push(`${t.p25}..${t.p75}`);
      if (bldChips.includes("high")) parts.push(`${t.p75}..`);
      ranges["s.building"] = parts.join(",");
    }
    if (vegChips.length) {
      const t = SEMSEG_THRESH.vegetation;
      const parts: string[] = [];
      if (vegChips.includes("low")) parts.push(`..${t.p25}`);
      if (vegChips.includes("mid")) parts.push(`${t.p25}..${t.p75}`);
      if (vegChips.includes("high")) parts.push(`${t.p75}..`);
      ranges["s.vegetation"] = parts.join(",");
    }
    return ranges;
  }, [bldChips, vegChips]);

  // Confidence chips -> union of ranges
  const confRange = useMemo(() => {
    if (!confChips.length) return undefined;
    const map: Record<ConfChip, string> = {
      low: "..0.33",
      mid: "0.33..0.66",
      high: "0.66..",
    };
    return confChips.map((k) => map[k]).join(",");
  }, [confChips]);

  // S.W.A chips -> ranges (union)
  const swaRanges = useMemo(() => {
    if (!swaChips.length) return undefined;
    const map: Record<string, string> = {};
    SWA_CHIPS.forEach((ch) => {
      map[ch.key] = ch.range;
    });
    return swaChips.map((k) => map[k]).join(",");
  }, [swaChips]);

  // Build API params
  const urlParams = useMemo(() => {
    const p: Record<string, string | undefined> = {
      ...(bVehicles.length ? { "b.vehicle": bVehicles.join(",") } : {}),
      ...(bPeriods.length ? { "b.period": bPeriods.join(",") } : {}),
      ...(bConditions.length ? { "b.condition": bConditions.join(",") } : {}),
      ...(laneLeft.length ? { "l.left": laneLeft.join(",") } : {}),
      ...(laneRight.length ? { "l.right": laneRight.join(",") } : {}),
      ...(toRangeParam(vMin, vMax) ? { "c.v": toRangeParam(vMin, vMax) } : {}),
      ...(swaRanges
        ? { "c.swa": swaRanges }
        : toRangeParam(swaMin, swaMax)
        ? { "c.swa": toRangeParam(swaMin, swaMax) }
        : {}),
      ...(brakes.length
        ? { "c.brakes": brakes.map((k) => BRAKE_DB_MAP[k]).join(",") }
        : {}),
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
      ...(relEgo.length ? { "y.rel": relEgo.join(",") } : {}),
      ...(confRange ? { "y.conf": confRange } : {}),
      ...(toRangeParam(distMin, distMax)
        ? { "y.dist_m": toRangeParam(distMin, distMax) }
        : {}),
    };
    return p;
  }, [
    bVehicles,
    bPeriods,
    bConditions,
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
    maxSpeedPreset,
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

  const apiURL = useMemo(
    () => buildURL(`${API_BASE}/api/search`, urlParams),
    [urlParams],
  );

  const hasAnyFilter = useMemo(
    () => Object.keys(urlParams).length > 0,
    [urlParams],
  );

  // Keep browser hash URL in sync with filters (/search?...)
  useEffect(() => {
    const q = apiURL.split("?")[1] ?? "";
    navigate({ pathname: "/search", search: q ? `?${q}` : "" }, { replace: true });
  }, [apiURL, navigate]);

  // Collapsed summaries
  const vehicleSummary = useMemo(() => {
    const tags: string[] = [];
    bVehicles.forEach((v) => tags.push(`vehicle:${v}`));
    bPeriods.forEach((v) => tags.push(`period:${v}`));
    bConditions.forEach((v) => tags.push(`condition:${v}`));
    return tags;
  }, [bVehicles, bPeriods, bConditions]);

  const lanesSummary = useMemo(() => {
    const tags: string[] = [];
    laneLeft.forEach((v) => tags.push(`left:${v}`));
    laneRight.forEach((v) => tags.push(`right:${v}`));
    return tags;
  }, [laneLeft, laneRight]);

  const canSummary = useMemo(() => {
    const tags: string[] = [];
    const r = toRangeParam(vMin, vMax);
    if (r) tags.push(`speed:${r}`);
    if (swaChips.length) tags.push(...swaChips.map((k) => `swa:${k}`));
    else {
      const rs = toRangeParam(swaMin, swaMax);
      if (rs) tags.push(`swa:${rs}`);
    }
    brakes.forEach((b) => tags.push(`brake:${b}`));
    return tags;
  }, [vMin, vMax, swaChips, swaMin, swaMax, brakes]);

  const yoloSummary = useMemo(() => {
    const tags: string[] = [];
    yClasses.forEach((c) => tags.push(`class:${c}`));
    relEgo.forEach((e) => tags.push(`ego:${e}`));
    if (confChips.length) tags.push(...confChips.map((c) => `conf:${c}`));
    const dr = toRangeParam(distMin, distMax);
    if (dr) tags.push(`dist:${dr}`);
    return tags;
  }, [yClasses, relEgo, confChips, distMin, distMax]);

  const roadSummary = useMemo(() => {
    const tags: string[] = [];
    highwayGroups.forEach((g) => tags.push(`highway:${g}`));
    landuseGroups.forEach((g) => tags.push(`landuse:${g}`));
    lanes.forEach((l) => tags.push(`lanes:${l}`));
    maxSpeedPreset.forEach((s) => tags.push(`max:${s}`));
    oneway.forEach((o) => tags.push(`oneway:${o}`));
    surface.forEach((s) => tags.push(`surface:${s}`));
    sidewalk.forEach((s) => tags.push(`sidewalk:${s}`));
    cycleway.forEach((c) => tags.push(`cycleway:${c}`));
    return tags;
  }, [
    highwayGroups,
    landuseGroups,
    lanes,
    maxSpeedPreset,
    oneway,
    surface,
    sidewalk,
    cycleway,
  ]);

  const semsegSummary = useMemo(() => {
    const tags: string[] = [];
    bldChips.forEach((b) => tags.push(`bld:${b}`));
    vegChips.forEach((v) => tags.push(`veg:${v}`));
    return tags;
  }, [bldChips, vegChips]);

  // heavy vehicles helper (truck + bus)
  const heavyActive = useMemo(
    () => yClasses.includes("truck") || yClasses.includes("bus"),
    [yClasses],
  );

  const toggleHeavyVehicles = () => {
    setYClasses((curr) => {
      const has = curr.includes("truck") || curr.includes("bus");
      if (has) {
        return curr.filter((c) => c !== "truck" && c !== "bus");
      }
      const base = curr.filter((c) => c !== "truck" && c !== "bus");
      if (!base.includes("truck")) base.push("truck");
      if (!base.includes("bus")) base.push("bus");
      return base;
    });
  };

  // Clear all filters
  const handleClear = () => {
    setColVehicle(true);
    setColCAN(true);
    setColYOLO(true);
    setColRoad(true);
    setColSemSeg(true);
    setColLanes(true);
    setBVehicles([]);
    setBPeriods([]);
    setBConditions([]);
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
  };

  // Send query directly to /View
  const handleViewHere = () => {
    if (!hasAnyFilter) {
      alert("Please select at least one filter before opening the View page.");
      return;
    }
    const q = apiURL.split("?")[1] ?? "";
    navigate({ pathname: "/View", search: q ? `?${q}` : "" }, { replace: false });
  };

  return (
    <div className="bg-zinc-950 min-h-dvh flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1">


        <div className="px-4">
          <div className="max-w-7xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 mt-2 text-yellow-300">
              Adaptive DAQ
            </h2>

            {/* Top info + actions panel */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <p className="text-sm text-zinc-200">
                  Use the filters below to build a search query and then open the results in the
                  <span className="font-semibold text-yellow-300"> View</span> page.
                </p>
                <div className="flex gap-2 w-full md:w-auto justify-start md:justify-end">
                  <button
                    onClick={handleClear}
                    className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-md text-sm md:text-base"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleViewHere}
                    className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-5 py-2 rounded-md text-sm md:text-base font-semibold"
                  >
                    View here
                  </button>
                </div>
              </div>
            </div>

            {/* All panels stacked vertically */}
            <div className="space-y-4">
              <SearchVehicleScenePanel
                collapsed={colVehicle}
                onToggle={() => setColVehicle((v) => !v)}
                summaryItems={vehicleSummary}
                bVehicles={bVehicles}
                setBVehicles={setBVehicles}
                bPeriods={bPeriods}
                setBPeriods={setBPeriods}
                bConditions={bConditions}
                setBConditions={setBConditions}
              />

              <SearchVehicleDynamicsPanel
                collapsed={colCAN}
                onToggle={() => setColCAN((v) => !v)}
                summaryItems={canSummary}
                vMin={vMin}
                vMax={vMax}
                setVMin={setVMin}
                setVMax={setVMax}
                swaMin={swaMin}
                swaMax={swaMax}
                setSwaMin={setSwaMin}
                setSwaMax={setSwaMax}
                brakes={brakes}
                setBrakes={setBrakes}
                swaChips={swaChips}
                setSwaChips={setSwaChips}
                showSwaAdvanced={showSwaAdvanced}
                setShowSwaAdvanced={setShowSwaAdvanced}
              />

              <SearchPerceptionPanel
                collapsed={colYOLO}
                onToggle={() => setColYOLO((v) => !v)}
                summaryItems={yoloSummary}
                yClasses={yClasses}
                setYClasses={setYClasses}
                relEgo={relEgo}
                setRelEgo={setRelEgo}
                confChips={confChips}
                setConfChips={setConfChips}
                distMin={distMin}
                distMax={distMax}
                setDistMin={setDistMin}
                setDistMax={setDistMax}
                heavyActive={heavyActive}
                onToggleHeavyVehicles={toggleHeavyVehicles}
              />

              <SearchEnvironmentPanel
                collapsed={colSemSeg}
                onToggle={() => setColSemSeg((v) => !v)}
                summaryItems={semsegSummary}
                bldChips={bldChips}
                setBldChips={setBldChips}
                vegChips={vegChips}
                setVegChips={setVegChips}
              />

              <SearchRoadContextPanel
                collapsed={colRoad}
                onToggle={() => setColRoad((v) => !v)}
                summaryItems={roadSummary}
                highwayGroups={highwayGroups}
                setHighwayGroups={setHighwayGroups}
                landuseGroups={landuseGroups}
                setLanduseGroups={setLanduseGroups}
                lanes={lanes}
                setLanes={setLanes}
                maxSpeedPreset={maxSpeedPreset}
                setMaxSpeedPreset={setMaxSpeedPreset}
                oneway={oneway}
                setOneway={setOneway}
                surface={surface}
                setSurface={setSurface}
                sidewalk={sidewalk}
                setSidewalk={setSidewalk}
                cycleway={cycleway}
                setCycleway={setCycleway}
              />

              <SearchLanesPanel
                collapsed={colLanes}
                onToggle={() => setColLanes((v) => !v)}
                summaryItems={lanesSummary}
                laneLeft={laneLeft}
                setLaneLeft={setLaneLeft}
                laneRight={laneRight}
                setLaneRight={setLaneRight}
              />

              <div className="pb-5" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchVerticalAnimated;
