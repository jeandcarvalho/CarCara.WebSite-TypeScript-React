import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import loadgif from "../Components/img/gif.gif";

type LinkDoc = {
  acq_id: string;
  sec: number | null;
  ext?: string;
  link: string;
};

type PageInfo = {
  page: number;
  per_page: number;
  has_more: boolean;
  total?: number;        // << se a API mandar, usamos
  total_pages?: number;  // << se a API mandar, usamos
};

type Counts = { matched_acq_ids: number; matched_seconds?: number; total_links: number };

type ApiShapeA = { counts: Counts; page_info: PageInfo; documents: LinkDoc[] };
type ApiShapeB = {
  counts: Counts;
  page_info: PageInfo;
  items: Array<{ acq_id: string; links: { per_second: { photo: Array<{ sec: number; url: string }> }, per_acq: Record<string, string[]> } }>;
};

/* ===================== Helpers ===================== */

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function extFromLink(link: string): string | null {
  try {
    const u = new URL(link);
    const last = u.pathname.split("/").pop() || "";
    const dot = last.lastIndexOf(".");
    if (dot === -1) return null;
    return last.slice(dot + 1).toLowerCase();
  } catch {
    const m = link.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
    return m ? m[1].toLowerCase() : null;
  }
}

function isProbablyImage(linkDoc: LinkDoc): boolean {
  if (linkDoc.ext && IMAGE_EXTS.has(String(linkDoc.ext).toLowerCase())) return true;
  if (linkDoc.link.includes("lh3.googleusercontent.com")) return true;
  const ext = extFromLink(linkDoc.link);
  if (ext && IMAGE_EXTS.has(ext)) return true;
  return false;
}

function extractDriveId(link: string): string | null {
  if (!link) return null;
  if (link.includes("lh3.googleusercontent.com/d/")) {
    const m = link.match(/lh3\.googleusercontent\.com\/d\/([^=/?#]+)/);
    return m?.[1] ?? null;
  }
  const patterns = [
    /\/file\/d\/([^/]+)\//,
    /\/d\/([^/]+)\//,
    /[?&]id=([^&]+)/,
    /\/uc\?[^#]*\bid=([^&]+)/i,
  ];
  for (const re of patterns) {
    const m = link.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

// PRIORIDADE: Thumbnail (rápido) → Preview → UC (full)
function thumbUrl(link: string): string {
  const id = extractDriveId(link);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w1200-h800-n` : link;
}
function previewUrl(link: string): string {
  return link.includes("/preview") ? link : link.replace("/view", "/preview");
}
function fullImageUrl(link: string): string {
  const id = extractDriveId(link);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : link;
}

/* ============== Normaliza resposta (filtra imagens) ============== */

function coerceResponse(json: any): { counts: Counts; page_info: PageInfo; images: LinkDoc[] } {
  if (json && Array.isArray(json.documents)) {
    const docs = (json.documents as LinkDoc[]).filter((d) => !!d.link);
    const images = docs.filter(isProbablyImage);
    return { counts: json.counts, page_info: json.page_info, images };
  }
  if (json && Array.isArray(json.items)) {
    const images: LinkDoc[] = [];
    for (const it of json.items as any[]) {
      const acq = it.acq_id;
      const photos = it?.links?.per_second?.photo || [];
      for (const ph of photos) {
        const doc: LinkDoc = { acq_id: acq, sec: ph.sec ?? null, link: ph.url };
        if (isProbablyImage(doc)) images.push(doc);
      }
    }
    const page_info: PageInfo = json.page_info || { page: 1, per_page: 14, has_more: false };
    const counts: Counts = json.counts || { matched_acq_ids: (json.items || []).length, total_links: images.length };
    return { counts, page_info, images };
  }
  const docs = json?.documents || json?.results || json?.images || [];
  const list: LinkDoc[] = Array.isArray(docs)
    ? (docs as any[]).filter((d) => !!d?.link).map((d) => ({
        acq_id: d.acq_id ?? "",
        sec: d.sec ?? null,
        link: d.link,
        ext: d.ext,
      }))
    : [];
  const images = list.filter(isProbablyImage);
  const page_info: PageInfo = json?.page_info || { page: 1, per_page: 14, has_more: false };
  const counts: Counts = json?.counts || { matched_acq_ids: 0, total_links: images.length };
  return { counts, page_info, images };
}

/* ===================== Componente ===================== */

const ImagesMosaic: React.FC = () => {
  const [queryUrl, setQueryUrl] = useState<string>("");
  const [images, setImages] = useState<LinkDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [counts, setCounts] = useState<Counts>({ matched_acq_ids: 0, total_links: 0 });
  const [errMsg, setErrMsg] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  const PER_PAGE = 14;

  const buildApiUrl = (p: number) => {
    const paramsRaw = queryUrl.includes("?") ? queryUrl.split("?")[1] : "";
    return `http://localhost:8080/api/search?${paramsRaw}${paramsRaw ? "&" : ""}page=${p}&per_page=${PER_PAGE}`;
  };

  const recomputeTotalPages = (pi: PageInfo, cts: Counts) => {
    // preferir page_info.total_pages, depois page_info.total, depois counts.total_links
    const totalFromPI = pi?.total_pages
      ? pi.total_pages
      : pi?.total
      ? Math.max(1, Math.ceil(pi.total / (pi.per_page || PER_PAGE)))
      : 0;
    const totalFromCounts = cts?.total_links ? Math.max(1, Math.ceil(cts.total_links / (pi.per_page || PER_PAGE))) : 0;

    const total = totalFromPI || totalFromCounts || (pi?.has_more ? Math.max(page + 1, 2) : page);
    setTotalPages(total);
  };

  const fetchPage = async (p: number, replace = false) => {
    setIsLoading(true);
    setErrMsg("");
    try {
      const apiUrl = buildApiUrl(p);
      const resp = await fetch(apiUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const coerced = coerceResponse(json);
      setCounts(coerced.counts);
      setHasMore(coerced.page_info?.has_more ?? false);
      setPage(p);
      recomputeTotalPages(coerced.page_info, coerced.counts);
      if (replace) setImages(coerced.images);
      else setImages((prev) => [...prev, ...coerced.images]);
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.message || "Erro desconhecido ao buscar a API.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = () => {
    if (!queryUrl.trim()) {
      setErrMsg("Cole a URL do front (ex: #/search?b.period=day&y.class=car).");
      return;
    }
    setImages([]);
    fetchPage(1, true);
  };

  // ⏱ Timeout opcional para imagens penduradas (10s)
  useEffect(() => {
    const timer = setTimeout(() => {
      const imgs = document.querySelectorAll("img[data-idle]");
      imgs.forEach((img) => {
        const el = img as HTMLImageElement;
        if (!el.complete || el.naturalWidth === 0) {
          el.onerror = null;
          el.src =
            "data:image/svg+xml;base64," +
            btoa(`
              <svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'>
                <rect width='100%' height='100%' fill='#27272a'/>
                <text x='50%' y='50%' fill='#9ca3af' font-size='14' text-anchor='middle' dominant-baseline='middle'>
                  tempo esgotado
                </text>
              </svg>
            `);
        }
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, [images, page]);

  const gotoPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalPages) p = Math.min(p, totalPages);
    setImages([]); // sempre troca o lote
    fetchPage(p, true);
    // scroll pro topo da grade
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // range de botões (janela deslizante)
  const pageWindow = (current: number, total: number, span = 5) => {
    const half = Math.floor(span / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + span - 1);
    start = Math.max(1, end - span + 1);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col text-white">
      <Header />

      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl font-semibold mb-3">🔍 Teste de Busca CarCará API</h2>

        <div className="w-full md:w-3/4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Cole a URL do front (ex: #/search?b.period=day&y.class=car)"
            value={queryUrl}
            onChange={(e) => setQueryUrl(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-gray-200 border border-zinc-700"
          />
          <div className="flex gap-2">
            <button onClick={onSearch} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold">
              Buscar
            </button>
            <button onClick={() => setQueryUrl("")} className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded font-semibold">
              Limpar
            </button>
          </div>
          {errMsg && <div className="text-red-400 text-sm">{errMsg}</div>}
          {counts.total_links > 0 && (
            <div className="text-gray-400 text-sm">
              {counts.matched_acq_ids} aquisições • {counts.total_links} arquivos totais • página {page}
              {totalPages ? ` / ${totalPages}` : ""} • exibindo {images.length} itens
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow flex justify-center px-4">
        {isLoading ? (
          <div className="w-full mt-11 flex justify-center items-center">
            <img src={loadgif} alt="Loading" className="w-32 h-32 mt-11 mb-11" />
          </div>
        ) : (
          <main className="w-full md:w-5/6 mx-auto pb-8">
            {images.length > 0 ? (
              <>
                {/* 14 por página: 2×7 no desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {images.map((doc, idx) => {
                    const src0 = thumbUrl(doc.link); // PRIORIDADE: THUMB
                    return (
                      <a
                        key={`${doc.acq_id}_${doc.sec}_${idx}`}
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-lg"
                      >
                        <img
                          data-idle
                          src={src0}
                          alt={`${doc.acq_id}_${doc.sec}`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-40 object-cover rounded-md transition-transform duration-300 group-hover:scale-105 bg-zinc-800"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const stage = (target as any).__stage ?? 0;

                            // stage 0: thumb falhou -> preview
                            if (stage === 0) {
                              (target as any).__stage = 1;
                              target.src = previewUrl(doc.link);
                              return;
                            }
                            // stage 1: preview falhou -> UC (full)
                            if (stage === 1) {
                              (target as any).__stage = 2;
                              target.src = fullImageUrl(doc.link);
                              return;
                            }
                            // stage 2: UC falhou -> placeholder (sem loop)
                            target.onerror = null;
                            target.src =
                              "data:image/svg+xml;base64," +
                              btoa(`
                                <svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'>
                                  <rect width='100%' height='100%' fill='#27272a'/>
                                  <text x='50%' y='50%' fill='#9ca3af' font-size='14' text-anchor='middle' dominant-baseline='middle'>
                                    imagem indisponível
                                  </text>
                                </svg>
                              `);
                          }}
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.acq_id} • sec {doc.sec ?? "–"}
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* ====== Paginação numerada ====== */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => gotoPage(1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Primeira"
                  >
                    «
                  </button>
                  <button
                    onClick={() => gotoPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Anterior"
                  >
                    ‹
                  </button>

                  {pageWindow(page, totalPages || Math.max(page + (hasMore ? 1 : 0), 1), 7).map((p) => (
                    <button
                      key={p}
                      onClick={() => gotoPage(p)}
                      className={`px-3 py-1 rounded ${
                        p === page ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => gotoPage(page + 1)}
                    disabled={totalPages ? page >= totalPages : !hasMore}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Próxima"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => gotoPage(totalPages || page + 1)}
                    disabled={totalPages ? page >= totalPages : !hasMore}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Última"
                  >
                    »
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 mt-8">Nenhuma imagem carregada.</p>
            )}
          </main>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ImagesMosaic;
