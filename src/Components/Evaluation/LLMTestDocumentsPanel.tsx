// src/Components/LLMTestDocumentsPanel.tsx
import React from "react";
import type { LLMResultDoc } from "./TestHandler";

type LLMResultDocsResponse = {
  items: LLMResultDoc[];
  total: number;
  page: number;
  pageSize: number;
  testName?: string | null;
  llmModel?: string | null;
  promptType?: string | null;
  prompt?: string | null;
};

type RowStatus = "none" | "partial" | "full";

type Props = {
  docsResp: LLMResultDocsResponse;
  docsLoading: boolean;
  selectedDoc: LLMResultDoc | null;
  onSelectDoc: (doc: LLMResultDoc) => void;
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  isAuthenticated: boolean;
  getRowEvalStatus?: (doc: LLMResultDoc) => RowStatus;
};

const rowStatusClass = (status: RowStatus) => {
  if (status === "partial") {
    return "bg-yellow-900/40";
  }
  if (status === "full") {
    return "bg-emerald-900/30";
  }
  return "";
};

const rowStatusLabel = (status: RowStatus) => {
  if (status === "partial") return "Partial";
  if (status === "full") return "Done";
  return "—";
};

export const LLMTestDocumentsPanel: React.FC<Props> = ({
  docsResp,
  docsLoading,
  selectedDoc,
  onSelectDoc,
  page,
  totalPages,
  onChangePage,
  isAuthenticated,
  getRowEvalStatus,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl text-yellow-200">
          Documents ({docsResp.total})
        </h2>
      </div>

      {docsLoading && (
        <p className="text-gray-400 text-xs mb-1">
          Updating page...
        </p>
      )}

      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-zinc-800 rounded">
        <table className="min-w-full text-xs">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-2 py-1 text-left text-gray-200">
                acq_id
              </th>
              <th className="px-2 py-1 text-left text-gray-200">
                sec
              </th>

              {isAuthenticated ? (
                <>
                  <th className="px-2 py-1 text-left text-gray-200">
                    status
                  </th>
                  <th className="px-2 py-1 text-right text-gray-200">
                    actions
                  </th>
                </>
              ) : (
                <>
                  <th className="px-2 py-1 text-left text-gray-200">
                    latency (ms)
                  </th>
                  <th className="px-2 py-1 text-left text-gray-200">
                    tokens
                  </th>
                  <th className="px-2 py-1 text-right text-gray-200">
                    actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {docsResp.items.map((d) => {
              const isSelected =
                selectedDoc &&
                selectedDoc.acq_id === d.acq_id &&
                selectedDoc.sec === d.sec;

              const status: RowStatus = isAuthenticated
                ? getRowEvalStatus?.(d) ?? "none"
                : "none";

              return (
                <tr
                  key={d.id}
                  className={`border-t border-zinc-800 hover:bg-zinc-800/60 cursor-pointer ${
                    isAuthenticated ? rowStatusClass(status) : ""
                  } ${
                    isSelected
                      ? "bg-yellow-900/70 border-l-4 border-yellow-400"
                      : ""
                  }`}
                  onClick={() => onSelectDoc(d)}
                >
                  <td className="px-2 py-1 text-gray-100">
                    {d.acq_id}
                  </td>
                  <td className="px-2 py-1 text-gray-100">
                    {d.sec}
                  </td>

                  {isAuthenticated ? (
                    <>
                      <td className="px-2 py-1 text-gray-100">
                        {rowStatusLabel(status)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDoc(d);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-md text-[11px]"
                        >
                          View
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1 text-gray-100">
                        {d.latencyMs != null ? d.latencyMs : "-"}
                      </td>
                      <td className="px-2 py-1 text-gray-100">
                        {d.totalTokens != null ? d.totalTokens : "-"}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDoc(d);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-md text-[11px]"
                        >
                          View
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-300">
          <span>
            Page {page} of {totalPages} — {docsResp.total} docs
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onChangePage(Math.max(1, page - 1))}
              className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                page <= 1
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-gray-100 hover:bg-zinc-800"
              }`}
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() =>
                onChangePage(Math.min(totalPages, page + 1))
              }
              className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                page >= totalPages
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-gray-100 hover:bg-zinc-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};
