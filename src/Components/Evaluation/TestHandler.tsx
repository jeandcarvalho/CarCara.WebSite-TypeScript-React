// src/Components/TestHandler.tsx
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import loadgif from "../img/gif.gif";

import { LLMTestDetailPanel } from "./LLMTestDetailPanel";
import { LLMTestEvaluationPanel } from "./LLMTestEvaluationPanel";
import { LLMTestDocumentsPanel } from "./LLMTestDocumentsPanel";

const API_BASE = "https://carcara-web-api.onrender.com";

export type LLMResultDoc = {
  id: string;
  acq_id: string;
  sec: number;
  testName: string;
  llmModel: string;
  promptType: string;
  prompt?: string | null;
  response?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  createdAt: string;
};

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

// ===== Tipos para o contexto (meta + timeline + center_context) =====
export type LLMResultContextMeta = {
  id: string;
  collectionId: string;
  acq_id: string;
  center_sec: number;
  secs: number[];
  test_name: string;
  llm_model: string;
  prompt_type: string;
  prompt_text?: string | null;
  system_prompt?: string | null;
  answer?: string | null;
  total_tokens?: number | null;
  response_time_s?: number | null;
  createdAt?: string | null;
  collectionName?: string | null;
};

export type LLMResultContextTimelineItem = {
  sec: number;
  can?: {
    VehicleSpeed?: number;
    SteeringWheelAngle?: number;
    BrakeInfoStatus?: string;
  } | null;
  yolo?: {
    track_id: number;
    class: string;
    conf: number;
    dist_m: number;
    rel_to_ego: string;
  }[];
  links?: {
    ext: string;
    link: string;
  }[];
};

export type LLMResultCenterContext = {
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
    suburb?: string | null;
    road?: string | null;
    highway?: string | null;
    landuse?: string | null;
    lanes?: number | null;
    maxspeed?: number | string | null;
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

export type LLMResultContextResponse = {
  meta: LLMResultContextMeta;
  timeline: LLMResultContextTimelineItem[];
  center_context?: LLMResultCenterContext | null;
};

export type LLMTestEval = {
  id?: string;
  collectionId: string;
  acq_id: string;
  sec: number;
  test1: number;
  test2: number;
  test3: number;
  test4: number;
  test5: number;
};

export type EvalMap = Record<string, LLMTestEval>;

const makeKey = (acq_id: string, sec: number) => `${acq_id}__${sec}`;

const TestHandler: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;
  const isAuthenticated = !!token;

  const [errorMsg, setErrorMsg] = useState("");
  const [globalLoading, setGlobalLoading] = useState(true);

  const [docsResp, setDocsResp] = useState<LLMResultDocsResponse | null>(
    null
  );
  const [docsLoading, setDocsLoading] = useState(false);

  const [page, setPage] = useState<number>(() => {
    const p = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const pageSize = 20;

  const [selectedDoc, setSelectedDoc] = useState<LLMResultDoc | null>(
    null
  );

  // contexto detalhado do /public/llmresult/context
  const [contextData, setContextData] =
    useState<LLMResultContextResponse | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(
    null
  );

  const [evalsByKey, setEvalsByKey] = useState<EvalMap>({});
  const [evalsLoading, setEvalsLoading] = useState(false);
  const [savingEval, setSavingEval] = useState(false);

  const [currentEval, setCurrentEval] = useState<{
    test1: number;
    test2: number;
    test3: number;
    test4: number;
    test5: number;
  } | null>(null);

  const testNameParam = searchParams.get("testName") ?? "";
  const llmModelParam = searchParams.get("llmModel") ?? "";
  const promptTypeParam = searchParams.get("promptType") ?? "";

  const effectiveTestName = docsResp?.testName ?? testNameParam;
  const effectiveLlmModel = docsResp?.llmModel ?? llmModelParam;
  const effectivePromptType =
    docsResp?.promptType ?? promptTypeParam;


  // 1) carrega docs do teste (LLMResult)
  useEffect(() => {
    if (!collectionId) {
      setErrorMsg("Collection id missing.");
      setGlobalLoading(false);
      return;
    }

    if (!testNameParam) {
      setErrorMsg("Missing testName in URL.");
      setGlobalLoading(false);
      return;
    }

    const loadDocs = async () => {
      try {
        setDocsLoading(true);
        setErrorMsg("");

        const params = new URLSearchParams({
          testName: testNameParam,
          promptType: promptTypeParam,
          llmModel: llmModelParam,
          page: String(page),
          pageSize: String(pageSize),
        });

        const url = `${API_BASE}/api/llm/test-docs/${collectionId}?${params.toString()}`;

        console.log("[TestHandler] fetching:", url);

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers,
        });

        let data: any;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error(
            "[TestHandler] error parsing JSON:",
            jsonErr
          );
          setErrorMsg("Error parsing response from server.");
          setDocsResp(null);
          setGlobalLoading(false);
          return;
        }

        console.log("[TestHandler] raw response body:", data);

        if (!res.ok) {
          setErrorMsg(
            (data && (data.error || data.message)) ||
              "Error loading LLM test docs."
          );
          setDocsResp(null);
          setGlobalLoading(false);
          return;
        }

        let items: any[] = [];
        let total = 0;
        let pageNum = page;
        let pageSizeNum = pageSize;
        let metaTestName: string | null = null;
        let metaModel: string | null = null;
        let metaPromptType: string | null = null;
        let metaPrompt: string | null = null;

        if (Array.isArray(data.items)) {
          items = data.items;
          total = Number(data.total ?? 0);
          pageNum = Number(data.page ?? page);
          pageSizeNum = Number(data.pageSize ?? pageSize);
          metaTestName =
            typeof data.testName === "string" ? data.testName : null;
          metaModel =
            typeof data.llmModel === "string" ? data.llmModel : null;
          metaPromptType =
            typeof data.promptType === "string"
              ? data.promptType
              : null;
          metaPrompt =
            typeof data.prompt === "string" ? data.prompt : null;
        } else if (Array.isArray(data)) {
          items = data;
          total = data.length;
          pageNum = 1;
          pageSizeNum = data.length;
        } else {
          setErrorMsg("Unexpected response format for docs.");
          setDocsResp(null);
          setGlobalLoading(false);
          return;
        }

        const mappedItems: LLMResultDoc[] = items.map((raw: any) => ({
          id: String(raw.id ?? raw._id ?? ""),
          acq_id: String(raw.acq_id ?? ""),
          sec: Number(raw.sec ?? 0),
          testName: String(raw.testName ?? raw.test_name ?? ""),
          llmModel: String(raw.llmModel ?? raw.llm_model ?? ""),
          promptType: String(raw.promptType ?? raw.prompt_type ?? ""),
          prompt:
            typeof raw.prompt === "string"
              ? raw.prompt
              : raw.prompt_text ?? null,
          response:
            typeof raw.response === "string"
              ? raw.response
              : raw.answer ?? null,
          promptTokens:
            raw.promptTokens ?? raw.prompt_tokens ?? null,
          completionTokens:
            raw.completionTokens ??
            raw.completion_tokens ??
            null,
          totalTokens: raw.totalTokens ?? raw.total_tokens ?? null,
          latencyMs: raw.latencyMs ?? null,
          createdAt: String(
            raw.createdAt ?? raw.created_at ?? new Date().toISOString()
          ),
        }));

        setDocsResp({
          items: mappedItems,
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          testName: metaTestName,
          llmModel: metaModel,
          promptType: metaPromptType,
          prompt: metaPrompt,
        });

        // auto-seleciona o primeiro doc
        if (!selectedDoc && mappedItems.length > 0) {
          setSelectedDoc(mappedItems[0]);
        }

        setGlobalLoading(false);
      } catch (err) {
        console.error("[TestHandler] fetch error:", err);
        setErrorMsg("Connection error while loading docs.");
        setDocsResp(null);
        setGlobalLoading(false);
      } finally {
        setDocsLoading(false);
      }
    };

    setGlobalLoading(true);
    loadDocs();
  }, [
    token,
    collectionId,
    testNameParam,
    llmModelParam,
    promptTypeParam,
    page,
    selectedDoc,
  ]);

  // 1b) carrega contexto detalhado para o doc selecionado
  useEffect(() => {
    if (!collectionId || !selectedDoc) {
      setContextData(null);
      setContextError(null);
      setContextLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadContext = async () => {
      try {
        setContextLoading(true);
        setContextError(null);

        const params = new URLSearchParams({
          collectionId,
          acq_id: selectedDoc.acq_id,
          sec: String(selectedDoc.sec),
          testName: selectedDoc.testName,
          llmModel: selectedDoc.llmModel,
          promptType: selectedDoc.promptType,
        });

        const url = `${API_BASE}/public/llmresult/context?${params.toString()}`;

        console.log("[TestHandler] fetching context:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = `Error ${res.status}`;
          try {
            const data = await res.json();
            msg =
              (data && (data.error || data.message)) ||
              msg;
          } catch {
            // ignore JSON parse errors
          }
          setContextError(msg);
          setContextData(null);
        } else {
          const data =
            (await res.json()) as LLMResultContextResponse;
          setContextData(data);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(
          "[TestHandler] error loading context:",
          err
        );
        setContextError("Error loading context.");
        setContextData(null);
      } finally {
        setContextLoading(false);
      }
    };

    loadContext();

    return () => {
      controller.abort();
    };
  }, [
    collectionId,
    selectedDoc?.acq_id,
    selectedDoc?.sec,
    selectedDoc?.testName,
    selectedDoc?.llmModel,
    selectedDoc?.promptType,
  ]);

  // 2) carrega avaliações se autenticado
  useEffect(() => {
    if (
      !isAuthenticated ||
      !collectionId ||
      !effectiveTestName ||
      !effectiveLlmModel ||
      !effectivePromptType
    ) {
      setEvalsByKey({});
      return;
    }

    const loadEvals = async () => {
      try {
        setEvalsLoading(true);
        const params = new URLSearchParams({
          collectionId,
          testName: effectiveTestName,
          llmModel: effectiveLlmModel,
          promptType: effectivePromptType,
        });

        const url = `${API_BASE}/api/llm/eval?${params.toString()}`;

        console.log("[TestHandler] fetching evals:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("[TestHandler] eval error:", data);
          setEvalsByKey({});
          return;
        }

        if (!Array.isArray(data.items)) {
          console.error(
            "[TestHandler] unexpected eval response:",
            data
          );
          setEvalsByKey({});
          return;
        }

        const map: EvalMap = {};
        for (const raw of data.items) {
          const acq_id = String(raw.acq_id ?? "");
          const sec = Number(raw.sec ?? 0);
          const key = makeKey(acq_id, sec);
          map[key] = {
            id: String(raw.id ?? raw._id ?? ""),
            collectionId: String(raw.collectionId ?? ""),
            acq_id,
            sec,
            test1: Number(raw.test1 ?? 0),
            test2: Number(raw.test2 ?? 0),
            test3: Number(raw.test3 ?? 0),
            test4: Number(raw.test4 ?? 0),
            test5: Number(raw.test5 ?? 0),
          };
        }

        setEvalsByKey(map);
      } catch (err) {
        console.error("[TestHandler] loadEvals error:", err);
        setEvalsByKey({});
      } finally {
        setEvalsLoading(false);
      }
    };

    loadEvals();
  }, [
    isAuthenticated,
    collectionId,
    effectiveTestName,
    effectiveLlmModel,
    effectivePromptType,
  ]);

  // 3) atualiza currentEval quando muda doc ou evals
  useEffect(() => {
    if (!isAuthenticated || !selectedDoc) {
      setCurrentEval(null);
      return;
    }

    const key = makeKey(selectedDoc.acq_id, selectedDoc.sec);
    const existing = evalsByKey[key];

    if (existing) {
      setCurrentEval({
        test1: existing.test1,
        test2: existing.test2,
        test3: existing.test3,
        test4: existing.test4,
        test5: existing.test5,
      });
    } else {
      setCurrentEval({
        test1: 0,
        test2: 0,
        test3: 0,
        test4: 0,
        test5: 0,
      });
    }
  }, [isAuthenticated, selectedDoc, evalsByKey]);

  const totalPages =
    docsResp && docsResp.pageSize > 0
      ? Math.ceil(docsResp.total / docsResp.pageSize)
      : 1;

  const handleChangePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(newPage));
      return p;
    });
  };

  const handlePrevNext = (direction: "prev" | "next") => {
    if (!docsResp || !selectedDoc) return;
    const idx = docsResp.items.findIndex(
      (d) => d.id === selectedDoc.id
    );
    if (idx === -1) return;

    let newIdx = idx;
    if (direction === "prev") {
      newIdx = idx > 0 ? idx - 1 : idx;
    } else {
      newIdx =
        idx < docsResp.items.length - 1 ? idx + 1 : idx;
    }

    const newDoc = docsResp.items[newIdx];
    setSelectedDoc(newDoc);
  };

  const handleSetScore = (testKey: keyof LLMTestEval, value: number) => {
    if (!selectedDoc) return;
    if (
      testKey !== "test1" &&
      testKey !== "test2" &&
      testKey !== "test3" &&
      testKey !== "test4" &&
      testKey !== "test5"
    ) {
      return;
    }

    setCurrentEval((prev) => {
      if (!prev) {
        return {
          test1: 0,
          test2: 0,
          test3: 0,
          test4: 0,
          test5: 0,
          [testKey]: value,
        };
      }
      return {
        ...prev,
        [testKey]: value,
      };
    });
  };

  const handleSaveEval = async () => {
    if (!selectedDoc || !currentEval || !collectionId) return;

    try {
      setSavingEval(true);

      const key = makeKey(selectedDoc.acq_id, selectedDoc.sec);
      const existing = evalsByKey[key];

      const body = {
        collectionId,
        acq_id: selectedDoc.acq_id,
        sec: selectedDoc.sec,
        test1: currentEval.test1,
        test2: currentEval.test2,
        test3: currentEval.test3,
        test4: currentEval.test4,
        test5: currentEval.test5,
        testName: selectedDoc.testName,
        llmModel: selectedDoc.llmModel,
        promptType: selectedDoc.promptType,
      };

      const url = existing
        ? `${API_BASE}/api/llm/eval/${existing.id}`
        : `${API_BASE}/api/llm/eval`;

      const method = existing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[TestHandler] saveEval error:", data);
        return;
      }

      const saved: LLMTestEval = {
        id: String(data.id ?? data._id ?? existing?.id ?? ""),
        collectionId,
        acq_id: selectedDoc.acq_id,
        sec: selectedDoc.sec,
        test1: currentEval.test1,
        test2: currentEval.test2,
        test3: currentEval.test3,
        test4: currentEval.test4,
        test5: currentEval.test5,
      };

      setEvalsByKey((prev) => ({
        ...prev,
        [key]: saved,
      }));
    } catch (err) {
      console.error("[TestHandler] handleSaveEval error:", err);
    } finally {
      setSavingEval(false);
    }
  };

  const getRowEvalStatus = (doc: LLMResultDoc) => {
    const key = makeKey(doc.acq_id, doc.sec);
    const e = evalsByKey[key];
    if (!e) return "none" as const;
    const sum =
      e.test1 + e.test2 + e.test3 + e.test4 + e.test5;
    if (sum === 0) return "none" as const;
    if (sum === 5 * 5) return "full" as const;
    return "partial" as const;
  };

  const handleBackToTests = () => {
    if (!collectionId) return;
    navigate(`/llmresult/${collectionId}`);
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-6xl py-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h1 className="text-3xl font-medium text-yellow-300">
              LLM Test Handler
            </h1>

            {isAuthenticated && (
              <button
                onClick={handleBackToTests}
                className="bg-zinc-800 hover:bg-zinc-700 text-gray-100 text-sm font-semibold py-2 px-4 rounded-lg"
              >
                Back to LLM Tests
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-900 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {globalLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src={loadgif}
                alt="Loading..."
                className="w-24 h-24 mb-3"
              />
              <p className="text-gray-200 text-sm">
                Loading documents...
              </p>
            </div>
          ) : !docsResp || docsResp.items.length === 0 ? (
            <p className="text-gray-300 text-sm">
              No documents for this test (or unable to load them).
            </p>
          ) : (
            <>
              {isAuthenticated ? (
                // ===================== MODO LOGADO =====================
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4">
                  {/* DETAIL PANEL - topo full width */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4 order-1 lg:order-1 lg:col-span-2">
                    <LLMTestDetailPanel
                      selectedDoc={selectedDoc}
                      onPrev={() => handlePrevNext("prev")}
                      onNext={() => handlePrevNext("next")}
                      showMetrics={false}
                      contextData={contextData}
                      contextLoading={contextLoading}
                      contextError={contextError}
                    />
                  </section>

                  {/* EVALUATION PANEL */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4 order-2 lg:order-3">
                    <LLMTestEvaluationPanel
                      selectedDoc={selectedDoc}
                      currentEval={currentEval}
                      evalsLoading={evalsLoading}
                      savingEval={savingEval}
                      onSetScore={handleSetScore}
                      onSave={handleSaveEval}
                    />
                  </section>

                  {/* DOCUMENTS PANEL */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4 order-3 lg:order-2">
                    <LLMTestDocumentsPanel
                      docsResp={docsResp}
                      docsLoading={docsLoading}
                      selectedDoc={selectedDoc}
                      onSelectDoc={setSelectedDoc}
                      page={page}
                      totalPages={totalPages}
                      onChangePage={handleChangePage}
                      isAuthenticated={true}
                      getRowEvalStatus={getRowEvalStatus}
                    />
                  </section>
                </div>
              ) : (
                // ===================== MODO PÚBLICO (SEM LOGIN) =====================
                <div className="flex flex-col gap-4">
                  {/* DETAIL EM CIMA (FULL) */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                    <LLMTestDetailPanel
                      selectedDoc={selectedDoc}
                      onPrev={() => handlePrevNext("prev")}
                      onNext={() => handlePrevNext("next")}
                      showMetrics={true}
                      contextData={contextData}
                      contextLoading={contextLoading}
                      contextError={contextError}
                    />
                  </section>

                  {/* DOCUMENTS EMBAIXO (FULL) */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                    <LLMTestDocumentsPanel
                      docsResp={docsResp}
                      docsLoading={docsLoading}
                      selectedDoc={selectedDoc}
                      onSelectDoc={setSelectedDoc}
                      page={page}
                      totalPages={totalPages}
                      onChangePage={handleChangePage}
                      isAuthenticated={false}
                    />
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TestHandler;
