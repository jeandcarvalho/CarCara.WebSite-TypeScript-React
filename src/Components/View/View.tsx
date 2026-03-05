// src/Components/View.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import loadgif from "../img/gif.gif";
import {useNavigate } from "react-router-dom";
import Breadcrumbs from "../Breadcrumbs"; // ajuste o path se necessário
import AcqPanel from "./AcqPanel";

import {
  Counts,
  Group,
  PANELS_PER_PAGE,
  coerceResponse,
  buildSearchUrlFlexible,
  parseFilterTags,
} from "./viewHelpers";

/* ===================== Main Component ===================== */

const View: React.FC = () => {
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "auto" });
}, []);
  const navigate = useNavigate();
  

  // guarda a página do painel vinda da URL (pra não “resetar” ao buscar)
  const initialPanelPageRef = useRef<number>(1);

  const [counts, setCounts] = useState<Counts>({
    matched_acq_ids: 0,
    matched_seconds: 0,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // paginação de painéis (front)
  const [panelPage, setPanelPage] = useState(1);

  // paginação da API
  const [apiPage, setApiPage] = useState(1);
  const [apiHasMore, setApiHasMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);

  const filterTags = useMemo(
    () => parseFilterTags(currentQuery),
    [currentQuery],
  );



  const replaceViewHashPage = (page: number) => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const base = hash.startsWith("#/View")
      ? "#/View"
      : hash.startsWith("#/view")
      ? "#/view"
      : "#/View";

    const qIndex = hash.indexOf("?");
    const existingQs = qIndex >= 0 ? hash.slice(qIndex + 1) : "";
    const sp = new URLSearchParams(existingQs);

    // paginação do UI (painéis)
    sp.set("page", String(Math.max(1, page || 1)));

    const nextHash = `${base}?${sp.toString()}`;
    // não cria history entry (recarregar mantém page=)
    window.history.replaceState(null, "", nextHash);
  };

  const handleOpenAcquisition = (acqId: string) => {
    // Keep filters AND the current UI page in the URL so refresh + breadcrumbs work.
    // Example: /acquisition/<id>?page=2&b.condition=Overcast&...
    let raw = "";
    if (currentQuery) {
      const q = currentQuery.trim();
      if (q.startsWith("?")) {
        raw = q;
      } else if (q.startsWith("http")) {
        try {
          const u = new URL(q);
          raw =
            u.search || (u.hash.includes("?") ? "?" + u.hash.split("?")[1] : "");
        } catch {
          raw = "";
        }
      } else if (q.includes("=")) {
        raw = "?" + q;
      }
    }

    const sp = new URLSearchParams(raw.startsWith("?") ? raw.slice(1) : raw);
    // Remove API-level per_page if it exists, keep only UI page.
    sp.delete("per_page");
    sp.set("page", String(Math.max(1, panelPage || 1)));
    const suffix = sp.toString() ? `?${sp.toString()}` : "";

    navigate(`/acquisition/${acqId}${suffix}`);
  };

  // total de páginas baseado no TOTAL de acquisições (global)
  const totalPanelPages = useMemo(() => {
    const totalAcqs = counts.matched_acq_ids ?? 0;
    if (!totalAcqs) return 1;
    return Math.max(1, Math.ceil(totalAcqs / PANELS_PER_PAGE));
  }, [counts.matched_acq_ids]);

  // páginas que já estão efetivamente carregadas na memória
  const loadedPanelPages = useMemo(
    () => (groups.length === 0 ? 1 : Math.ceil(groups.length / PANELS_PER_PAGE)),
    [groups.length],
  );

  const canGoPrevPanel = panelPage > 1;
  const canGoNextLoaded = panelPage < loadedPanelPages;
  const hasMoreOverall = panelPage < totalPanelPages;

  // scroll pro topo sempre que trocar de página de painel
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [panelPage]);

  // Busca uma página da API (append ou reset)
  const fetchPageFromApi = async (
    input: string,
    page: number,
    append: boolean,
  ) => {
    setIsLoading(true);
    try {
      const url = buildSearchUrlFlexible(input, page, 100);
      const resp = await fetch(url);
      const json = await resp.json();
      const { counts: cts, images, page_info } = coerceResponse(json);

      setCounts(cts);
      setApiHasMore(!!page_info.has_more);
      setApiPage(page);

      setGroups((prev) => {
        const map = new Map<string, Group>();

        // Quando append=false, esta chamada deve "resetar" o resultado
        // (senão mistura resultados de queries diferentes e o linter reclama).
        const base = append ? prev : [];

        // primeiro, tudo que já existia (se append)
        for (const g of base) {
          map.set(g.acq_id, { acq_id: g.acq_id, photos: [...g.photos] });
        }
        // depois, as novas imagens na ordem que vieram da API
        for (const img of images) {
          const key = img.acq_id;
          if (!map.has(key)) {
            map.set(key, { acq_id: key, photos: [] });
          }
          map.get(key)!.photos.push(img);
        }

        // sort por timeline (mais novo → mais velho)
        const sorted = Array.from(map.values()).sort((a, b) => {
          const na = Number(a.acq_id.replace(/\D/g, "")) || 0;
          const nb = Number(b.acq_id.replace(/\D/g, "")) || 0;
          return nb - na;
        });

        return sorted;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicia uma nova busca (reset)
  const startNewSearch = (input: string) => {
    setCurrentQuery(input);
    setPanelPage(Math.max(1, initialPanelPageRef.current || 1));
    setApiPage(1);
    setApiHasMore(false);
    setGroups([]);
    setCounts({ matched_acq_ids: 0, matched_seconds: 0 });
    fetchPageFromApi(input, 1, false);
  };

  // Auto-search quando abrir /View com query no hash
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    if (
      hash.startsWith("#/View") ||
      hash.startsWith("#/view") ||
      hash.startsWith("#/search")
    ) {
      const qIndex = hash.indexOf("?");
      if (qIndex >= 0) {
        const paramsWithQ = hash.slice(qIndex); // inclui "?"

        // lê page= (paginação do UI) pra não resetar ao recarregar
        try {
          const sp = new URLSearchParams(paramsWithQ.slice(1));
          const p = Number(sp.get("page") || "1");
          initialPanelPageRef.current =
            Number.isFinite(p) && p > 0 ? Math.floor(p) : 1;
        } catch {
          initialPanelPageRef.current = 1;
        }

        startNewSearch(paramsWithQ);
      }
    }
  }, []);

  // mantém a URL sincronizada com a página atual (recarregar não volta pra 1)
  useEffect(() => {
    if (!currentQuery) return;
    replaceViewHashPage(panelPage);
  }, [panelPage, currentQuery]);

  // se o usuário abriu direto numa página alta (ex: page=4), auto-carrega mais páginas da API
  useEffect(() => {
    if (!currentQuery) return;
    if (isLoading) return;

    const needMore = panelPage > loadedPanelPages;
    if (needMore && apiHasMore) {
      fetchPageFromApi(currentQuery, apiPage + 1, true);
    }
  }, [panelPage, loadedPanelPages, apiHasMore, apiPage, currentQuery, isLoading]);

  const visibleGroups = useMemo(() => {
    const start = (panelPage - 1) * PANELS_PER_PAGE;
    return groups.slice(start, start + PANELS_PER_PAGE);
  }, [groups, panelPage]);

  const handlePrevPanel = () => {
    if (canGoPrevPanel) {
      setPanelPage((p) => p - 1);
    }
  };

  const handleNextPanel = async () => {
    // ainda tem próxima página dentro dos grupos já carregados
    if (canGoNextLoaded) {
      setPanelPage((p) => p + 1);
      return;
    }

    // chegou no fim do que está carregado, mas ainda tem mais páginas globais
    if (hasMoreOverall && apiHasMore && currentQuery && !isLoading) {
      await fetchPageFromApi(currentQuery, apiPage + 1, true);
      setPanelPage((p) => p + 1);
    }
  };

  const nextDisabled = (!canGoNextLoaded && !hasMoreOverall) || isLoading;

  const PaginationBar: React.FC = () => (
    <div className="flex items-center justify-center gap-6 text-base text-zinc-200 mt-2">
      <button
        disabled={!canGoPrevPanel || isLoading}
        onClick={handlePrevPanel}
        className={`px-4 py-2 rounded-lg font-semibold ${
          canGoPrevPanel && !isLoading
            ? "bg-zinc-800 hover:bg-zinc-700"
            : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
        }`}
      >
        Previous
      </button>

      <span className="font-medium">
        Page {panelPage} of {totalPanelPages}
      </span>

      <button
        disabled={nextDisabled}
        onClick={handleNextPanel}
        className={`px-4 py-2 rounded-lg font-semibold ${
          nextDisabled
            ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
            : "bg-zinc-800 hover:bg-zinc-700"
        }`}
      >
        {isLoading
          ? "Loading..."
          : canGoNextLoaded
          ? "Next"
          : hasMoreOverall
          ? "Load more results"
          : "No more results"}
      </button>
    </div>
  );

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col text-white text-base">
      
      <Header />
       <Breadcrumbs />


      <div className="p-4 flex flex-col items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold my-2 text-yellow-300">
          Acquisitions
        </h2>

        {/* Painel global stats + tags de filtros */}
        <div className="w-full md:w-4/5 lg:w-2/3 mt-1 mx-auto">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-4 md:px-6 md:py-5 shadow-lg flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1 flex flex-col justify-center gap-1">
              <div className="text-xs md:text-sm uppercase tracking-wide text-zinc-400">
                Global stats
              </div>
              <div className="text-base text-zinc-100">
                Matched seconds:{" "}
                <span className="text-yellow-400 font-semibold">
                  {counts.matched_seconds ?? 0}
                </span>
              </div>
              <div className="text-base text-zinc-100">
                Matched acquisitions:{" "}
                <span className="text-yellow-400 font-semibold">
                  {counts.matched_acq_ids ?? 0}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs md:text-sm uppercase tracking-wide text-zinc-400 mb-1">
                Active filters
              </div>
              {filterTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filterTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full border border-yellow-500/60 bg-yellow-500/10 text-xs md:text-sm text-yellow-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No filters applied
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full md:w-5/6 mx-auto p-4 flex flex-col gap-4">
        {isLoading && groups.length === 0 ? (
          <div className="flex justify-center">
            <img src={loadgif} className="w-32 h-32" />
          </div>
        ) : visibleGroups.length > 0 ? (
          <>
            <PaginationBar />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleGroups.map((g) => (
                <AcqPanel
                  key={g.acq_id}
                  group={g}
                  onOpen={() => handleOpenAcquisition(g.acq_id)}
                />
              ))}
            </div>

            {/* Panel pagination + auto load from API */}
            <PaginationBar />
          </>
        ) : (
          <p className="text-center text-zinc-400 mt-6 text-base">
            No acquisitions found.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default View;
