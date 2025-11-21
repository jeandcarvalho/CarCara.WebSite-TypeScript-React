// src/Components/SearchVehicleScenePanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import {
  Section,
  CONDITIONS,
  PERIODS,
  VEHICLES,
  cls,
  toggleString,
} from "./searchShared";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  bVehicles: string[];
  setBVehicles: Dispatch<SetStateAction<string[]>>;
  bPeriods: string[];
  setBPeriods: Dispatch<SetStateAction<string[]>>;
  bConditions: string[];
  setBConditions: Dispatch<SetStateAction<string[]>>;
};

const SearchVehicleScenePanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  bVehicles,
  setBVehicles,
  bPeriods,
  setBPeriods,
  bConditions,
  setBConditions,
}) => {
  return (
    <Section
      title="Vehicle & Scene"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      <div className="grid gap-4 text-sm md:text-base md:grid-cols-2">
        {/* Left column: Vehicle + Period */}
        <div className="grid gap-3">
          {/* Vehicles */}
          <div>
            <div className="text-sm text-zinc-400 mb-1">Vehicle</div>
            <div className="flex flex-wrap gap-2">
              {VEHICLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setBVehicles((curr) => toggleString(curr, v as string))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    bVehicles.includes(v)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <div className="text-sm text-zinc-400 mb-1">Period</div>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBPeriods((curr) => toggleString(curr, p))}
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    bPeriods.includes(p)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Condition */}
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Condition</div>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setBConditions((curr) => toggleString(curr, c.value))
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    bConditions.includes(c.value)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SearchVehicleScenePanel;
