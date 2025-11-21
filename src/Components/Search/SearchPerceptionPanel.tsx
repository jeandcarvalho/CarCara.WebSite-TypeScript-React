// src/Components/SearchPerceptionPanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import {
  RangePair,
  REL_TO_EGO,
  Section,
  YOLO_CLASSES_COMMON,
  cls,
  toggleString,
} from "./searchShared";

type ConfChip = "low" | "mid" | "high";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  yClasses: string[];
  setYClasses: Dispatch<SetStateAction<string[]>>;
  relEgo: string[];
  setRelEgo: Dispatch<SetStateAction<string[]>>;
  confChips: ConfChip[];
  setConfChips: Dispatch<SetStateAction<ConfChip[]>>;
  distMin: number | "";
  distMax: number | "";
  setDistMin: Dispatch<SetStateAction<number | "">>;
  setDistMax: Dispatch<SetStateAction<number | "">>;
  heavyActive: boolean;
  onToggleHeavyVehicles: () => void;
};

const SearchPerceptionPanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  yClasses,
  setYClasses,
  relEgo,
  setRelEgo,
  confChips,
  setConfChips,
  distMin,
  distMax,
  setDistMin,
  setDistMax,
  heavyActive,
  onToggleHeavyVehicles,
}) => {
  return (
    <Section
      title="Perception"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      <div className="grid gap-4 text-sm md:text-base md:grid-cols-2">
        {/* Left column: Classes + Position vs ego */}
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Classes</div>
            <div className="flex flex-wrap gap-2">
              {YOLO_CLASSES_COMMON.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setYClasses((curr) => toggleString(curr, c as string))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    yClasses.includes(c)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {c}
                </button>
              ))}

              {/* Heavy vehicles (truck + bus) */}
              <button
                type="button"
                onClick={onToggleHeavyVehicles}
                className={cls(
                  "px-3 py-1 rounded-full text-sm border transition",
                  heavyActive
                    ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                    : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                )}
              >
                Heavy vehicles
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400 mb-1">Position vs ego</div>
            <div className="flex flex-wrap gap-2">
              {REL_TO_EGO.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setRelEgo((curr) => toggleString(curr, opt.value))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    relEgo.includes(opt.value)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Confidence + Distance */}
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Confidence</div>
            <div className="flex flex-wrap gap-2">
              {(["low", "mid", "high"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setConfChips((curr) =>
                      curr.includes(k)
                        ? (curr.filter((x) => x !== k) as ConfChip[])
                        : ([...curr, k] as ConfChip[]),
                    )
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    confChips.includes(k)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
      </div>
    </Section>
  );
};

export default SearchPerceptionPanel;
