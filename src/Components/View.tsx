import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import loadgif from "../Components/img/gif.gif";

/* ===================== Types ===================== */

type LinkDoc = {
  acq_id: string;
  sec: number | null;
  link: string;
  ext?: string;
};

type PageInfo = {
  page: number;
  per_page: number;
  has_more: boolean;
  total?: number;
  total_pages?: number;
};

type Counts = { matched_acq_ids: number; matched_seconds: number };

type Group = {
  acq_id: string;
  photos: LinkDoc[];
};

/* ===================== Config ===================== */

const API_DEFAULT_BASE = "https://carcara-web-api.onrender.com";
const API_SEARCH_PATH = "/api/search";
const PANELS_PER_PAGE = 6;

/* ===================== Helpers ===================== */

function extractDriveId(link: string): string | null {
  try {
    if (!link) return null;

    if (link.includes("lh3.googleusercontent.com/d/")) {
      const m = link.match(/lh3\.googleusercontent\.com\/d\/([^=\/?#]+)/);
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
  } catch {
    return null;
  }
}

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

/** Format acq_id like 20240129141515 => 29/01/2024 14:15 */
function formatAcqIdLabel(acq_id: string): string {
  const digits = acq_id.replace(/\D/g, "");
  if (digits.length < 12) return acq_id;

  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  const hour = digits.slice(8, 10);
  const minute = digits.slice(10, 12);

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/** Format seconds like 86 => "1m 26s" */
function formatSecLabel(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "-";
  if (sec < 60) return `${sec}s`;
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}m ${seconds}s`;
}

/* ================================================================
   coerceResponse: monta lista de imagens genérica
   ================================================================ */

function coerceResponse(json: any): { counts: Counts; page_info: PageInfo; images: LinkDoc[] } {
  let images: LinkDoc[] = [];

  // caso antigo: documents
  if (json && Array.isArray(json.documents)) {
    images = json.documents
      .filter((d: any) => d?.link)
      .map((d: any) => ({
        acq_id: String(d.acq_id ?? d.acq_id_raw ?? ""),
        sec: d.sec ?? null,
        link: d.link,
        ext: d.ext,
      }));

    return {
      counts: json.counts || {
        matched_acq_ids: json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
        matched_seconds: json.total_hits ?? images.length,
      },
      page_info: json.page_info || {
        page: json.page ?? 1,
        per_page: json.per_page ?? 100,
        has_more: json.has_more ?? false,
      },
      images,
    };
  }

  // novo formato: items
  if (json && Array.isArray(json.items)) {
    for (const it of json.items) {
      const acq_id = String(it.acq_id ?? it.acq_id_raw ?? "");
      const sec = it.sec ?? null;

      // formato BIG antigo: { acq_id, sec, links:[{ext,link}, ...] }
      if (Array.isArray(it.links)) {
        for (const l of it.links) {
          if (!l?.link) continue;
          images.push({
            acq_id,
            sec,
            link: l.link,
            ext: l.ext,
          });
        }
      }

      // novo formato BIG enxuto: { acq_id, sec, link }
      if (typeof it.link === "string" && it.link) {
        images.push({
          acq_id,
          sec,
          link: it.link,
        });
      }

      // formato antigo: links.per_second.photo[..]
      if (it.links?.per_second?.photo) {
        for (const ph of it.links.per_second.photo) {
          if (!ph?.url) continue;
          images.push({
            acq_id,
            sec: ph.sec ?? null,
            link: ph.url,
          });
        }
      }
    }

    const counts: Counts =
      json.counts ||
      ({
        matched_acq_ids: json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
        matched_seconds: json.total_hits ?? images.length,
      } as Counts);

    const page_info: PageInfo =
      json.page_info || {
        page: json.page ?? 1,
        per_page: json.per_page ?? 100,
        has_more: json.has_more ?? false,
        total: counts.matched_acq_ids,
        total_pages: json.total_pages,
      };

    return { counts, page_info, images };
  }

  // fallback genérico
  const docs = json?.documents || json?.results || json?.images || [];
  images = Array.isArray(docs)
    ? docs
        .filter((d: any) => d?.link)
        .map((d: any) => ({
          acq_id: String(d.acq_id ?? d.acq_id_raw ?? ""),
          sec: d.sec ?? null,
          link: d.link,
          ext: d.ext,
        }))
    : [];

  const counts: Counts =
    json.counts ||
    ({
      matched_acq_ids: json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
      matched_seconds: json.total_hits ?? images.length,
    } as Counts);

  const page_info: PageInfo =
    json.page_info || {
      page: json.page ?? 1,
      per_page: json.per_page ?? 100,
      has_more: json.has_more ?? false,
    };

  return { counts, page_info, images };
}

/* ===================== Unique by Second & limit for UI ===================== */

function uniqueBySecond(photos: LinkDoc[]): LinkDoc[] {
  const seen = new Set<number>();
  const out: LinkDoc[] = [];
  for (const p of photos) {
    const s = (p.sec ?? -1) as number;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(p);
    }
  }
  return out;
}

function limitPhotosUniform(photos: LinkDoc[], max = 5): LinkDoc[] {
  if (photos.length <= max) return photos;
  const step = photos.length / max;
  const result: LinkDoc[] = [];
  for (let i = 0; i < max; i++) {
    result.push(photos[Math.floor(i * step)]);
  }
  return result;
}

/* ===================== URL Builder ===================== */

function buildSearchUrlFlexible(input: string, page: number, per_page: number): string {
  const ensure = (u: URL) => {
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  };

  const trimmed = (input || "").trim();

  // 1) full URL (http/https)
  if (trimmed.startsWith("http")) {
    const urlObj = new URL(trimmed);

    // se for /api/search direto
    if (urlObj.pathname.includes("/api/")) return ensure(urlObj);

    // se for /#/search ou /#/View
    if (
      urlObj.hash.startsWith("#/search") ||
      urlObj.hash.startsWith("#/View") ||
      urlObj.hash.startsWith("#/view")
    ) {
      const api = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
      const hash = urlObj.hash;
      const q = hash.indexOf("?");
      if (q >= 0) {
        const params = hash.slice(q + 1);
        if (params) {
          new URLSearchParams(params).forEach((v, k) => api.searchParams.append(k, v));
        }
      }
      return ensure(api);
    }

    // qualquer outra URL → só garante paginação
    return ensure(urlObj);
  }

  // 2) só o hash do SPA, tipo "#/search?..." ou "#/View?..."
  if (
    trimmed.startsWith("#/search") ||
    trimmed.startsWith("#/View") ||
    trimmed.startsWith("#/view")
  ) {
    const api = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
    const q = trimmed.indexOf("?");
    if (q >= 0) {
      const params = trimmed.slice(q + 1);
      if (params) {
        new URLSearchParams(params).forEach((v, k) => api.searchParams.append(k, v));
      }
    }
    return ensure(api);
  }

  // 3) só parâmetros: "?b.period=day..." ou "b.period=day..."
  if (trimmed.startsWith("?") || trimmed.includes("=")) {
    const u = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
    const qs = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
    if (qs) new URLSearchParams(qs).forEach((v, k) => u.searchParams.append(k, v));
    return ensure(u);
  }

  // 4) vazio ou outra coisa → busca geral sem filtros
  return `${API_DEFAULT_BASE}${API_SEARCH_PATH}?page=${page}&per_page=${per_page}`;
}

/* ===================== Panel Component ===================== */

const AcqPanel: React.FC<{ group: Group }> = ({ group }) => {
  const totalSecondsForAcq = useMemo(
    () => new Set(group.photos.map((p) => p.sec ?? -1)).size,
    [group.photos],
  );

  const photosForUi = useMemo(() => {
    const sorted = [...group.photos].sort((a, b) => (a.sec ?? 0) - (b.sec ?? 0));
    const uniq = uniqueBySecond(sorted);
    return limitPhotosUniform(uniq);
  }, [group.photos]);

  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setIdx(0);
    setStage(0);
  }, [group.acq_id]);

  const photo = photosForUi[idx];

  const candidates = useMemo(() => {
    const raw = photo.link;
    const thumb = thumbUrl(raw);
    const preview = previewUrl(raw);
    const full = fullImageUrl(raw);
    return [thumb, preview, full, raw];
  }, [photo.link]);

  useEffect(() => {
    setStage(0);
  }, [idx]);

  const src = candidates[Math.min(stage, candidates.length - 1)];
  const acqLabel = formatAcqIdLabel(group.acq_id);

  // contador do canto direito: x/y ou x/y+
  const shownCount = photosForUi.length;
  const denomLabel = totalSecondsForAcq > shownCount ? `${shownCount}+` : `${shownCount}`;
  const currentLabel = `${idx + 1}/${denomLabel}`;

  const secLabel = formatSecLabel(photo.sec);

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden text-base">
      <div className="px-4 py-3 flex items-center justify-between bg-zinc-900/70 border-b border-zinc-800">
        <div className="text-base">
          <div className="font-semibold text-zinc-100">{acqLabel}</div>
        </div>
        <div className="text-sm text-zinc-300">{currentLabel}</div>
      </div>

      <div className="relative">
        <img
          key={`${group.acq_id}-${photo.sec}-${idx}-${stage}`}
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full aspect-[16/9] object-cover bg-zinc-800"
          onError={() => setStage((s) => (s + 1 < candidates.length ? s + 1 : s))}
        />

        {photosForUi.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 px-3 py-2 rounded-full text-xl font-bold shadow-lg border border-zinc-600"
              onClick={(e) => {
                e.stopPropagation();
                setIdx((idx - 1 + photosForUi.length) % photosForUi.length);
              }}
            >
              ‹
            </button>

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 px-3 py-2 rounded-full text-xl font-bold shadow-lg border border-zinc-600"
              onClick={(e) => {
                e.stopPropagation();
                setIdx((idx + 1) % photosForUi.length);
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="px-4 py-3 text-sm text-zinc-300 flex items-center justify-between border-t border-zinc-800">
        <span>{secLabel}</span>
        <a
          href={photo.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="underline font-medium"
        >
          open original
        </a>
      </div>
    </section>
  );
};

/* ===================== Main Component ===================== */

const ImagesMosaic: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({ matched_acq_ids: 0, matched_seconds: 0 });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [panelPage, setPanelPage] = useState(1);

  const totalPanelPages = useMemo(
    () => (groups.length === 0 ? 1 : Math.ceil(groups.length / PANELS_PER_PAGE)),
    [groups.length],
  );

  const fetchAllPages = async (input: string) => {
    setIsLoading(true);
    try {
      let page = 1;
      let hasMore = true;
      let finalCounts: Counts = { matched_acq_ids: 0, matched_seconds: 0 };
      const map = new Map<string, Group>();

      while (hasMore) {
        const url = buildSearchUrlFlexible(input, page, 100);
        const resp = await fetch(url);
        const json = await resp.json();
        const { counts: cts, images, page_info } = coerceResponse(json);

        finalCounts = cts;

        for (const img of images) {
          const key = img.acq_id;
          if (!map.has(key)) map.set(key, { acq_id: key, photos: [] });
          map.get(key)!.photos.push(img);
        }

        hasMore = page_info.has_more;
        page += 1;
      }

      const sortedGroups = Array.from(map.values()).sort((a, b) => {
        const na = Number(a.acq_id.replace(/\D/g, "")) || 0;
        const nb = Number(b.acq_id.replace(/\D/g, "")) || 0;
        return nb - na; // newest first
      });

      setCounts(finalCounts);
      setGroups(sortedGroups);
      setPanelPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        fetchAllPages(paramsWithQ);
      }
    }
  }, []);

  const visibleGroups = useMemo(() => {
    const start = (panelPage - 1) * PANELS_PER_PAGE;
    return groups.slice(start, start + PANELS_PER_PAGE);
  }, [groups, panelPage]);

  const canGoPrevPanel = panelPage > 1;
  const canGoNextPanel = panelPage < totalPanelPages;

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col text-white text-base">
      <Header />

      <div className="p-4 flex flex-col itemscenter gap-3">
        <h2 className="text-2xl mb-1 font-semibold">Acquisitions</h2>

        {/* Global stats */}
        <div className="mt-1 text-base text-zinc-200 w-full md:w-2/3 flex flex-col gap-1">
          <span>
            Total matched seconds:{" "}
            <span className="text-yellow-400 font-semibold">
              {counts.matched_seconds ?? 0}
            </span>
          </span>
          <span>
            Total matched acquisitions:{" "}
            <span className="text-yellow-400 font-semibold">
              {counts.matched_acq_ids ?? 0}
            </span>
          </span>
        </div>
      </div>

      <main className="flex-grow w-full md:w-5/6 mx-auto p-4 flex flex-col gap-4">
        {isLoading && groups.length === 0 ? (
          <div className="flex justify-center">
            <img src={loadgif} className="w-32 h-32" />
          </div>
        ) : visibleGroups.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleGroups.map((g) => (
                <AcqPanel key={g.acq_id} group={g} />
              ))}
            </div>

            {/* Panel pagination */}
            <div className="flex items-center justify-center gap-6 text-base text-zinc-200 mt-2">
              <button
                disabled={!canGoPrevPanel}
                onClick={() => canGoPrevPanel && setPanelPage((p) => p - 1)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  canGoPrevPanel
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                }`}
              >
                Previous panel page
              </button>

              <span className="font-medium">
                Panel page {panelPage} of {totalPanelPages}
              </span>

              <button
                disabled={!canGoNextPanel}
                onClick={() => canGoNextPanel && setPanelPage((p) => p + 1)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  canGoNextPanel
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                }`}
              >
                Next panel page
              </button>
            </div>
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

export default ImagesMosaic;
