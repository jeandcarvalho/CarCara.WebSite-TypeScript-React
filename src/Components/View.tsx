import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import loadgif from "../Components/img/gif.gif";
import { Link } from "react-router-dom";

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
const PANELS_PER_PAGE = 24;

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

function coerceResponse(json: any): {
  counts: Counts;
  page_info: PageInfo;
  images: LinkDoc[];
} {
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
        matched_acq_ids:
          json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
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
        matched_acq_ids:
          json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
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
      matched_acq_ids:
        json.matched_acq_ids ?? new Set(images.map((i) => i.acq_id)).size,
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

function buildSearchUrlFlexible(
  input: string,
  page: number,
  per_page: number,
): string {
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
          new URLSearchParams(params).forEach((v, k) =>
            api.searchParams.append(k, v),
          );
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
        new URLSearchParams(params).forEach((v, k) =>
          api.searchParams.append(k, v),
        );
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

/* ===================== Pretty labels for filter tags ===================== */

const KEY_LABELS: Record<string, string> = {
  // Vehicle & Scene
  "b.vehicle": "Vehicle",
  "b.period": "Period",
  "b.condition": "Condition",
  "b.city": "City",
  "b.state": "State",
  "b.country": "Country",

  "l.left": "Left lane availability",
  "l.right": "Right lane availability",

  // Vehicle dynamics
  "c.v": "VehicleSpeed (km/h)",
  "c.swa": "SteeringWheelAngle",
  "c.brakes": "BrakeInfoStatus",

  // Perception (YOLO + SemSeg)
  "y.classes": "YOLO classes",
  "y.rel": "Position vs ego",
  "y.conf": "Confidence",
  "y.dist": "Distance (m)",

  // Environment (SemSeg)
  "s.building": "Building",
  "s.vegetation": "Vegetation",

  // Road context (Overpass)
  "o.highway": "Highway (groups)",
  "o.landuse": "Landuse (groups)",
  "o.lanes": "Lanes",
  "o.maxspeed": "Maxspeed (BR presets)",
  "o.oneway": "Oneway",
  "o.surface": "Surface",
  "o.sidewalk": "Sidewalk",
  "o.cycleway": "Cycleway",
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  // Vehicle & Scene
  "b.vehicle": {
    Captur: "Captur",
    "DAF CF 410": "DAF CF 410",
    Renegade: "Renegade",
  },
  "b.period": {
    day: "day",
    night: "night",
    dusk: "dusk",
    dawn: "dawn",
  },
  "b.condition": {
    "Clear sky": "Clear sky",
    "Mainly clear": "Mainly clear",
    "Partly cloudy": "Partly cloudy",
    Overcast: "Overcast",
    Fog: "Fog",
    "Fog (rime)": "Fog (rime)",
    "Drizzle: light": "Drizzle: light",
    "Drizzle: moderate": "Drizzle: moderate",
    "Drizzle: dense": "Drizzle: dense",
    "Rain: slight": "Rain: slight",
    "Rain: moderate": "Rain: moderate",
    "Rain: heavy": "Rain: heavy",
  },
  "l.left": {
    DISP: "Left available",
    INDISP: "Left unavailable",
  },
  "l.right": {
    DISP: "Right available",
    INDISP: "Right unavailable",
  },

  // Vehicle dynamics
  "c.swa": {
    STRAIGHT: "Straight",
    L_GENTLE: "Left · Gentle",
    L_MODERATE: "Left · Moderate",
    L_HARD: "Left · Hard",
    R_GENTLE: "Right · Gentle",
    R_MODERATE: "Right · Moderate",
    R_HARD: "Right · Hard",
  },
  "c.brakes": {
    not_pressed: "not_pressed",
    pressed: "pressed",
  },

  // Perception
  "y.classes": {
    car: "car",
    motorcycle: "motorcycle",
    bicycle: "bicycle",
    person: "person",
    heavy: "Heavy vehicles",
  },
  "y.rel": {
    EGO: "Ego lane",
    "L-1": "Left adjacent (L-1)",
    "R+1": "Right adjacent (R+1)",
    "OUT-L": "Outside left (OUT-L)",
    "OUT-R": "Outside right (OUT-R)",
  },
  "y.conf": {
    LOW: "Low %",
    MED: "Medium %",
    HIGH: "High %",
  },

  // Environment (SemSeg) – se você usar tokens, pode mapear aqui depois
  "s.building": {
    LOW: "Low %",
    MED: "Medium %",
    HIGH: "High %",
  },
  "s.vegetation": {
    LOW: "Low %",
    MED: "Medium %",
    HIGH: "High %",
  },

  // Road context
  "o.highway": {
    primary: "primary",
    primary_link: "primary_link",
    secondary: "secondary",
    secondary_link: "secondary_link",
    local: "local",
  },
  "o.landuse": {
    residential: "residential",
    commercial: "commercial",
    industrial: "industrial",
    agro: "agro",
  },
  "o.oneway": {
    yes: "yes",
    no: "no",
  },
  "o.surface": {
    paved: "paved",
    unpaved: "unpaved",
  },
  "o.sidewalk": {
    both: "both",
    left: "left",
    right: "right",
    no: "no",
  },
};

function autoPrettyKey(key: string): string {
  if (KEY_LABELS[key]) return KEY_LABELS[key];

  let k = key;
  k = k.replace(/^b\./, "block ");
  k = k.replace(/^c\./, "can ");
  k = k.replace(/^l\./, "lane ");
  k = k.replace(/^o\./, "osm ");
  k = k.replace(/^s\./, "semseg ");
  k = k.replace(/^y\./, "yolo ");

  return k
    .split(/[._]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function prettyValue(key: string, value: string): string {
  const dict = VALUE_LABELS[key];
  if (dict && dict[value] !== undefined) return dict[value];
  return value;
}

/* ===================== Filter tags from query ===================== */

function parseFilterTags(query: string | null): string[] {
  if (!query) return [];
  let qs = query.trim();

  try {
    if (qs.startsWith("http")) {
      const u = new URL(qs);
      if (u.search) {
        qs = u.search.slice(1);
      } else if (u.hash.includes("?")) {
        qs = u.hash.split("?")[1] ?? "";
      } else {
        qs = "";
      }
    } else if (qs.startsWith("#")) {
      const idx = qs.indexOf("?");
      qs = idx >= 0 ? qs.slice(idx + 1) : "";
    } else if (qs.startsWith("?")) {
      qs = qs.slice(1);
    } else if (!qs.includes("=")) {
      qs = "";
    }
  } catch {
    qs = "";
  }

  if (!qs) return [];
  const params = new URLSearchParams(qs);
  const ignore = new Set(["page", "per_page"]);
  const tags: string[] = [];

  params.forEach((value, key) => {
    if (ignore.has(key)) return;
    if (!value) return;

    const labelKey = autoPrettyKey(key);
    const labelValue = prettyValue(key, value);

    tags.push(`${labelKey}: ${labelValue}`);
  });

  return Array.from(new Set(tags));
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

  // contador do canto direito: x/5+ quando há 5 imagens (ou mais segundos)
  const shownCount = photosForUi.length;
  const denomLabel =
    shownCount === 5
      ? `${shownCount}+`
      : totalSecondsForAcq > shownCount
      ? `${shownCount}+`
      : `${shownCount}`;
  const currentLabel = `${idx + 1}/${denomLabel}`;

  const secLabel = formatSecLabel(photo.sec);

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden text-base">
      <div className="px-4 py-3 flex items-center justify-between bg-zinc-900/70 border-b border-zinc-800">
        <div className="text-base">
          <div className="font-semibold text-zinc-100">{acqLabel}</div>
        </div>
        <div className="text-sm text-yellow-400 font-semibold">{currentLabel}</div>
      </div>

      <div className="relative">
        <img
          key={`${group.acq_id}-${photo.sec}-${idx}-${stage}`}
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full aspect-[16/9] object-cover bg-zinc-800"
          onError={() =>
            setStage((s) => (s + 1 < candidates.length ? s + 1 : s))
          }
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

        {photosForUi.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {photosForUi.map((_, i) => {
              const active = i === idx;
              return (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full border ${
                    active
                      ? "bg-yellow-400 border-yellow-400"
                      : "border-yellow-400/60 bg-black/60"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-3 text-sm text-zinc-300 flex items-center justify-between border-t border-zinc-800">
        <span>sec: {secLabel}</span>
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

const View: React.FC = () => {
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
        // primeiro, tudo que já existia
        for (const g of prev) {
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

      if (!append) {
        setPanelPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicia uma nova busca (reset)
  const startNewSearch = (input: string) => {
    setCurrentQuery(input);
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
        startNewSearch(paramsWithQ);
      }
    }
  }, []);

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

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col text-white text-base">
      <Header />

      <div className="my-1 ml-3">
        <Link to={currentQuery ? `/search${currentQuery}` : "/search"}>
          <button className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto">
            ← Search
          </button>
        </Link>
      </div>

      <div className="p-4 flex flex-col items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-yellow-300">Acquisitions</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleGroups.map((g) => (
                <AcqPanel key={g.acq_id} group={g} />
              ))}
            </div>

            {/* Panel pagination + auto load from API */}
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
