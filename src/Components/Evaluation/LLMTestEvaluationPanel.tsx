// src/Components/LLMTestEvaluationPanel.tsx
import React from "react";
import type { LLMResultDoc } from "./TestHandler";

type EvalValues = {
  test1: number;
  test2: number;
  test3: number;
  test4: number;
  test5: number;
};

type Props = {
  selectedDoc: LLMResultDoc | null;
  currentEval: EvalValues | null;
  evalsLoading: boolean;
  savingEval: boolean;
  onSetScore: (
    field: "test1" | "test2" | "test3" | "test4" | "test5",
    value: number
  ) => void;
  onSave: () => void;
};

export const LLMTestEvaluationPanel: React.FC<Props> = ({
  selectedDoc,
  currentEval,
  evalsLoading,
  savingEval,
  onSetScore,
  onSave,
}) => {
  if (!selectedDoc) {
    return (
      <>
        <h2 className="text-xl text-yellow-200 mb-3">Evaluation</h2>
        <p className="text-sm text-gray-300">
          Select a document to rate.
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl text-yellow-200 mb-3">Evaluation</h2>

      <p className="text-xs text-gray-300 mb-2">
        Give scores (1 to 5) for this second.{" "}
        <span className="text-gray-400">
          Click again on the same value to clear.
        </span>
      </p>

      {currentEval && (
        <div className="space-y-3 text-[12px] text-gray-200 mb-4">
          {(
            ["test1", "test2", "test3", "test4", "test5"] as const
          ).map((field, idx) => (
            <div key={field}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-yellow-200">
                  Test {idx + 1}
                </span>
                <span className="text-gray-400">
                  current:{" "}
                  {currentEval[field] === 0 ? "-" : currentEval[field]}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => onSetScore(field, val)}
                    className={`py-1.5 px-3 rounded-lg border text-sm ${
                      currentEval[field] === val
                        ? "bg-yellow-400 text-black border-yellow-300"
                        : "bg-zinc-800 text-gray-100 border-zinc-600 hover:bg-zinc-700"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSave}
        disabled={savingEval || !currentEval}
        className={`w-full py-2 rounded-lg font-semibold text-sm ${
          savingEval
            ? "bg-yellow-700 text-black cursor-wait"
            : "bg-yellow-500 hover:bg-yellow-400 text-black"
        }`}
      >
        {savingEval ? "Saving evaluation..." : "Save evaluation"}
      </button>

      {evalsLoading && (
        <p className="text-[11px] text-gray-400 mt-2">
          Loading evaluations...
        </p>
      )}
    </>
  );
};
