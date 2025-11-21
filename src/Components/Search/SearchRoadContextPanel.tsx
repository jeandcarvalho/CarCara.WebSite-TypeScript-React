// src/Components/SearchRoadContextPanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import {
  BR_MAXSPEEDS,
  CYCLEWAY,
  GROUPS,
  LANES_DIRECT,
  ONEWAY,
  SIDEWALK,
  SURFACE_GROUPS,
  Section,
  cls,
  toggleString,
} from "./searchShared";

type OneWayVal = (typeof ONEWAY)[number];
type SurfaceVal = (typeof SURFACE_GROUPS)[number];
type SidewalkVal = (typeof SIDEWALK)[number];
type CyclewayVal = (typeof CYCLEWAY)[number];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  highwayGroups: string[];
  setHighwayGroups: Dispatch<SetStateAction<string[]>>;
  landuseGroups: string[];
  setLanduseGroups: Dispatch<SetStateAction<string[]>>;
  lanes: string[];
  setLanes: Dispatch<SetStateAction<string[]>>;
  maxSpeedPreset: number[];
  setMaxSpeedPreset: Dispatch<SetStateAction<number[]>>;
  oneway: OneWayVal[];
  setOneway: Dispatch<SetStateAction<OneWayVal[]>>;
  surface: SurfaceVal[];
  setSurface: Dispatch<SetStateAction<SurfaceVal[]>>;
  sidewalk: SidewalkVal[];
  setSidewalk: Dispatch<SetStateAction<SidewalkVal[]>>;
  cycleway: CyclewayVal[];
  setCycleway: Dispatch<SetStateAction<CyclewayVal[]>>;
};

const SearchRoadContextPanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  highwayGroups,
  setHighwayGroups,
  landuseGroups,
  setLanduseGroups,
  lanes,
  setLanes,
  maxSpeedPreset,
  setMaxSpeedPreset,
  oneway,
  setOneway,
  surface,
  setSurface,
  sidewalk,
  setSidewalk,
  cycleway,
  setCycleway,
}) => {
  return (
    <Section
      title="Road Context"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      {/* two columns internally on md+ */}
      <div className="grid gap-6 md:grid-cols-2 text-sm md:text-base">
        {/* Column A */}
        <div className="grid gap-4">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Highway (groups)</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(GROUPS.highway).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setHighwayGroups((curr) => toggleString(curr, g))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    highwayGroups.includes(g)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                    setLanduseGroups((curr) => toggleString(curr, g))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    landuseGroups.includes(g)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400 mb-1">Lanes (1..6)</div>
            <div className="flex flex-wrap gap-2">
              {LANES_DIRECT.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setLanes((curr) => toggleString(curr, g))}
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    lanes.includes(g)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column B */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <span className="text-sm text-zinc-300">Maxspeed (BR presets)</span>
            <div className="flex flex-wrap gap-2">
              {BR_MAXSPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setMaxSpeedPreset((curr) =>
                      curr.includes(s)
                        ? curr.filter((x: number) => x !== s)
                        : [...curr, s],
                    )
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    maxSpeedPreset.includes(s)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                  onClick={() =>
                    setOneway((curr) => toggleString(curr, v))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    oneway.includes(v)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                    setSurface((curr) => toggleString(curr, v))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    surface.includes(v)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                    setSidewalk((curr) => toggleString(curr, v))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    sidewalk.includes(v)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                    setCycleway((curr) => toggleString(curr, v))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    cycleway.includes(v)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
  );
};

export default SearchRoadContextPanel;
