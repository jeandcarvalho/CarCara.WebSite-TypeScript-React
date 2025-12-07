// src/Components/LLMTestDetailPanel.tsx
import React, { useEffect, useState } from "react";
import type {
  LLMResultDoc,
  LLMResultContextResponse,
} from "./TestHandler";

type Props = {
  selectedDoc: LLMResultDoc | null;
  onPrev: () => void;
  onNext: () => void;
  showMetrics?: boolean; // true no modo público
  contextData: LLMResultContextResponse | null;
  contextLoading: boolean;
  contextError: string | null;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const formatNumber = (val: number | null | undefined, digits = 1) => {
  if (val === null || val === undefined || Number.isNaN(val)) return "-";
  return val.toFixed(digits);
};

// Converte link do Google Drive em algo usável em <img />
const getDriveImageSrc = (url: string) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    // tenta pegar id=? se existir
    let id = u.searchParams.get("id") || undefined;

    // senão, tenta /d/ID/
    if (!id) {
      const m = u.pathname.match(/\/d\/([^/]+)/);
      if (m && m[1]) {
        id = m[1];
      }
    }

    if (id) {
      // tenta usar o endpoint de imagem do Google
      return `https://lh3.googleusercontent.com/d/${id}=s2048`;
    }
  } catch {
    // se der erro no URL, cai no fallback
  }
  return url;
};

export const LLMTestDetailPanel: React.FC<Props> = ({
  selectedDoc,
  onPrev,
  onNext,
  showMetrics,
  contextData,
  contextLoading,
  contextError,
}) => {
  const [focusedSec, setFocusedSec] = useState<number | null>(null);

  if (!selectedDoc) {
    return (
      <div className="text-sm text-gray-400">
        Select a document on the right to see its details.
      </div>
    );
  }

  const ctxMeta = contextData?.meta;
  const ctxTimeline = contextData?.timeline ?? [];
  const ctxCenter = contextData?.center_context;

  const centerSec = ctxMeta?.center_sec ?? selectedDoc.sec;

  // sempre que trocar de doc ou de center_sec, resetar o foco
  useEffect(() => {
    setFocusedSec(centerSec);
  }, [selectedDoc.id, centerSec]);

  const effectiveSec = focusedSec ?? centerSec;
  const focusedItem =
    ctxTimeline.find((t) => t.sec === effectiveSec) ??
    ctxTimeline.find((t) => t.sec === centerSec) ??
    ctxTimeline[0] ??
    null;

  const mainLink =
    focusedItem?.links && focusedItem.links[0]
      ? focusedItem.links[0].link
      : null;
  const mainImgSrc = mainLink ? getDriveImageSrc(mainLink) : undefined;

  const allSecsStr =
    ctxMeta?.secs && ctxMeta.secs.length > 0
      ? ctxMeta.secs.join(", ")
      : ctxTimeline.map((t) => t.sec).join(", ");

  const systemPrompt = (ctxMeta?.system_prompt || "").trim();
  const promptText = (ctxMeta?.prompt_text || "").trim();

  let combinedPrompt = "";
  if (systemPrompt && promptText) {
    combinedPrompt =
      `System prompt:\n${systemPrompt}\n\nUser prompt:\n${promptText}`;
  } else if (systemPrompt || promptText) {
    combinedPrompt = systemPrompt || promptText;
  }

  const answerText =
    (ctxMeta?.answer && ctxMeta.answer.trim()) ||
    selectedDoc.response ||
    "(no answer saved)";

  const totalTokens =
    ctxMeta?.total_tokens ?? selectedDoc.totalTokens ?? null;
  const latencyMs =
    (ctxMeta?.response_time_s ?? null) !== null
      ? (ctxMeta!.response_time_s as number) * 1000
      : selectedDoc.latencyMs ?? null;

  // ========= Agrupamento YOLO por track_id =========
  type YoloEntry = {
    sec: number;
    dist_m: number;
    conf: number;
    rel_to_ego: string;
  };

  type YoloTrackGroup = {
    track_id: number;
    className: string;
    entries: YoloEntry[];
  };

  const yoloMap = new Map<number, YoloTrackGroup>();

  for (const item of ctxTimeline) {
    if (!item.yolo) continue;
    for (const det of item.yolo) {
      const id = det.track_id;
      if (!yoloMap.has(id)) {
        yoloMap.set(id, {
          track_id: id,
          className: det.class,
          entries: [],
        });
      }
      const group = yoloMap.get(id)!;
      group.entries.push({
        sec: item.sec,
        dist_m: det.dist_m,
        conf: det.conf,
        rel_to_ego: det.rel_to_ego,
      });
    }
  }

  const yoloGroups = Array.from(yoloMap.values()).sort(
    (a, b) => a.track_id - b.track_id
  );

  // helpers visuais YOLO
  const laneColor: Record<string, string> = {
    EGO: "bg-yellow-600",
    "L-1": "bg-emerald-600",
    "R+1": "bg-sky-600",
    "R-out": "bg-sky-900",
    "L-out": "bg-emerald-900",
  };

  const laneLabel = (lane: string) => lane || "—";

  const getTrendInfo = (entries: YoloEntry[]) => {
    if (entries.length === 0) return { label: "stable", arrow: "→" };
    const sorted = [...entries].sort((a, b) => a.sec - b.sec);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const delta = first.dist_m - last.dist_m;

    if (delta < -2) {
      return { label: "approaching", arrow: "↘" };
    }
    if (delta > 2) {
      return { label: "moving away", arrow: "↗" };
    }
    return { label: "stable", arrow: "→" };
  };

  const getLaneChangeLabel = (entries: YoloEntry[]) => {
    if (entries.length === 0) return "—";
    const sorted = [...entries].sort((a, b) => a.sec - b.sec);
    const first = sorted[0].rel_to_ego || "—";
    const last = sorted[sorted.length - 1].rel_to_ego || "—";
    if (first === last) return first;
    return `${first} → ${last}`;
  };

  const getAvgConf = (entries: YoloEntry[]) => {
    if (entries.length === 0) return null;
    const sum = entries.reduce((acc, e) => acc + e.conf, 0);
    return sum / entries.length;
  };

  const getConfLabel = (avg: number | null) => {
    if (avg === null) return "–";
    if (avg >= 0.8) return "high";
    if (avg >= 0.5) return "medium";
    return "low";
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-yellow-300">
            LLM result detail
          </h2>
          <div className="text-xs text-gray-300 space-y-0.5">
            <div>
              <span className="font-semibold text-yellow-200">test:</span>{" "}
              {selectedDoc.testName} ·{" "}
              <span className="font-semibold text-yellow-200">model:</span>{" "}
              {selectedDoc.llmModel} ·{" "}
              <span className="font-semibold text-yellow-200">prompt:</span>{" "}
              {selectedDoc.promptType}
            </div>
            <div>
              <span className="font-semibold text-yellow-200">acq_id:</span>{" "}
              {selectedDoc.acq_id} ·{" "}
              <span className="font-semibold text-yellow-200">sec:</span>{" "}
              {selectedDoc.sec}
              {ctxMeta?.center_sec !== undefined &&
                ctxMeta.center_sec !== selectedDoc.sec && (
                  <> (center sec: {ctxMeta.center_sec})</>
                )}
            </div>
            {ctxMeta?.createdAt && (
              <div>
                <span className="font-semibold text-yellow-200">
                  context created:
                </span>{" "}
                {formatDateTime(ctxMeta.createdAt)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-gray-100 hover:bg-zinc-800"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-gray-100 hover:bg-zinc-800"
          >
            Next →
          </button>
        </div>
      </div>

      {contextLoading && (
        <div className="mb-3 text-[11px] text-gray-300">
          Loading detailed context for this window...
        </div>
      )}

      {contextError && (
        <div className="mb-3 text-[11px] text-red-300">
          {contextError}
        </div>
      )}

      {/* GRID SUPERIOR:
          ESQUERDA: fotos + context + CAN
          DIREITA: YOLO objects
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-3">
          {/* Frames */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded p-3">
            <p className="text-[11px] text-gray-400 mb-2">
              Scene frames (secs {allSecsStr || effectiveSec})
            </p>

            {mainLink ? (
              <div className="space-y-2">
                <div className="w-full overflow-hidden rounded-md border border-zinc-800 bg-black">
                  <a
                    href={mainLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={mainImgSrc}
                      alt={`sec ${focusedItem?.sec ?? effectiveSec}`}
                      className="w-full max-h-64 object-contain"
                    />
                  </a>
                </div>

                {ctxTimeline.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pt-1">
                    {ctxTimeline
                      .sort((a, b) => a.sec - b.sec)
                      .map((item) => {
                        const link =
                          item.links && item.links[0]
                            ? item.links[0].link
                            : null;
                        if (!link) return null;
                        const thumbSrc = getDriveImageSrc(link);
                        const isActive = item.sec === effectiveSec;
                        return (
                          <button
                            key={item.sec}
                            type="button"
                            onClick={() => setFocusedSec(item.sec)}
                            className={`flex-shrink-0 border rounded overflow-hidden ${
                              isActive
                                ? "border-yellow-300"
                                : "border-zinc-700 hover:border-zinc-400"
                            }`}
                          >
                            <div className="text-[10px] text-gray-300 mb-0.5 text-center bg-zinc-900/80 px-1 py-0.5">
                              sec {item.sec}
                            </div>
                            <img
                              src={thumbSrc}
                              alt={`sec ${item.sec}`}
                              className="h-16 w-28 object-cover"
                            />
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No image links for this window.
              </p>
            )}
          </div>

          {/* Center second context (sem CAN/YOLO) */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded p-3 text-xs text-gray-200 space-y-1.5">
            <p className="text-[11px] text-gray-400 mb-1">
              Center second context (excluding CAN / YOLO)
            </p>

            {ctxCenter?.block && (
              <div>
                <span className="font-semibold text-yellow-200">
                  vehicle:
                </span>{" "}
                {ctxCenter.block.vehicle || "-"}{" "}
                {ctxCenter.block.meteo && (
                  <>
                    ·{" "}
                    <span className="font-semibold text-yellow-200">
                      period:
                    </span>{" "}
                    {ctxCenter.block.meteo.period || "-"} ·{" "}
                    <span className="font-semibold text-yellow-200">
                      weather:
                    </span>{" "}
                    {ctxCenter.block.meteo.condition || "-"}
                  </>
                )}
              </div>
            )}

            {ctxCenter?.overpass && (
              <div>
                <span className="font-semibold text-yellow-200">
                  location:
                </span>{" "}
                {ctxCenter.overpass.road || "-"},{" "}
                {ctxCenter.overpass.suburb || "-"},{" "}
                {ctxCenter.overpass.city || "-"} -{" "}
                {ctxCenter.overpass.state || "-"},{" "}
                {ctxCenter.overpass.country || "-"}
              </div>
            )}

            {ctxCenter?.overpass && (
              <div>
                <span className="font-semibold text-yellow-200">
                  road type:
                </span>{" "}
                {ctxCenter.overpass.highway || "-"} ·{" "}
                <span className="font-semibold text-yellow-200">
                  lanes:
                </span>{" "}
                {ctxCenter.overpass.lanes ?? "-"} ·{" "}
                <span className="font-semibold text-yellow-200">
                  oneway:
                </span>{" "}
                {ctxCenter.overpass.oneway || "-"}{" "}
                {ctxCenter.overpass.maxspeed && (
                  <>
                    ·{" "}
                    <span className="font-semibold text-yellow-200">
                      maxspeed:
                    </span>{" "}
                    {ctxCenter.overpass.maxspeed}
                  </>
                )}
              </div>
            )}

            {ctxCenter?.semseg && (
              <div>
                <span className="font-semibold text-yellow-200">
                  semantic:
                </span>{" "}
                buildings {formatNumber(ctxCenter.semseg.building)}% ·
                vegetation {formatNumber(ctxCenter.semseg.vegetation)}% ·
                sidewalk L {formatNumber(
                  ctxCenter.semseg.sidewalk_left
                )}
                % · sidewalk R{" "}
                {formatNumber(ctxCenter.semseg.sidewalk_right)}%
              </div>
            )}

            {!ctxCenter && (
              <div className="text-[11px] text-gray-400">
                No aggregated context was stored for this window.
              </div>
            )}
          </div>

          {/* CAN per second */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded p-3 space-y-2">
            <p className="text-[11px] text-gray-400 mb-1">
              CAN per second
            </p>

            {ctxTimeline.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px] text-gray-200 border border-zinc-800 rounded">
                  <thead className="bg-zinc-900/80">
                    <tr>
                      <th className="px-2 py-1 text-left font-semibold border-b border-zinc-800">
                        sec
                      </th>
                      <th className="px-2 py-1 text-left font-semibold border-b border-zinc-800">
                        speed (km/h)
                      </th>
                      <th className="px-2 py-1 text-left font-semibold border-b border-zinc-800">
                        steering (deg)
                      </th>
                      <th className="px-2 py-1 text-left font-semibold border-b border-zinc-800">
                        brake
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctxTimeline
                      .sort((a, b) => a.sec - b.sec)
                      .map((item) => (
                        <tr
                          key={item.sec}
                          className={
                            item.sec === centerSec
                              ? "bg-zinc-900/70"
                              : "bg-zinc-950"
                          }
                        >
                          <td className="px-2 py-1 border-b border-zinc-800">
                            {item.sec}
                          </td>
                          <td className="px-2 py-1 border-b border-zinc-800">
                            {item.can &&
                              formatNumber(
                                item.can.VehicleSpeed ?? 0,
                                1
                              )}
                          </td>
                          <td className="px-2 py-1 border-b border-zinc-800">
                            {item.can &&
                              formatNumber(
                                item.can.SteeringWheelAngle ?? 0,
                                1
                              )}
                          </td>
                          <td className="px-2 py-1 border-b border-zinc-800">
                            {item.can?.BrakeInfoStatus || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">
                No CAN data stored for this window.
              </p>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: YOLO objects em cards/quadradinhos */}
        <div className="flex flex-col">
          <div className="bg-zinc-950/60 border border-zinc-800 rounded p-3 flex-1 flex flex-col">
            <p className="text-[11px] text-gray-400 mb-1">
              YOLO objects (grouped by track)
            </p>

            {yoloGroups.length === 0 ? (
              <p className="text-[11px] text-gray-400">
                No YOLO detections stored for this window.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 items-stretch overflow-y-auto max-h-[640px]">
                {yoloGroups.map((group) => {
                  const sortedEntries = [...group.entries].sort(
                    (a, b) => a.sec - b.sec
                  );
                  const last =
                    sortedEntries[sortedEntries.length - 1];
                  const trend = getTrendInfo(sortedEntries);
                  const laneChangeLabel =
                    getLaneChangeLabel(sortedEntries);
                  const avgConf = getAvgConf(sortedEntries);
                  const confLabel = getConfLabel(avgConf);

                  return (
                    <div
                      key={group.track_id}
                      className="bg-zinc-950 border border-zinc-800 rounded p-2 flex flex-col min-h-[160px] justify-between"
                    >
                      {/* HEADER */}
                      <div>
                        <div className="flex justify-between items-center">
                          <div className="text-[11px] font-semibold text-yellow-200 capitalize">
                            {group.className}
                          </div>
                          {last && (
                            <div className="text-[10px] text-gray-200">
                              {formatNumber(last.dist_m, 1)} m{" "}
                              {trend.arrow} {trend.label}
                            </div>
                          )}
                        </div>
                        <div className="border-b border-zinc-800 mt-1 mb-2" />
                      </div>

                      {/* MEIO DIVIDIDO */}
                      <div className="grid grid-cols-2 text-[11px] text-gray-300 gap-x-2 mb-2">
                        <div>
                          <span className="font-semibold text-yellow-200">
                            lane:
                          </span>{" "}
                          {laneChangeLabel}
                        </div>
                        <div>
                          <span className="font-semibold text-yellow-200">
                            conf:
                          </span>{" "}
                          {confLabel}
                        </div>
                      </div>

                      {/* mini timeline de barrinhas fixas (esquerda → direita = tempo) */}
                      <div className="mt-1 flex gap-1 overflow-x-auto">
                        {sortedEntries.map((e) => {
                          const color =
                            laneColor[e.rel_to_ego] || "bg-zinc-700";
                          const opacity =
                            e.conf < 0.5
                              ? "opacity-40"
                              : e.conf < 0.8
                              ? "opacity-70"
                              : "opacity-100";

                          return (
                            <div
                              key={`${group.track_id}-${e.sec}`}
                              className="flex flex-col items-center text-[9px] text-gray-200"
                            >
                              <div
                                className={`w-4 h-5 rounded ${color} ${opacity} ${
                                  e.sec === centerSec
                                    ? "ring-1 ring-yellow-300"
                                    : ""
                                }`}
                                title={`sec ${e.sec} · ${e.dist_m.toFixed(
                                  1
                                )}m · lane ${
                                  e.rel_to_ego
                                } · conf ${e.conf.toFixed(2)}`}
                              />
                              <span className="text-[9px] mt-0.5">
                                {laneLabel(e.rel_to_ego)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROMPT SENT TO LLM – FULL WIDTH, ACIMA DA RESPOSTA */}
      <div className="mt-4 bg-zinc-950/60 border border-zinc-800 rounded p-3">
        <p className="text-[11px] text-gray-400 mb-1">
          Prompt sent to LLM
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-[12px] text-gray-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
          {combinedPrompt ||
            selectedDoc.prompt ||
            "(no prompt text available)"}
        </div>
      </div>

      {/* LLM ANSWER – FULL WIDTH EMBAIXO */}
      <div className="mt-4 bg-zinc-950/60 border border-zinc-800 rounded p-3 flex flex-col">
        <p className="text-[11px] text-gray-400 mb-1">LLM answer</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-[12px] text-gray-100 whitespace-pre-wrap max-h-[320px] overflow-y-auto">
          {answerText}
        </div>

        {(showMetrics || !!totalTokens || !!latencyMs) && (
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-300">
            {totalTokens !== null && (
              <div>
                <span className="font-semibold text-yellow-200">
                  total tokens:
                </span>{" "}
                {totalTokens}
              </div>
            )}
            {latencyMs !== null && (
              <div>
                <span className="font-semibold text-yellow-200">
                  latency:
                </span>{" "}
                  {latencyMs.toFixed(0)} ms
              </div>
            )}
            <div>
              <span className="font-semibold text-yellow-200">
                created at:
              </span>{" "}
              {formatDateTime(selectedDoc.createdAt)}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
