// src/Components/SearchEnvironmentPanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import { Section, cls, toggleString } from "./searchShared";

type Chip = "low" | "mid" | "high";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  bldChips: Chip[];
  setBldChips: Dispatch<SetStateAction<Chip[]>>;
  vegChips: Chip[];
  setVegChips: Dispatch<SetStateAction<Chip[]>>;
};

const SearchEnvironmentPanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  bldChips,
  setBldChips,
  vegChips,
  setVegChips,
}) => {
  return (
    <Section
      title="Environment"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      <div className="grid gap-4 text-sm md:text-base md:grid-cols-2">
        <div>
          <div className="text-sm text-zinc-400 mb-1">Building</div>
          <div className="flex flex-wrap gap-2">
            {(["low", "mid", "high"] as const).map((k) => (
              <button
                key={`bld-${k}`}
                type="button"
                onClick={() =>
                  setBldChips((curr) => toggleString(curr, k))
                }
                className={cls(
                  "px-3 py-1 rounded-full text-sm border transition",
                  bldChips.includes(k)
                    ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                    : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                onClick={() =>
                  setVegChips((curr) => toggleString(curr, k))
                }
                className={cls(
                  "px-3 py-1 rounded-full text-sm border transition",
                  vegChips.includes(k)
                    ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                    : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                )}
              >
                {k === "low" ? "Low %" : k === "mid" ? "Medium %" : "High %"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SearchEnvironmentPanel;
