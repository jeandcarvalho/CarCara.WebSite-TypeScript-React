import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import loadgif from "../Components/img/gif.gif";

/* ===================== Types ===================== */
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
  total?: number;
  total_pages?: number;
};

type Counts = { matched_acq_ids: number; matched_seconds?: number; total_links: number };
type Group = { acq_id: string; photos: LinkDoc[] };

/* ===================== Config ===================== */
const API_DEFAULT_BASE = "https://carcara-web-api.onrender.com";
const API_SEARCH_PATH = "/api/search";

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
}

// order: thumb → preview → uc
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

// normalize API formats and filter images
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
    const page_info: PageInfo = json.page_info || { page: 1, per_page: 100, has_more: false };
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
  const page_info: PageInfo = json?.page_info || { page: 1, per_page: 100, has_more: false };
  const counts: Counts = json?.counts || { matched_acq_ids: 0, total_links: images.length };
  return { counts, page_info, images };
}

// dedup by second inside each acquisition (keeps first photo for that sec)
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

/* ===================== Uniform limiter (max 5 photos per panel) ===================== */
function limitPhotosUniform(photos: LinkDoc[], max = 5): LinkDoc[] {
  if (photos.length <= max) return photos;
  const step = photos.length / max;
  const result: LinkDoc[] = [];
  for (let i = 0; i < max; i++) {
    const idx = Math.floor(i * step);
    result.push(photos[idx]);
  }
  return result;
}

/* ===================== Robust URL Builder ===================== */
function buildSearchUrlFlexible(input: string, page: number, per_page: number): string {
  const ensurePageParams = (u: URL) => {
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  };

  const trimmed = (input || "").trim();

  // 1) Full URL (http/https)
  if (trimmed.startsWith("http")) {
    let urlObj = new URL(trimmed);
    // If it's a front URL with hash (e.g., http://site/#/search?...), extract params from hash
    if (urlObj.hash && urlObj.hash.includes("?") && !urlObj.pathname.includes("/api/")) {
      const afterQ = urlObj.hash.split("?")[1] || "";
      const u = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
      if (afterQ) new URLSearchParams(afterQ).forEach((v, k) => u.searchParams.append(k, v));
      return ensurePageParams(u);
    }
    return ensurePageParams(urlObj);
  }

  // 2) Only params (with or without '?')
  if (trimmed.startsWith("?") || trimmed.includes("=")) {
    const u = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
    const qs = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
    if (qs) new URLSearchParams(qs).forEach((v, k) => u.searchParams.append(k, v));
    return ensurePageParams(u);
  }

  // 3) Empty → use browser bar params (if any)
  if (typeof window !== "undefined") {
    const u = new URL(API_DEFAULT_BASE + API_SEARCH_PATH);
    const qs = window.location.search.replace(/^\?/, "");
    if (qs) new URLSearchParams(qs).forEach((v, k) => u.searchParams.append(k, v));
    return ensurePageParams(u);
  }

  // Fallback
  return `${API_DEFAULT_BASE}${API_SEARCH_PATH}?page=${page}&per_page=${per_page}`;
}

/* ===================== Single acquisition panel ===================== */
const AcqPanel: React.FC<{ group: Group }> = ({ group }) => {
  const photosSortedUnique = useMemo(() => {
    const ordered = [...group.photos].sort((a, b) => (a.sec ?? 0) - (b.sec ?? 0));
    const unique = uniqueBySecond(ordered);
    return limitPhotosUniform(unique, 5);
  }, [group.photos]);

  const [idx, setIdx] = useState(0);
  const photo = photosSortedUnique[idx];

  // detects if all IDs/links collapse to the same image (same Drive ID)
  const allIdsEqual = useMemo(() => {
    const s = new Set<string>();
    for (const p of photosSortedUnique) {
      const id = extractDriveId(p.link);
      s.add(id ? `id:${id}` : `raw:${p.link}`);
    }
    return s.size === 1;
  }, [photosSortedUnique]);

  // src candidates:
  const makeSrcCandidates = (p: LinkDoc) => {
    const raw = p.link;
    const thumb = thumbUrl(p.link);
    const preview = previewUrl(p.link);
    const uc = fullImageUrl(p.link);
    return allIdsEqual ? [raw, preview, uc, thumb] : [thumb, preview, uc, raw];
  };

  const vtag = `v=${idx}_${photo.sec ?? "x"}`; // cache-buster
  const candidates = useMemo(() => {
    return makeSrcCandidates(photo).map((u) => (u.includes("?") ? `${u}&${vtag}` : `${u}?${vtag}`));
  }, [photo, allIdsEqual, vtag]);

  // fallback stage
  const [stage, setStage] = useState(0);
  useEffect(() => {
    setStage(0);
  }, [idx]);

  const currentSrc = candidates[Math.min(stage, candidates.length - 1)];
  const keyImg = `${group.acq_id}-${photo.sec ?? "x"}-${idx}-${stage}`;

  const count = photosSortedUnique.length;
  const secondsLabel = `${count} second${count === 1 ? "" : "s"}`;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-zinc-900/60 border-b border-zinc-800">
        <div className="text-sm">
          <div className="font-semibold text-zinc-100">{group.acq_id}</div>
          <div className="text-zinc-400">{secondsLabel}</div>
        </div>
        <div className="text-xs text-zinc-400">
          {idx + 1} / {count}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <img
          key={keyImg}
          data-idle
          src={currentSrc}
          alt={`${group.acq_id} • sec ${photo.sec ?? "–"}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full aspect-[16/9] object-cover bg-zinc-800"
          onError={() => {
            setStage((s) => (s + 1 < candidates.length ? s + 1 : s));
          }}
        />
        {photosSortedUnique.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIdx((p) => (p - 1 + photosSortedUnique.length) % photosSortedUnique.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/50 hover:bg-black/70"
              aria-label="Previous"
              title="Previous"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIdx((p) => (p + 1) % photosSortedUnique.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/50 hover:bg-black/70"
              aria-label="Next"
              title="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800">
        <span>sec: {photo.sec ?? "–"}</span>
        <a
          href={photo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          open original
        </a>
      </div>

      {/* Dots (show up to 4 dots; if >=5, show "5+") */}
      {photosSortedUnique.length > 1 && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-1 justify-center">
          {photosSortedUnique.slice(0, 4).map((p, i) => (
            <button
              key={`${group.acq_id}-${p.sec ?? i}`}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              className={`w-2.5 h-2.5 rounded-full ${i === idx ? "bg-blue-500" : "bg-zinc-700 hover:bg-zinc-600"}`}
              title={`go to sec ${p.sec ?? i}`}
            />
          ))}
          {photosSortedUnique.length >= 5 && (
            <span className="text-[10px] text-zinc-500 font-semibold">5+</span>
          )}
        </div>
      )}
    </section>
  );
};

/* ===================== Main component ===================== */
const ImagesMosaic: React.FC = () => {
  const [queryUrl, setQueryUrl] = useState<string>("");

  // raw API state
  const [apiPage, setApiPage] = useState<number>(0);
  const [apiHasMore, setApiHasMore] = useState<boolean>(false);
  const [counts, setCounts] = useState<Counts>({ matched_acq_ids: 0, total_links: 0 });
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [errMsg, setErrMsg] = useState<string>("");

  // grouped panels
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // panel-specific loading (start and page change)
  const [isPanelsLoading, setIsPanelsLoading] = useState<boolean>(false);

  // ====== config: 6 panels per page (3 columns × 2 rows) ======
  const PANELS_PER_PAGE = 6;
  const [panelPage, setPanelPage] = useState<number>(1);

  // debug
  const [lastFetchUrl, setLastFetchUrl] = useState<string>("");

  // ====== mirror refs for async loops ======
  const groupsRef = useRef<Group[]>(groups);
  const apiPageRef = useRef<number>(apiPage);
  const apiHasMoreRef = useRef<boolean>(apiHasMore);
  useEffect(() => { groupsRef.current = groups; }, [groups]);
  useEffect(() => { apiPageRef.current = apiPage; }, [apiPage]);
  useEffect(() => { apiHasMoreRef.current = apiHasMore; }, [apiHasMore]);

  // concurrency guards
  const loadingMoreRef = useRef(false);
  const fetchingRef = useRef<Set<number>>(new Set());

  // add images to acquisition groups
  const addImagesToGroups = (batch: LinkDoc[]) => {
    if (!batch.length) return;
    setGroups((prev) => {
      const map = new Map<string, Group>();
      for (const g of prev) map.set(g.acq_id, { acq_id: g.acq_id, photos: [...g.photos] });
      for (const img of batch) {
        const key = img.acq_id || "unknown";
        if (!map.has(key)) map.set(key, { acq_id: key, photos: [] });
        map.get(key)!.photos.push(img);
      }
      // order + dedup by second
      for (const [, v] of map) {
        v.photos.sort((a, b) => (a.sec ?? 0) - (b.sec ?? 0));
        v.photos = uniqueBySecond(v.photos);
      }
      const arr = Array.from(map.values()).sort((a, b) => a.acq_id.localeCompare(b.acq_id));
      return arr;
    });
  };

  const fetchApiPage = async (p: number) => {
    if (fetchingRef.current.has(p)) return; // avoid duplicate page
    fetchingRef.current.add(p);

    setIsLoading(true);
    setErrMsg("");
    try {
      const url = buildSearchUrlFlexible(queryUrl, p, 100);
      setLastFetchUrl(url);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const { counts: cts, page_info: pi, images } = coerceResponse(json);

      setCounts(cts);
      setApiHasMore(pi?.has_more ?? false);
      setApiPage(p);
      setTotalPages(pi?.total_pages);
      addImagesToGroups(images);
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.message || "Error fetching API.");
    } finally {
      fetchingRef.current.delete(p);
      setIsLoading(false);
    }
  };

  const ensureGroupsForPanelPage = async (targetPanelPage: number) => {
    const need = targetPanelPage * PANELS_PER_PAGE;

    if (loadingMoreRef.current) return; // avoid concurrency
    loadingMoreRef.current = true;

    try {
      while (true) {
        const loadedGroups = groupsRef.current.length;
        const curPage = apiPageRef.current;
        const hasMore = apiHasMoreRef.current;

        if (loadedGroups >= need) break;      // enough panels
        if (!hasMore && curPage > 0) break;   // backend has no more pages

        await fetchApiPage(curPage + 1);
        await new Promise((r) => setTimeout(r, 0)); // let React apply state
      }
    } finally {
      loadingMoreRef.current = false;
    }
  };

  const onSearch = async () => {
    if (!queryUrl.trim()) {
      setErrMsg("Paste the front URL (#/search?...), a full API URL, or just the parameters (?b.period=day...).");
      return;
    }
    setGroups([]);
    setApiPage(0);
    setApiHasMore(false);
    setTotalPages(undefined);
    setPanelPage(1);
    setErrMsg("");
    setLastFetchUrl("");

    setIsPanelsLoading(true);
    await ensureGroupsForPanelPage(1);
    setIsPanelsLoading(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gotoPanelPage = async (p: number) => {
    if (p < 1) p = 1;
    setPanelPage(p);

    setIsPanelsLoading(true);
    await ensureGroupsForPanelPage(p);
    setIsPanelsLoading(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const panelStart = (panelPage - 1) * PANELS_PER_PAGE;
  const panelEnd = panelStart + PANELS_PER_PAGE;
  const visibleGroups = useMemo(() => groups.slice(panelStart, panelEnd), [groups, panelStart, panelEnd]);

  const totalPanelPages = useMemo(() => {
    const totalGroups = groups.length;
    if (apiHasMore) return Math.max(Math.ceil(totalGroups / PANELS_PER_PAGE) + 1, panelPage);
    return Math.max(1, Math.ceil(totalGroups / PANELS_PER_PAGE));
  }, [groups.length, apiHasMore, panelPage]);

  // optional timeout for stuck images (10s)
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const imgs = document.querySelectorAll("img[data-idle]");
      imgs.forEach((img) => {
        const el = img as HTMLImageElement;
        if (!el.complete || el.naturalWidth === 0) {
          el.onerror = null;
          el.src =
            "data:image/svg+xml;base64," +
            btoa(`
              <svg xmlns='http://www.w3.org/2000/svg' width='400' height='225'>
                <rect width='100%' height='100%' fill='#27272a'/>
                <text x='50%' y='50%' fill='#9ca3af' font-size='14' text-anchor='middle' dominant-baseline='middle'>
                  timeout
                </text>
              </svg>
            `);
        }
      });
    }, 10000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [visibleGroups, panelPage]);

  const pageWindow = (current: number, total: number, span = 7) => {
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
        <h2 className="text-xl font-semibold mb-3">📦 Acquisitions (panels) • 6 per page</h2>

        <div className="w-full md:w-3/4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Paste the front URL (#/search?...), a full API URL, or only params (?b.period=day...)"
            value={queryUrl}
            onChange={(e) => setQueryUrl(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-gray-200 border border-zinc-700"
          />
          <div className="flex gap-2">
            <button
              onClick={onSearch}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold"
            >
              Search
            </button>
            <button
              onClick={() => {
                setQueryUrl("");
                setGroups([]);
                setApiPage(0);
                setApiHasMore(false);
                setTotalPages(undefined);
                setPanelPage(1);
                setErrMsg("");
                setLastFetchUrl("");
                setIsPanelsLoading(false);
              }}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded font-semibold"
            >
              Clear
            </button>
            {errMsg && (
              <button
                onClick={() => fetchApiPage(Math.max(1, apiPage || 1))}
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded font-semibold"
              >
                Retry
              </button>
            )}
          </div>

          {/* Debug */}
          <div className="text-xs text-zinc-400 space-y-1">
            {lastFetchUrl && (
              <div className="truncate">
                URL: <code className="break-all">{lastFetchUrl}</code>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>fetched page: <b>{apiPage || 0}</b>{typeof totalPages === "number" ? ` / ${totalPages}` : ""}</span>
              <span>has_more: <b>{String(apiHasMore)}</b></span>
              <span>loaded panels: <b>{groups.length}</b></span>
              <span>visible: <b>{visibleGroups.length}</b></span>
              <span>counts: acqs <b>{counts.matched_acq_ids ?? 0}</b>, links <b>{counts.total_links ?? 0}</b></span>
            </div>
            {errMsg && <div className="text-red-400">Error: {errMsg}</div>}
          </div>
        </div>
      </div>

      <div className="flex-grow flex justify-center px-4">
        {isLoading && groups.length === 0 ? (
          <div className="w-full mt-11 flex justify-center items-center">
            <img src={loadgif} alt="Loading" className="w-32 h-32 mt-11 mb-11" />
          </div>
        ) : (
          <main className="w-full md:w-5/6 mx-auto pb-10">
            {isPanelsLoading ? (
              <div className="w-full mt-11 flex justify-center items-center">
                <img src={loadgif} alt="Loading" className="w-32 h-32 mt-11 mb-11" />
              </div>
            ) : visibleGroups.length > 0 ? (
              <>
                {/* grid: 3 per row (desktop), 2 on md, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visibleGroups.map((g) => (
                    <AcqPanel key={g.acq_id} group={g} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => gotoPanelPage(1)}
                    disabled={panelPage <= 1}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="First"
                  >
                    «
                  </button>
                  <button
                    onClick={() => gotoPanelPage(panelPage - 1)}
                    disabled={panelPage <= 1}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Previous"
                  >
                    ‹
                  </button>

                  {pageWindow(panelPage, totalPanelPages, 7).map((p) => (
                    <button
                      key={p}
                      onClick={() => gotoPanelPage(p)}
                      className={`px-3 py-1 rounded ${p === panelPage ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => gotoPanelPage(panelPage + 1)}
                    disabled={!apiHasMore && panelPage >= totalPanelPages}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Next"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => gotoPanelPage(totalPanelPages || panelPage + 1)}
                    disabled={!apiHasMore && panelPage >= totalPanelPages}
                    className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-40"
                    title="Last"
                  >
                    »
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 mt-8">
                {isLoading ? "Loading..." : "No acquisitions found."}
              </p>
            )}
          </main>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ImagesMosaic;