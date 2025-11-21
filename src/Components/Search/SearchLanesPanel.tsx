// src/Components/SearchLanesPanel.tsx
import React, { Dispatch, SetStateAction } from "react";
import { LANE_EGO_LEFT, LANE_EGO_RIGHT, Section, cls } from "./searchShared";

type LeftVal = (typeof LANE_EGO_LEFT)[number];
type RightVal = (typeof LANE_EGO_RIGHT)[number];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  summaryItems: string[];
  laneLeft: LeftVal[];
  setLaneLeft: Dispatch<SetStateAction<LeftVal[]>>;
  laneRight: RightVal[];
  setLaneRight: Dispatch<SetStateAction<RightVal[]>>;
};

const SearchLanesPanel: React.FC<Props> = ({
  collapsed,
  onToggle,
  summaryItems,
  laneLeft,
  setLaneLeft,
  laneRight,
  setLaneRight,
}) => {
  return (
    <Section
      title="Lanes"
      collapsed={collapsed}
      onToggle={onToggle}
      summaryItems={summaryItems}
    >
      <div className="grid gap-4 text-sm md:text-base md:grid-cols-2">
        <div>
          <div className="text-sm text-zinc-400 mb-1">Left lane availability</div>
          <div className="flex flex-wrap gap-2">
            {LANE_EGO_LEFT.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() =>
                  setLaneLeft((curr) =>
                    curr.includes(v)
                      ? curr.filter((x) => x !== v)
                      : [...curr, v],
                  )
                }
                className={cls(
                  "px-4 py-2 rounded-full text-sm border transition",
                  laneLeft.includes(v)
                    ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                    : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
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
                    curr.includes(v)
                      ? curr.filter((x) => x !== v)
                      : [...curr, v],
                  )
                }
                className={cls(
                  "px-4 py-2 rounded-full text-sm border transition",
                  laneRight.includes(v)
                    ? "bg-yellow-500 text-zinc-900 border-yellow-400"
                    : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600",
                )}
              >
                {v === "DISP" ? "Right available" : "Right unavailable"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SearchLanesPanel;
