// src/Components/TestHandler.tsx
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

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

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const TestHandler: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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

  const testNameParam = searchParams.get("testName") ?? "";
  const llmModelParam = searchParams.get("llmModel") ?? "";
  const promptTypeParam = searchParams.get("promptType") ?? "";

  // meta efetiva (mistura query + resposta da API)
  const effectiveTestName =
    docsResp?.testName ?? testNameParam;
  const effectiveLlmModel =
    docsResp?.llmModel ?? llmModelParam;
  const effectivePromptType =
    docsResp?.promptType ?? promptTypeParam;
  const effectivePrompt = docsResp?.prompt ?? null;

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

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

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

        console.log("[TestHandler] items array:", items);

        const metaTestName: string =
          data?.testName ??
          data?.test_name ??
          testNameParam;

        const metaLlmModel: string =
          data?.llmModel ??
          data?.llm_model ??
          llmModelParam;

        const metaPromptType: string =
          data?.promptType ??
          data?.prompt_type ??
          promptTypeParam;

        const metaPrompt: string | null =
          data?.prompt ??
          data?.prompt_text ??
          null;

        const mappedItems: LLMResultDoc[] = items.map((d: any) => ({
          id:
            d.id ??
            d._id ??
            `${d.acq_id}-${d.sec ?? d.center_sec ?? 0}`,
          acq_id: d.acq_id,
          sec: d.sec ?? d.center_sec ?? 0,
          testName:
            d.testName ??
            d.test_name ??
            metaTestName,
          llmModel:
            d.llmModel ??
            d.llm_model ??
            metaLlmModel,
          promptType:
            d.promptType ??
            d.prompt_type ??
            metaPromptType,
          prompt:
            d.prompt ??
            d.prompt_text ??
            metaPrompt,
          response: d.response ?? d.answer ?? null,
          promptTokens: d.promptTokens ?? d.prompt_tokens ?? null,
          completionTokens:
            d.completionTokens ??
            d.completion_tokens ??
            null,
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

        console.log("[TestHandler] mapped items:", mappedItems);

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
    navigate,
    collectionId,
    testNameParam,
    llmModelParam,
    promptTypeParam,
    page,
  ]);

  const totalPages =
    docsResp && docsResp.pageSize > 0
      ? Math.max(1, Math.ceil(docsResp.total / docsResp.pageSize))
      : 1;

  const handleBackToTests = () => {
    if (!collectionId) return;
    navigate(`/collections/${collectionId}/llm-tests`);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    // Mantém a página atual também na query string
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
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
            <button
              onClick={handleBackToTests}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-100 text-sm font-semibold py-1 px-3 rounded"
            >
              Back to tests
            </button>
          </div>

          {collectionId && (
            <p className="text-gray-300 mb-2 text-sm">
              <span className="font-semibold text-yellow-200">
                Collection ID:
              </span>{" "}
              {collectionId}
            </p>
          )}

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
            {effectivePrompt && (
              <p className="text-xs text-gray-400 mt-2">
                <span className="font-semibold text-yellow-200">
                  Prompt preview:
                </span>{" "}
                {effectivePrompt.length > 220
                  ? `${effectivePrompt.slice(0, 220)}…`
                  : effectivePrompt}
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-900 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {globalLoading ? (
            <p className="text-gray-200">Loading documents...</p>
          ) : !docsResp || docsResp.items.length === 0 ? (
            <p className="text-gray-300 text-sm">
              No documents for this test (or unable to load them).
            </p>
          ) : (
            <>
              <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                <h2 className="text-xl text-yellow-200 mb-2">
                  Documents ({docsResp.total})
                </h2>

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
                        <th className="px-2 py-1 text-left text-gray-200">
                          latency (ms)
                        </th>
                        <th className="px-2 py-1 text-left text-gray-200">
                          tokens
                        </th>
                        <th className="px-2 py-1 text-left text-gray-200">
                          created at
                        </th>
                        <th className="px-2 py-1 text-right text-gray-200">
                          actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {docsResp.items.map((d) => (
                        <tr
                          key={d.id}
                          className="border-t border-zinc-800 hover:bg-zinc-800/60"
                        >
                          <td className="px-2 py-1 text-gray-100">
                            {d.acq_id}
                          </td>
                          <td className="px-2 py-1 text-gray-100">
                            {d.sec}
                          </td>
                          <td className="px-2 py-1 text-gray-100">
                            {d.latencyMs != null ? d.latencyMs : "-"}
                          </td>
                          <td className="px-2 py-1 text-gray-100">
                            {d.totalTokens != null ? d.totalTokens : "-"}
                          </td>
                          <td className="px-2 py-1 text-gray-400">
                            {formatDateTime(d.createdAt)}
                          </td>
                          <td className="px-2 py-1 text-right">
                            <button
                              onClick={() => setSelectedDoc(d)}
                              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-0.5 px-2 rounded"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                    <span>
                      Page {page} of {totalPages} — {docsResp.total} docs
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() =>
                          handleChangePage(Math.max(1, page - 1))
                        }
                        className={`py-1 px-2 rounded border border-zinc-700 ${
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
                          handleChangePage(
                            Math.min(totalPages, page + 1)
                          )
                        }
                        className={`py-1 px-2 rounded border border-zinc-700 ${
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
              </section>

              {selectedDoc && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
                      <div>
                        <p className="text-sm text-yellow-100 font-semibold">
                          LLM Result Detail
                        </p>
                        <p className="text-[11px] text-gray-400">
                          acq_id: {selectedDoc.acq_id} — sec:{" "}
                          {selectedDoc.sec} — {selectedDoc.llmModel}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="text-gray-300 hover:text-white text-sm font-semibold"
                      >
                        Close
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Prompt (raw)
                        </p>
                        <div className="bg-zinc-800 border border-zinc-700 rounded p-2 whitespace-pre-wrap text-gray-100 text-xs">
                          {selectedDoc.prompt || "(no prompt saved)"}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Response
                        </p>
                        <div className="bg-zinc-800 border border-zinc-700 rounded p-2 whitespace-pre-wrap text-gray-100 text-xs">
                          {selectedDoc.response || "(no response saved)"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-gray-300">
                        <div>
                          <span className="font-semibold text-yellow-200">
                            latency:
                          </span>{" "}
                          {selectedDoc.latencyMs != null
                            ? `${selectedDoc.latencyMs} ms`
                            : "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-yellow-200">
                            prompt tokens:
                          </span>{" "}
                          {selectedDoc.promptTokens ?? "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-yellow-200">
                            completion tokens:
                          </span>{" "}
                          {selectedDoc.completionTokens ?? "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-yellow-200">
                            total tokens:
                          </span>{" "}
                          {selectedDoc.totalTokens ?? "-"}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-yellow-200">
                            created at:
                          </span>{" "}
                          {formatDateTime(selectedDoc.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
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
