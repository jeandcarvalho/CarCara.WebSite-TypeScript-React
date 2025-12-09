// src/Components/Evaluation/TestHandler.tsx
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

const API_BASE = "https://carcara-web-api.onrender.com";

type LLMResultDoc = {
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

type LLMTestEval = {
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

type EvalMap = Record<string, LLMTestEval>;

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

  const [detailPrompt, setDetailPrompt] = useState<string | null>(
    null
  );

    // BOTÃO BACK TO MY ACCOUNT: ir direto pra /account com estilo do Back to View
  const goBackToAccount = () => {
    navigate("/account");
  };

  const testNameParam = searchParams.get("testName") ?? "";
  const llmModelParam = searchParams.get("llmModel") ?? "";
  const promptTypeParam = searchParams.get("promptType") ?? "";

  const effectiveTestName = docsResp?.testName ?? testNameParam;
  const effectiveLlmModel = docsResp?.llmModel ?? llmModelParam;
  const effectivePromptType =
    docsResp?.promptType ?? promptTypeParam;
  const effectivePrompt = docsResp?.prompt ?? null;

  const promptForPreview =
    detailPrompt || effectivePrompt || selectedDoc?.prompt || null;

  // 1) carrega docs do teste
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

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });

        const data = await res.json().catch(() => null);

        console.log("[TestHandler] raw response status:", res.status);
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

        if (data && Array.isArray(data.items)) {
          items = data.items;
          total = data.total ?? items.length;
          pageNum = data.page ?? page;
          pageSizeNum = data.pageSize ?? pageSize;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
          total = items.length;
          pageNum = 1;
          pageSizeNum = items.length || 1;
        } else if (Array.isArray(data)) {
          items = data;
          total = items.length;
          pageNum = 1;
          pageSizeNum = items.length || 1;
        } else {
          console.warn("[TestHandler] unexpected shape:", data);
          setDocsResp(null);
          setGlobalLoading(false);
          return;
        }

        const metaTestName: string =
          data?.testName ?? data?.test_name ?? testNameParam;

        const metaLlmModel: string =
          data?.llmModel ?? data?.llm_model ?? llmModelParam;

        const metaPromptType: string =
          data?.promptType ?? data?.prompt_type ?? promptTypeParam;

        const metaPrompt: string | null =
          data?.prompt ?? data?.prompt_text ?? null;

        let mappedItems: LLMResultDoc[] = items.map((d: any) => ({
          id:
            d.id ??
            d._id ??
            `${d.acq_id}-${d.sec ?? d.center_sec ?? 0}`,
          acq_id: d.acq_id,
          sec: d.sec ?? d.center_sec ?? 0,
          testName: d.testName ?? d.test_name ?? metaTestName,
          llmModel: d.llmModel ?? d.llm_model ?? metaLlmModel,
          promptType:
            d.promptType ?? d.prompt_type ?? metaPromptType,
          prompt: d.prompt ?? d.prompt_text ?? metaPrompt,
          response: d.response ?? d.answer ?? null,
          promptTokens: d.promptTokens ?? d.prompt_tokens ?? null,
          completionTokens:
            d.completionTokens ?? d.completion_tokens ?? null,
          totalTokens: d.totalTokens ?? d.total_tokens ?? null,
          latencyMs:
            d.latencyMs ??
            (d.response_time_s != null
              ? Math.round(d.response_time_s * 1000)
              : null),
          createdAt:
            typeof d.createdAt === "string"
              ? d.createdAt
              : d.createdAt
              ? new Date(d.createdAt).toISOString()
              : new Date().toISOString(),
        }));

        mappedItems = mappedItems.sort((a, b) => {
          const acqCmp = a.acq_id.localeCompare(b.acq_id);
          if (acqCmp !== 0) return acqCmp;
          return a.sec - b.sec;
        });

        setDocsResp({
          items: mappedItems,
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          testName: metaTestName,
          llmModel: metaLlmModel,
          promptType: metaPromptType,
          prompt: metaPrompt,
        });

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);
        console.log("[TestHandler] evals raw:", data);

        if (!res.ok) {
          console.warn(
            "[TestHandler] error loading evals:",
            data?.error || data
          );
          return;
        }

        let items: any[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.items)) {
          items = data.items;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        }

        const mapped: EvalMap = {};
        items.forEach((e: any) => {
          if (!e.acq_id || e.sec == null) return;
          const key = makeKey(String(e.acq_id), Number(e.sec));
          mapped[key] = {
            id: e.id ?? e._id,
            collectionId: String(e.collectionId ?? collectionId),
            acq_id: String(e.acq_id),
            sec: Number(e.sec),
            test1: Number(e.test1 ?? 0),
            test2: Number(e.test2 ?? 0),
            test3: Number(e.test3 ?? 0),
            test4: Number(e.test4 ?? 0),
            test5: Number(e.test5 ?? 0),
          };
        });

        setEvalsByKey(mapped);
      } catch (err) {
        console.error("[TestHandler] error loading evals:", err);
      } finally {
        setEvalsLoading(false);
      }
    };

    loadEvals();
  }, [
    isAuthenticated,
    token,
    collectionId,
    effectiveTestName,
    effectiveLlmModel,
    effectivePromptType,
  ]);

  // 3) currentEval sempre acompanha selectedDoc + evalsByKey
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



  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
  };

  const getRowEvalStatus = (doc: LLMResultDoc) => {
    if (!isAuthenticated) return "none";
    const key = makeKey(doc.acq_id, doc.sec);
    const ev = evalsByKey[key];
    if (!ev) return "none";
    const vals = [ev.test1, ev.test2, ev.test3, ev.test4, ev.test5];
    const positiveCount = vals.filter((v) => v > 0).length;
    if (positiveCount === 0) return "none";
    if (positiveCount === vals.length) return "full";
    return "partial";
  };

  const rowStatusClass = (status: string) => {
    if (status === "partial") {
      return "bg-yellow-900/40";
    }
    if (status === "full") {
      return "bg-emerald-900/30";
    }
    return "";
  };

  const rowStatusLabel = (status: string) => {
    if (status === "partial") return "Partial";
    if (status === "full") return "Done";
    return "—";
  };

  const handleSetScore = (
    field: keyof NonNullable<typeof currentEval>,
    value: number
  ) => {
    if (!isAuthenticated || !currentEval) return;
    const clamped = Math.max(1, Math.min(5, value));
    setCurrentEval((prev) => {
      if (!prev) return prev;
      const currentVal = prev[field] as number;
      const newVal = currentVal === clamped ? 0 : clamped;
      return {
        ...prev,
        [field]: newVal,
      };
    });
  };

  const handleSaveEval = async () => {
    if (
      !isAuthenticated ||
      !token ||
      !collectionId ||
      !selectedDoc ||
      !currentEval ||
      !effectiveTestName ||
      !effectiveLlmModel ||
      !effectivePromptType
    ) {
      return;
    }

    try {
      setSavingEval(true);
      setErrorMsg("");

      const body = {
        collectionId,
        acq_id: selectedDoc.acq_id,
        sec: selectedDoc.sec,
        testName: effectiveTestName,
        llmModel: effectiveLlmModel,
        promptType: effectivePromptType,
        test1: currentEval.test1,
        test2: currentEval.test2,
        test3: currentEval.test3,
        test4: currentEval.test4,
        test5: currentEval.test5,
      };

      const res = await fetch(`${API_BASE}/api/llm/eval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      console.log("[TestHandler] save eval result:", data);

      if (!res.ok) {
        setErrorMsg(
          data?.error ||
            data?.message ||
            "Error saving evaluation."
        );
        return;
      }

      const key = makeKey(selectedDoc.acq_id, selectedDoc.sec);
      setEvalsByKey((prev) => ({
        ...prev,
        [key]: {
          id: data?.id ?? data?._id ?? prev[key]?.id,
          collectionId,
          acq_id: selectedDoc.acq_id,
          sec: selectedDoc.sec,
          test1: currentEval.test1,
          test2: currentEval.test2,
          test3: currentEval.test3,
          test4: currentEval.test4,
          test5: currentEval.test5,
        },
      }));
    } catch (err) {
      console.error("[TestHandler] error saving eval:", err);
      setErrorMsg("Connection error while saving evaluation.");
    } finally {
      setSavingEval(false);
    }
  };

  const handlePrevNext = (direction: "prev" | "next") => {
    if (!docsResp || !selectedDoc) return;
    const items = docsResp.items;
    const idx = items.findIndex(
      (d) =>
        d.id === selectedDoc.id ||
        (d.acq_id === selectedDoc.acq_id && d.sec === selectedDoc.sec)
    );
    if (idx === -1) return;
    const newIdx = direction === "prev" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    setSelectedDoc(items[newIdx]);
  };

  const totalPagesLabel =
    docsResp && docsResp.pageSize > 0
      ? Math.max(1, Math.ceil(docsResp.total / docsResp.pageSize))
      : 1;

  const isBusy =
    globalLoading || docsLoading || evalsLoading || savingEval;

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-6xl py-4">
          {isBusy && (
            <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/70">
              <img
                src={loadgif}
                alt="Loading..."
                className="w-24 h-24 mb-3"
              />
              <p className="text-gray-200 text-sm">Loading...</p>
            </div>
          )}
          <div className="flex items-center justify-between mb-4 gap-2">
            <h1 className="text-3xl font-medium text-yellow-300">
              LLM Test Handler
            </h1>

            {isAuthenticated && (
          <button
            type="button"
            onClick={goBackToAccount}
            className="inline-flex items-center text-[11px] sm:text-xs px-2 py-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-gray-200 mb-3"
          >
            ← Back to My Account
          </button>
            )}
          </div>


          <div className="mb-3 text-sm text-gray-300">
            <p>
              <span className="font-semibold text-yellow-100">
                Test:
              </span>{" "}
              {effectiveTestName || "(unknown)"}
            </p>
            <p>
              <span className="font-semibold text-yellow-100">
                Model:
              </span>{" "}
              {effectiveLlmModel || "(unknown)"}
            </p>
            <p>
              <span className="font-semibold text-yellow-100">
                Prompt type:
              </span>{" "}
              {effectivePromptType || "(unknown)"}
            </p>

          </div>

          {errorMsg && (
            <div className="bg-red-900 text-red-100 p-2 rounded mb-4 text-sm">
              {errorMsg}
            </div>
          )}

          {!docsResp || docsResp.items.length === 0 ? (
            <p className="text-gray-300 text-sm">
              No documents for this test (or unable to load them).
            </p>
          ) : (
            <>
              {/* PROMPT RAW NO TOPO */}
              <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-4">
                <h2 className="text-xl text-yellow-200 mb-3">
                  Tested prompt
                </h2>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 whitespace-pre-wrap text-gray-100 text-[12px] max-h-60 overflow-y-auto">
                  {promptForPreview || "(no prompt saved)"}
                </div>
              </section>

              {isAuthenticated ? (
                // LOGADO
                <>
                {/* LOGGED IN: Documents + Evaluation first, then Detail */}
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 mb-4">
                  {/* DOCUMENTS */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
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

                    <div className="overflow-x-auto max-h-[40vh] overflow-y-auto border border-zinc-800 rounded">
                      <table className="min-w-full text-xs">
                        <thead className="bg-zinc-800">
                          <tr>
                            <th className="px-2 py-1 text-left text-gray-200">
                              acq_id
                            </th>
                            <th className="px-2 py-1 text-left text-gray-200">
                              sec
                            </th>
                            <th className="px-2 py-1 text-left text-gray-200">
                              status
                            </th>
                            <th className="px-2 py-1 text-right text-gray-200">
                              actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {docsResp.items.map((d) => {
                            const status = getRowEvalStatus(d);
                            const isSelected =
                              selectedDoc &&
                              selectedDoc.acq_id === d.acq_id &&
                              selectedDoc.sec === d.sec;
                            return (
                              <tr
                                key={d.id}
                                className={`border-t border-zinc-800 hover:bg-zinc-800/60 cursor-pointer ${rowStatusClass(
                                  status
                                )} ${
                                  isSelected
                                    ? "bg-gray-700/70 border-l-4 border-yellow-400"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSelectedDoc(d);
                                  // limpa prompt anterior para forçar update com novo contexto
                                  setDetailPrompt(null);
                                }}
                              >
                                <td className="px-2 py-1 text-gray-100">
                                  {d.acq_id}
                                </td>
                                <td className="px-2 py-1 text-gray-100">
                                  {d.sec}
                                </td>
                                <td className="px-2 py-1 text-gray-100">
                                  {rowStatusLabel(status)}
                                </td>
                                <td className="px-2 py-1 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDoc(d);
                                      setDetailPrompt(null);
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-md text-[11px]"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPagesLabel > 1 && (
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-300">
                        <span>
                          Page {page} of {totalPagesLabel} —{" "}
                          {docsResp.total} docs
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={page <= 1}
                            onClick={() =>
                              handleChangePage(Math.max(1, page - 1))
                            }
                            className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                              page <= 1
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-gray-100 hover:bg-zinc-800"
                            }`}
                          >
                            Prev
                          </button>
                          <button
                            disabled={page >= totalPagesLabel}
                            onClick={() =>
                              handleChangePage(
                                Math.min(totalPagesLabel, page + 1)
                              )
                            }
                            className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                              page >= totalPagesLabel
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-gray-100 hover:bg-zinc-800"
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* EVALUATION */}
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                    <h2 className="text-xl text-yellow-200 mb-3">
                      Evaluation
                    </h2>

                    {!selectedDoc ? (
                      <p className="text-sm text-gray-300">
                        Select a document to rate.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-300 mb-2">
                          Give scores (1 to 5) for this second.{" "}
                          <span className="text-gray-400">
                            Click again on the same value to clear.
                          </span>
                        </p>

                        {currentEval && (
                          <div className="space-y-3 text-[12px] text-gray-200 mb-4">
                            {(
                              [
                                "test1",
                                "test2",
                                "test3",
                                "test4",
                                "test5",
                              ] as const
                            ).map((field, idx) => (
                              <div key={field}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-yellow-200">
                                    Test {idx + 1}
                                  </span>
                                  <span className="text-gray-400">
                                    current:{" "}
                                    {currentEval[
                                      field as keyof typeof currentEval
                                    ] === 0
                                      ? "-"
                                      : currentEval[
                                          field as keyof typeof currentEval
                                        ]}
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() =>
                                        handleSetScore(field, val)
                                      }
                                      className={`py-1.5 px-3 rounded-lg border text-sm ${
                                        currentEval[
                                          field as keyof typeof currentEval
                                        ] === val
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
                          onClick={handleSaveEval}
                          disabled={savingEval || !currentEval}
                          className={`w-full py-2 rounded-lg font-semibold text-sm ${
                            savingEval
                              ? "bg-yellow-700 text-black cursor-wait"
                              : "bg-yellow-500 hover:bg-yellow-400 text-black"
                          }`}
                        >
                          {savingEval
                            ? "Saving evaluation..."
                            : "Save evaluation"}
                        </button>

                        {evalsLoading && (
                          <p className="text-[11px] text-gray-400 mt-2">
                            Loading evaluations...
                          </p>
                        )}
                      </>
                    )}
                  </section>
                </div>

                {/* DETAIL */}
                <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl text-yellow-200">
                      Test data
                    </h2>

                    <div className="flex gap-3 text-sm">
                      <button
                        onClick={() => handlePrevNext("prev")}
                        className="py-2 px-4 rounded-lg border border-zinc-700 text-gray-100 hover:bg-zinc-800 font-medium"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => handlePrevNext("next")}
                        className="py-2 px-4 rounded-lg border border-zinc-700 text-gray-100 hover:bg-zinc-800 font-medium"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <LLMTestDetailPanel
                    selectedDoc={selectedDoc}
                    collectionId={collectionId}
                    testName={effectiveTestName}
                    llmModel={effectiveLlmModel}
                    promptType={effectivePromptType}
                    onPromptChange={setDetailPrompt}
                  />
                </section>
              </>
              ) : (
                // PÚBLICO
                <div className="flex flex-col gap-4">
                  <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
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

                    <div className="overflow-x-auto max-h-[30vh] overflow-y-auto border border-zinc-800 rounded">
                      <table className="min-w-full text-xs">
                        <thead className="bg-zinc-800">
                          <tr>
                            <th className="px-2 py-1 text-left text-gray-200">
                              acq_id
                            </th>
                            <th className="px-2 py-1 text-left text-gray-200">
                              sec
                            </th>
                            <th className="px-2 py-1 text-right text-gray-200">
                              actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {docsResp.items.map((d) => {
                            const isSelected =
                              selectedDoc &&
                              selectedDoc.acq_id === d.acq_id &&
                              selectedDoc.sec === d.sec;
                            return (
                              <tr
                                key={d.id}
                                className={`border-t border-zinc-800 hover:bg-zinc-800/60 cursor-pointer ${
                                  isSelected
                                    ? "bg-yellow-900/70 border-l-4 border-yellow-400"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSelectedDoc(d);
                                  setDetailPrompt(null);
                                }}
                              >
                                <td className="px-2 py-1 text-gray-100">
                                  {d.acq_id}
                                </td>
                                <td className="px-2 py-1 text-gray-100">
                                  {d.sec}
                                </td>

                                <td className="px-2 py-1 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDoc(d);
                                      setDetailPrompt(null);
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-md text-[11px]"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPagesLabel > 1 && (
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-300">
                        <span>
                          Page {page} of {totalPagesLabel} —{" "}
                          {docsResp.total} docs
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={page <= 1}
                            onClick={() =>
                              handleChangePage(Math.max(1, page - 1))
                            }
                            className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                              page <= 1
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-gray-100 hover:bg-zinc-800"
                            }`}
                          >
                            Prev
                          </button>
                          <button
                            disabled={page >= totalPagesLabel}
                            onClick={() =>
                              handleChangePage(
                                Math.min(totalPagesLabel, page + 1)
                              )
                            }
                            className={`py-1.5 px-3 rounded-lg border border-zinc-700 ${
                              page >= totalPagesLabel
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-gray-100 hover:bg-zinc-800"
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

<section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl text-yellow-200">
                        Detail
                      </h2>

                      <div className="flex gap-3 text-sm">
                        <button
                          onClick={() => handlePrevNext("prev")}
                          className="py-2 px-4 rounded-lg border border-zinc-700 text-gray-100 hover:bg-zinc-800 font-medium"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => handlePrevNext("next")}
                          className="py-2 px-4 rounded-lg border border-zinc-700 text-gray-100 hover:bg-zinc-800 font-medium"
                        >
                          Next →
                        </button>
                      </div>
                    </div>

                    <LLMTestDetailPanel
                      selectedDoc={selectedDoc}
                      collectionId={collectionId}
                      testName={effectiveTestName}
                      llmModel={effectiveLlmModel}
                      promptType={effectivePromptType}
                      onPromptChange={setDetailPrompt}
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
