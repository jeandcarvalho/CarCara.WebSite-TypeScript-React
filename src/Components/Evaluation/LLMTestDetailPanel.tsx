// src/Components/LLMTestDetailPanel.tsx
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://carcara-web-api.onrender.com";

type SelectedDocLight = {
  acq_id: string;
  sec: number;
  response?: string | null;
  createdAt?: string;
  totalTokens?: number | null;
  latencyMs?: number | null;
};

type LLMResultContextResponse = {
  meta: {
    id: string;
    collectionId: string;
    acq_id: string;
    center_sec: number;
    secs: number[];
    test_name: string;
    llm_model: string;
    prompt_type: string;
    prompt_text: string;
    system_prompt: string | null;
    answer: string | null;
    total_tokens?: number | null;
    response_time_s?: number | null;
    createdAt?: string;
    collectionName?: string | null;
  };
  timeline: {
    sec: number;
    can?: {
      VehicleSpeed?: number;
      SteeringWheelAngle?: number;
      BrakeInfoStatus?: string;
    };
    yolo?: {
      track_id: number;
      class: string;
      conf: number;
      dist_m: number;
      rel_to_ego: string;
    }[];
    links?: { ext: string; link: string }[];
  }[];
  center_context?: {
    block?: {
      vehicle?: string;
      meteo?: {
        period?: string;
        condition?: string;
      };
    };
    overpass?: {
      city?: string;
      state?: string;
      country?: string;
      suburb?: string;
      road?: string;
      highway?: string | null;
      landuse?: string | null;
      lanes?: number | null;
      maxspeed?: number | null;
      oneway?: string | null;
      surface?: string | null;
      sidewalk?: string | null;
      cycleway?: string | null;
    };
    semseg?: {
      building?: number;
      vegetation?: number;
      sidewalk_left?: number;
      sidewalk_right?: number;
    };
  };
};

type LLMTestDetailPanelProps = {
  selectedDoc: SelectedDocLight | null;
  collectionId?: string;
  testName?: string | null;
  llmModel?: string | null;
  promptType?: string | null;
  onPromptChange?: (prompt: string | null) => void;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const googleDriveToDirect = (url: string): string => {
  // Trata links do tipo: https://drive.google.com/file/d/<ID>/view?...
  const fileMatch = url.match(/\/file\/d\/([^/]+)\//);
  if (fileMatch && fileMatch[1]) {
    const id = fileMatch[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  // Trata links do tipo: https://drive.google.com/open?id=<ID>
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch && idMatch[1]) {
    const id = idMatch[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  return url;
};

type AggregatedYOLO = {
  track_id: number;
  clazz: string;
  avgDist: number;
  trend: "approaching" | "moving away" | "stable";
  dominantRel: string;
  maxConf: number;
};

export const LLMTestDetailPanel: React.FC<LLMTestDetailPanelProps> = ({
  selectedDoc,
  collectionId,
  testName,
  llmModel,
  promptType,
  onPromptChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [ctxError, setCtxError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<LLMResultContextResponse | null>(null);

  const [selectedFrameSec, setSelectedFrameSec] = useState<number | null>(
    null
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    null
  );

  // carrega contexto sempre que o doc selecionado mudar
  useEffect(() => {
    if (!selectedDoc || !collectionId || !testName || !llmModel || !promptType) {
      setCtx(null);
      setCtxError(null);
      setSelectedFrameSec(null);
      setSelectedImageUrl(null);
      return;
    }

    const fetchContext = async () => {
      try {
        setLoading(true);
        setCtxError(null);

        const params = new URLSearchParams({
          collectionId,
          acq_id: selectedDoc.acq_id,
          sec: String(selectedDoc.sec),
          testName,
          llmModel,
          promptType,
        });

        const url = `${API_BASE}/public/llmresult/context?${params.toString()}`;
        console.log("[LLMTestDetailPanel] fetching context:", url);

        const res = await fetch(url);
        const data: LLMResultContextResponse = await res
          .json()
          .catch(() => null as any);

        if (!res.ok || !data || !data.meta) {
          console.error("[LLMTestDetailPanel] context error:", data);
          setCtx(null);
          setCtxError("Unable to load LLM result context.");
          return;
        }

        setCtx(data);

        // repassa prompt pro handler (pro painel lá de cima)
        if (onPromptChange) {
          onPromptChange(data.meta.prompt_text || null);
        }

        // inicializa frame selecionado como o center_sec
        const centerSec = data.meta.center_sec ?? selectedDoc.sec;
        setSelectedFrameSec(centerSec);

        const centerTimelineItem =
          data.timeline.find((t) => t.sec === centerSec) ||
          data.timeline[0];

        if (centerTimelineItem && centerTimelineItem.links?.length) {
          const firstLink = centerTimelineItem.links[0].link;
          setSelectedImageUrl(googleDriveToDirect(firstLink));
        } else {
          setSelectedImageUrl(null);
        }
      } catch (err) {
        console.error("[LLMTestDetailPanel] fetch error:", err);
        setCtx(null);
        setCtxError("Connection error while loading context.");
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [selectedDoc, collectionId, testName, llmModel, promptType, onPromptChange]);

  const handleSelectFrame = (sec: number, url?: string) => {
    setSelectedFrameSec(sec);
    if (url) {
      setSelectedImageUrl(googleDriveToDirect(url));
    } else {
      setSelectedImageUrl(null);
    }
  };

  const metaCreatedAt =
    ctx?.meta?.createdAt || selectedDoc?.createdAt || null;

  const metaLatencyMs =
    (ctx?.meta?.response_time_s != null
      ? Math.round(ctx.meta.response_time_s * 1000)
      : null) ?? selectedDoc?.latencyMs ?? null;

  const metaTokens =
    ctx?.meta?.total_tokens ??
    selectedDoc?.totalTokens ??
    null;

  const aggregatedYOLO: AggregatedYOLO[] = useMemo(() => {
    if (!ctx?.timeline?.length) return [];

    const map = new Map<
      number,
      {
        clazz: string;
        samples: { sec: number; dist_m: number; rel: string; conf: number }[];
      }
    >();

    ctx.timeline.forEach((t) => {
      t.yolo?.forEach((obj) => {
        if (!map.has(obj.track_id)) {
          map.set(obj.track_id, {
            clazz: obj.class,
            samples: [],
          });
        }
        map.get(obj.track_id)!.samples.push({
          sec: t.sec,
          dist_m: obj.dist_m,
          rel: obj.rel_to_ego,
          conf: obj.conf,
        });
      });
    });

    const out: AggregatedYOLO[] = [];

    map.forEach((value, track_id) => {
      const samples = value.samples.sort((a, b) => a.sec - b.sec);
      const first = samples[0];
      const last = samples[samples.length - 1];

      const diff = last.dist_m - first.dist_m;
      let trend: AggregatedYOLO["trend"] = "stable";
      const TH = 0.5;
      if (diff < -TH) trend = "approaching";
      else if (diff > TH) trend = "moving away";

      const avgDist =
        samples.reduce((sum, s) => sum + s.dist_m, 0) / samples.length;

      const relCount: Record<string, number> = {};
      samples.forEach((s) => {
        relCount[s.rel] = (relCount[s.rel] || 0) + 1;
      });
      const dominantRel =
        Object.entries(relCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "-";

      const maxConf = samples.reduce(
        (m, s) => (s.conf > m ? s.conf : m),
        0
      );

      out.push({
        track_id,
        clazz: value.clazz,
        avgDist,
        trend,
        dominantRel,
        maxConf,
      });
    });

    // ordena por distância média
    return out.sort((a, b) => a.avgDist - b.avgDist);
  }, [ctx]);

  const niceRel = (rel: string) => {
    if (!rel) return "-";
    return rel;
  };

  const trendLabel = (t: AggregatedYOLO["trend"]) => {
    if (t === "approaching") return "approaching";
    if (t === "moving away") return "moving away";
    return "stable";
  };

  if (!selectedDoc) {
    return (
      <div className="text-sm text-gray-300">
        Select a document above to see details.
      </div>
    );
  }

  if (loading && !ctx) {
    return (
      <div className="text-sm text-gray-300">
        Loading context for this LLM result...
      </div>
    );
  }

  if (ctxError && !ctx) {
    return (
      <div className="text-sm text-red-300">
        {ctxError}
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="text-sm text-gray-300">
        No context available for this LLM result.
      </div>
    );
  }

  const centerSec = ctx.meta.center_sec ?? selectedDoc.sec;

  const timeline = ctx.timeline.sort((a, b) => a.sec - b.sec);

  return (
    <div className="space-y-4 text-sm text-gray-100">
      {/* PRIMEIRA LINHA: Scene viewer + Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scene viewer (esquerda) */}
        <section>
          <h3 className="text-base font-semibold text-yellow-200 mb-2">
            Scene viewer
          </h3>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <div className="aspect-video w-full bg-black/60 flex items-center justify-center rounded-md overflow-hidden mb-3">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={`Scene at second ${selectedFrameSec ?? centerSec}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-500">
                  No image available for this window.
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-300 mb-2">
              <span>
                acq_id:{" "}
                <span className="font-mono text-gray-100">
                  {ctx.meta.acq_id}
                </span>
              </span>
              <span>
                center second:{" "}
                <span className="font-semibold text-yellow-200">
                  {centerSec}
                </span>
              </span>
            </div>

            <div className="mt-2">
              <p className="text-[11px] text-gray-400 mb-1">
                Timeline frames
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {timeline.map((t) => {
                  const hasImage = !!t.links?.length;
                  const thumbUrl = hasImage
                    ? googleDriveToDirect(t.links![0].link)
                    : null;
                  const isActive =
                    (selectedFrameSec ?? centerSec) === t.sec;

                  return (
                    <button
                      key={t.sec}
                      onClick={() =>
                        handleSelectFrame(
                          t.sec,
                          t.links && t.links[0]
                            ? t.links[0].link
                            : undefined
                        )
                      }
                      className={`flex-shrink-0 rounded-md border text-[11px] px-1.5 py-1 ${
                        isActive
                          ? "border-yellow-400 bg-yellow-900/40"
                          : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                      }`}
                    >
                      {thumbUrl ? (
                        <div className="w-20 h-12 mb-1 rounded overflow-hidden bg-black/60">
                          <img
                            src={thumbUrl}
                            alt={`sec ${t.sec}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-12 mb-1 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-gray-500">
                          no img
                        </div>
                      )}
                      <div className="text-center text-[10px] text-gray-200">
                        s={t.sec}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Response (direita) */}
        <section>
          <h3 className="text-base font-semibold text-yellow-200 mb-2">
            LLM response
          </h3>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 mb-3">
              <div>
                <span className="text-gray-400">Latency:</span>{" "}
                <span className="font-mono text-gray-100">
                  {metaLatencyMs != null ? `${metaLatencyMs} ms` : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Tokens:</span>{" "}
                <span className="font-mono text-gray-100">
                  {metaTokens != null ? metaTokens : "-"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Created at:</span>{" "}
                <span className="font-mono text-gray-100">
                  {formatDateTime(metaCreatedAt)}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <div className="text-[11px] text-gray-400 mb-1">
                Answer
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 h-64 overflow-y-auto text-[12px] whitespace-pre-wrap">
                {ctx.meta.answer || "(no answer saved)"}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SEGUNDA LINHA: Center context + YOLO summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Center second context + meta (esquerda) */}
        <section>
          <h3 className="text-base font-semibold text-yellow-200 mb-2">
            Center second context (excluding CAN / YOLO)
          </h3>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-3 text-[13px]">
            {/* Vehicle & weather */}
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Vehicle &amp; weather
              </p>
              <p>
                <span className="text-gray-400">vehicle:</span>{" "}
                <span className="font-semibold">
                  {ctx.center_context?.block?.vehicle ?? "—"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">
                  period · weather:
                </span>{" "}
                <span>
                  {ctx.center_context?.block?.meteo?.period ??
                    "—"}
                  {" · "}
                  {ctx.center_context?.block?.meteo?.condition ??
                    "—"}
                </span>
              </p>
            </div>

            {/* Road */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Road</p>
              <p>
                <span className="text-gray-400">road:</span>{" "}
                <span>
                  {ctx.center_context?.overpass?.road ?? "—"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">
                  type · lanes · oneway:
                </span>{" "}
                <span>
                  {ctx.center_context?.overpass?.highway ??
                    "—"}
                  {" · "}
                  {ctx.center_context?.overpass?.lanes ??
                    "—"}
                  {" · "}
                  {ctx.center_context?.overpass?.oneway ??
                    "—"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">maxspeed:</span>{" "}
                <span>
                  {ctx.center_context?.overpass?.maxspeed ??
                    "—"}
                </span>
              </p>
            </div>

            {/* Semantic */}
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Semantic
              </p>
              <p>
                <span className="text-gray-400">
                  buildings · vegetation:
                </span>{" "}
                <span>
                  {ctx.center_context?.semseg?.building?.toFixed(
                    1
                  ) ?? "0.0"}
                  % ·{" "}
                  {ctx.center_context?.semseg?.vegetation?.toFixed(
                    1
                  ) ?? "0.0"}
                  %
                </span>
              </p>
              <p>
                <span className="text-gray-400">
                  sidewalk L · sidewalk R:
                </span>{" "}
                <span>
                  {ctx.center_context?.semseg?.sidewalk_left?.toFixed(
                    1
                  ) ?? "0.0"}
                  % ·{" "}
                  {ctx.center_context?.semseg?.sidewalk_right?.toFixed(
                    1
                  ) ?? "0.0"}
                  %
                </span>
              </p>
            </div>

            {/* Meta extra (acq, sec, latency, tokens, createdAt) */}
            <div className="pt-2 border-t border-zinc-800 mt-2">
              <p className="text-xs text-gray-400 mb-1">
                Meta
              </p>
              <p>
                <span className="text-gray-400">acq_id:</span>{" "}
                <span className="font-mono text-gray-100">
                  {ctx.meta.acq_id}
                </span>
              </p>
              <p>
                <span className="text-gray-400">second:</span>{" "}
                <span className="font-semibold text-yellow-200">
                  {centerSec}
                </span>
              </p>
              <p>
                <span className="text-gray-400">latency:</span>{" "}
                <span className="font-mono">
                  {metaLatencyMs != null
                    ? `${metaLatencyMs} ms`
                    : "-"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">tokens:</span>{" "}
                <span className="font-mono">
                  {metaTokens != null ? metaTokens : "-"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">
                  created at:
                </span>{" "}
                <span className="font-mono">
                  {formatDateTime(metaCreatedAt)}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* YOLO summary (direita) */}
        <section>
          <h3 className="text-base font-semibold text-yellow-200 mb-2">
            YOLO objects (window summary)
          </h3>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[13px] space-y-2">
            {aggregatedYOLO.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No YOLO objects in this window.
              </p>
            ) : (
              aggregatedYOLO.map((obj) => (
                <div
                  key={obj.track_id}
                  className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-1 last:border-0 last:pb-0"
                >
                  <div>
                    <p>
                      <span className="font-semibold capitalize">
                        {obj.clazz}
                      </span>{" "}
                      <span className="text-gray-400">
                        @ {obj.avgDist.toFixed(1)} m
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {trendLabel(obj.trend)}{" "}
                      <span className="text-gray-500">
                        ({niceRel(obj.dominantRel)})
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-gray-400">
                    <div>track #{obj.track_id}</div>
                    <div>conf {obj.maxConf.toFixed(3)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* TERCEIRA LINHA: CAN per second */}
      <section>
        <h3 className="text-base font-semibold text-yellow-200 mb-2">
          CAN per second
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
          <table className="min-w-full text-[12px]">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-300">
                <th className="text-left py-1 pr-3">sec</th>
                <th className="text-left py-1 pr-3">speed (km/h)</th>
                <th className="text-left py-1 pr-3">
                  steering (deg)
                </th>
                <th className="text-left py-1 pr-3">brake</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((t) => (
                <tr
                  key={t.sec}
                  className={`border-t border-zinc-900 ${
                    t.sec === centerSec
                      ? "bg-yellow-900/30"
                      : ""
                  }`}
                >
                  <td className="py-1 pr-3">{t.sec}</td>
                  <td className="py-1 pr-3">
                    {t.can?.VehicleSpeed != null
                      ? t.can.VehicleSpeed.toFixed(2)
                      : "-"}
                  </td>
                  <td className="py-1 pr-3">
                    {t.can?.SteeringWheelAngle != null
                      ? t.can.SteeringWheelAngle.toFixed(1)
                      : "-"}
                  </td>
                  <td className="py-1 pr-3">
                    {t.can?.BrakeInfoStatus ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {loading && (
        <p className="text-[11px] text-gray-500">
          Updating context...
        </p>
      )}
    </div>
  );
};
