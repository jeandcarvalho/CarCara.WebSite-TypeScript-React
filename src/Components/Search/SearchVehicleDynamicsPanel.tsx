// src/Components/SearchVehicleDynamicsPanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import {
  BRAKE_KEYS,
  RangePair,
  Section,
  SWA_CHIPS,
  cls,
} from "./searchShared";

type BrakeKey = (typeof BRAKE_KEYS)[number];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  vMin: number | "";
  vMax: number | "";
  setVMin: Dispatch<SetStateAction<number | "">>;
  setVMax: Dispatch<SetStateAction<number | "">>;
  swaMin: number | "";
  swaMax: number | "";
  setSwaMin: Dispatch<SetStateAction<number | "">>;
  setSwaMax: Dispatch<SetStateAction<number | "">>;
  brakes: BrakeKey[];
  setBrakes: Dispatch<SetStateAction<BrakeKey[]>>;
  swaChips: string[];
  setSwaChips: Dispatch<SetStateAction<string[]>>;
  showSwaAdvanced: boolean;
  setShowSwaAdvanced: Dispatch<SetStateAction<boolean>>;
};

const SearchVehicleDynamicsPanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  vMin,
  vMax,
  setVMin,
  setVMax,
  swaMin,
  swaMax,
  setSwaMin,
  setSwaMax,
  brakes,
  setBrakes,
  swaChips,
  setSwaChips,
  showSwaAdvanced,
  setShowSwaAdvanced,
}) => {
  return (
    <Section
      title="Vehicle Dynamics"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      <div className="grid gap-4 text-sm md:text-base md:grid-cols-2">
        {/* Left column: Speed + Brakes */}
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

          <div>
            <div className="text-sm text-zinc-400 mb-2">BrakeInfoStatus</div>
            <div className="flex flex-wrap gap-2">
              {BRAKE_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setBrakes((curr) =>
                      curr.includes(k)
                        ? curr.filter((x) => x !== k)
                        : [...curr, k],
                    )
                  }
                  className={cls(
                    "px-4 py-2 rounded-full text-sm border transition",
                    brakes.includes(k)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Steering wheel angle */}
        <div className="grid gap-3">
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
                        : [...curr, ch.key],
                    )
                  }
                  className={cls(
                    "px-3 py-1 rounded-full text-sm border transition",
                    swaChips.includes(ch.key)
                      ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                  )}
                >
                  {ch.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="text-xs text-zinc-400 underline w-fit"
              onClick={() => setShowSwaAdvanced(!showSwaAdvanced)}
            >
              {showSwaAdvanced ? "Hide advanced range" : "Advanced range"}
            </button>
            {showSwaAdvanced && (
              <div className="grid gap-2">
                <span className="text-sm text-zinc-300">Angle (degrees)</span>
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
        </div>
      </div>
    </Section>
  );
};

export default SearchVehicleDynamicsPanel;
