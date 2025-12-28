// src/Components/CollectionLLMTests.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const API_BASE = "https://carcara-web-api.onrender.com";

type LLMTestSummary = {
  testName: string;
  llmModel: string;
  promptType: string;
  docsCount: number;
  firstCreatedAt?: string | null;
  lastCreatedAt?: string | null;
  avgLatencyMs?: number | null;
  avgTotalTokens?: number | null;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const CollectionLLMTests: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = useMemo(() => !!token, [token]);

  const [tests, setTests] = useState<LLMTestSummary[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    if (!collectionId) {
      setErrorMsg("Collection id missing.");
      setGlobalLoading(false);
      return;
    }

    const fetchTests = async () => {
      try {
        setTestsLoading(true);
        setErrorMsg("");

        const url = `${API_BASE}/api/llm/tests/${collectionId}`;
        console.log("[LLM TESTS] fetching:", url);

        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`; // <- só manda se tiver

        const res = await fetch(url, { headers });
        const data = await res.json().catch(() => null);

        console.log("[LLM TESTS] raw response status:", res.status);
        console.log("[LLM TESTS] raw response body:", data);

        if (!res.ok) {
          // Se o backend ainda exigir auth, aqui vai cair 401 no modo público
          // e você mostra uma mensagem amigável.
          const msg =
            (data && (data.error || data.message)) ||
            (res.status === 401
              ? "This page is public, but this endpoint requires authentication."
              : "Error loading LLM tests.");
          setErrorMsg(msg);
          setTests([]);
          return;
        }

        let rawTests: any[] = [];
        if (Array.isArray(data)) rawTests = data;
        else if (data && Array.isArray(data.data)) rawTests = data.data;
        else if (data && Array.isArray(data.tests)) rawTests = data.tests;

        const mapped: LLMTestSummary[] = rawTests.map((t: any) => ({
          testName: t.testName ?? t.test_name ?? "",
          llmModel: t.llmModel ?? t.llm_model ?? "",
          promptType: t.promptType ?? t.prompt_type ?? "",
          docsCount:
            t.docsCount ??
            t.totalDocs ??
            t._count?._all ??
            t._count ??
            0,
          firstCreatedAt:
            t.firstCreatedAt ?? t.createdAt ?? t._min?.createdAt ?? null,
          lastCreatedAt: t.lastCreatedAt ?? t._max?.createdAt ?? null,
          avgLatencyMs:
            t.avgLatencyMs ??
            (t._avg?.response_time_s != null
              ? Math.round(t._avg.response_time_s * 1000)
              : null),
          avgTotalTokens:
            t.avgTotalTokens ??
            (t._avg?.total_tokens != null
              ? Math.round(t._avg.total_tokens)
              : null),
        }));

        setTests(mapped);
      } catch (err) {
        console.error("[LLM TESTS] fetch error:", err);
        setErrorMsg("Connection error while loading LLM tests.");
        setTests([]);
      } finally {
        setTestsLoading(false);
        setGlobalLoading(false);
      }
    };

    setGlobalLoading(true);
    fetchTests();
  }, [token, collectionId]);

  const handleBackToCollection = () => {
    if (!collectionId) return;
    navigate(`/collections/${collectionId}`);
  };

  const handleViewDocs = (t: LLMTestSummary) => {
    if (!collectionId) return;

    const params = new URLSearchParams({
      testName: t.testName,
      llmModel: t.llmModel,
      promptType: t.promptType,
    });

    const url = `/collections/${collectionId}/llm-tests/handler?${params.toString()}`;
    console.log("[UI] navigating to TestHandler:", url);
    navigate(url);
  };

  const handleDeleteTest = async (t: LLMTestSummary) => {
    if (!collectionId) return;
    if (!token) {
      setErrorMsg("You must be logged in to delete tests.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to DELETE ALL RESULTS for this test?\n\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setErrorMsg("");

      const params = new URLSearchParams({
        testName: t.testName,
        promptType: t.promptType,
        llmModel: t.llmModel,
      });

      const url = `${API_BASE}/api/llm/tests/${collectionId}?${params.toString()}`;
      console.log("[LLM DELETE] calling:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // pode ser 204 sem body
      }

      console.log("[LLM DELETE] response:", res.status, data);

      if (!res.ok && res.status !== 204) {
        setErrorMsg(
          (data && (data.error || data.message)) || "Error deleting LLM test."
        );
        return;
      }

      setTests((prev) =>
        prev.filter(
          (x) =>
            !(
              x.testName === t.testName &&
              x.promptType === t.promptType &&
              x.llmModel === t.llmModel
            )
        )
      );

      alert("Test deleted successfully.");
    } catch (err) {
      console.error("[LLM DELETE] fetch error:", err);
      setErrorMsg("Connection error while deleting LLM test.");
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-6xl py-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h1 className="text-3xl font-medium text-yellow-300">
              LLM Tests for Collection
            </h1>
            <button
              onClick={handleBackToCollection}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-100 text-sm font-semibold py-1 px-3 rounded"
            >
              Back to collection
            </button>
          </div>

          {collectionId && (
            <p className="text-gray-300 mb-4 text-sm">
              <span className="font-semibold text-yellow-200">Collection ID:</span>{" "}
              {collectionId}
            </p>
          )}


          {errorMsg && (
            <div className="bg-red-900 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {globalLoading ? (
            <p className="text-gray-200">Loading.</p>
          ) : (
            <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
              <h2 className="text-xl text-yellow-200 mb-2">LLM Test Runs</h2>
              <p className="text-gray-400 text-sm mb-3">
                Each row represents one LLM test configuration (testName + model + promptType)
                and aggregates all documents evaluated with that setup.
              </p>

              {testsLoading ? (
                <p className="text-gray-300">Loading tests...</p>
              ) : tests.length === 0 ? (
                <p className="text-gray-300">
                  No LLM tests found for this collection yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {tests.map((t) => (
                    <div
                      key={`${t.testName}-${t.promptType}-${t.llmModel}`}
                      className="border border-zinc-800 bg-zinc-900 rounded p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-yellow-100 font-semibold">{t.testName}</p>
                          <p className="text-xs text-gray-300 mt-1">
                            <span className="font-semibold">Model:</span> {t.llmModel}
                          </p>
                          <p className="text-xs text-gray-300">
                            <span className="font-semibold">Prompt type:</span> {t.promptType}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <span className="font-semibold">Docs evaluated:</span> {t.docsCount}
                          </p>

                          {(t.avgLatencyMs != null || t.avgTotalTokens != null) && (
                            <p className="text-xs text-gray-400">
                              {t.avgLatencyMs != null && (
                                <>
                                  <span className="font-semibold">avg latency:</span>{" "}
                                  {t.avgLatencyMs} ms{" "}
                                </>
                              )}
                              {t.avgTotalTokens != null && (
                                <>
                                  <span className="font-semibold">avg tokens:</span>{" "}
                                  {t.avgTotalTokens}
                                </>
                              )}
                            </p>
                          )}

                          {(t.firstCreatedAt || t.lastCreatedAt) && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              {t.firstCreatedAt && (
                                <>
                                  <span className="font-semibold">first:</span>{" "}
                                  {formatDateTime(t.firstCreatedAt)}{" "}
                                </>
                              )}
                              {t.lastCreatedAt && (
                                <>
                                  <span className="font-semibold">last:</span>{" "}
                                  {formatDateTime(t.lastCreatedAt)}
                                </>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => handleViewDocs(t)}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs py-1 px-3 rounded"
                          >
                            View docs
                          </button>

                          {/* Só aparece logado */}
                          {isLoggedIn && (
                            <button
                              onClick={() => handleDeleteTest(t)}
                              className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-1 px-3 rounded"
                            >
                              Delete test
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CollectionLLMTests;
