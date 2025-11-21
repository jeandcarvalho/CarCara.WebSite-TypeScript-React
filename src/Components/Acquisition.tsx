// src/Components/Acquisition.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const API_BASE = "https://carcara-web-api.onrender.com";

type LinkDoc = {
  ext: string;
  link: string;
  sec: number | null;
};

type AcquisitionResponse = {
  acq_id: string;
  seconds: number[];
  links: LinkDoc[];
};

type PhotoItem = {
  ext: string;
  link: string;
  sec: number | null;
  timeLabel: string | null;
  thumbUrl: string;
  fullUrl: string;
};

const FILTER_LABELS: Record<string, string> = {
  "b.vehicle": "Vehicle",
  "b.period": "Period",
  "b.condition": "Condition",
  "b.city": "City",
  "b.state": "State",
  "b.country": "Country",
  "l.left": "Left lane",
  "l.right": "Right lane",
  "c.v": "Vehicle speed",
  "c.swa": "Steering angle",
  "c.brakes": "Brakes",
  "o.highway": "Highway",
  "o.landuse": "Land use",
  "o.surface": "Surface",
  "o.lanes": "Lanes",
  "o.maxspeed": "Max speed",
  "o.oneway": "Oneway",
  "o.sidewalk": "Sidewalk",
  "o.cycleway": "Cycleway",
  "s.building": "Buildings",
  "s.vegetation": "Vegetation",
};

const EXT_DOWNLOAD_ORDER = ["avi", "csv", "mf4", "blf"];

/* ========= Helpers: Google Drive & tempo ========= */

function extractDriveId(link: string | null): string | null {
  if (!link) return null;
  let match = link.match(/\/d\/([^/]+)\//);
  if (!match) {
    match = link.match(/[?&]id=([^&]+)/);
  }
  return match ? match[1] : null;
}

function getDrivePreviewUrl(link: string | null): string | null {
  const fileId = extractDriveId(link);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview?vq=hd1080`;
}

function getDriveThumbUrl(link: string | null): string | null {
  const fileId = extractDriveId(link);
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
}

function getDriveImageUrl(link: string | null): string | null {
  const fileId = extractDriveId(link);
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600-h1600`;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ================= Component ================= */

const Acquisition: React.FC = () => {
  const { acqId } = useParams<{ acqId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<AcquisitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  // Lightbox de fotos
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  /* -------- auth redirect -------- */
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  /* -------- fetch acquisition -------- */
  useEffect(() => {
    if (!acqId) return;
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const search = new URLSearchParams(location.search);
        search.set("acq_id", acqId);

        const url = `${API_BASE}/api/acquisition?${search.toString()}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          setErrorMsg(json.error || "Error loading acquisition data.");
          setLoading(false);
          return;
        }

        setData(json);
      } catch (err) {
        setErrorMsg("Connection error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [acqId, location.search, token]);

  /* -------- derivations (memo) -------- */

  const previewUrl = useMemo(() => {
    if (!data) return null;
    const avi =
      data.links.find((l) => l.ext === "avi" && l.sec == null) ||
      data.links.find((l) => l.ext === "avi");
    if (!avi) return null;
    return getDrivePreviewUrl(avi.link);
  }, [data]);

  const downloadLinks = useMemo(() => {
    if (!data) return [];
    return EXT_DOWNLOAD_ORDER.map((ext) => {
      const doc =
        data.links.find((l) => l.ext === ext && l.sec == null) ||
        data.links.find((l) => l.ext === ext);
      if (!doc) return null;
      return { ext: ext.toUpperCase(), link: doc.link };
    }).filter(Boolean) as { ext: string; link: string }[];
  }, [data]);

  const filterTags = useMemo(() => {
    const search = new URLSearchParams(location.search);
    const tags: { label: string; value: string }[] = [];

    search.forEach((value, key) => {
      if (!value) return;
      if (key === "page" || key === "per_page" || key === "acq_id") return;
      const label = FILTER_LABELS[key] || key;
      tags.push({ label, value });
    });

    return tags;
  }, [location.search]);

  const photos = useMemo<PhotoItem[]>(() => {
    if (!data) return [];
    const exts = new Set(["jpg", "jpeg", "png"]);
    return data.links
      .filter((l) => !!l.ext && exts.has(l.ext.toLowerCase()))
      .map((l) => {
        const thumbUrl = getDriveThumbUrl(l.link) || l.link;
        const fullUrl = getDriveImageUrl(l.link) || thumbUrl || l.link;
        return {
          ext: l.ext,
          link: l.link,
          sec: l.sec,
          timeLabel: l.sec != null ? formatTime(l.sec) : null,
          thumbUrl,
          fullUrl,
        };
      });
  }, [data]);

  const activePhoto =
    activePhotoIndex !== null && photos[activePhotoIndex]
      ? photos[activePhotoIndex]
      : null;

  /* -------- handlers lightbox -------- */

  const openPhoto = (index: number) => {
    setActivePhotoIndex(index);
  };

  const closePhoto = () => {
    setActivePhotoIndex(null);
  };

  const showPrevPhoto = () => {
    setActivePhotoIndex((prev) => {
      if (prev === null || photos.length === 0) return prev;
      return (prev - 1 + photos.length) % photos.length;
    });
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((prev) => {
      if (prev === null || photos.length === 0) return prev;
      return (prev + 1) % photos.length;
    });
  };

  /* ================= Render ================= */

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      {/* CONTEÚDO PRINCIPAL EMPURRANDO O FOOTER */}
      <div className="flex-1 flex flex-col mt-5">
        {/* topo / navegação */}


        {errorMsg && (
          <div className="mx-3 mb-2 bg-red-900 text-red-100 text-sm px-3 py-2 rounded border border-red-700">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-center px-2 sm:px-3 pb-6">
          {/* GRID:
              - mobile: 1 coluna (vídeo em cima, fotos embaixo)
              - lg+: 3 colunas, vídeo ocupa 2, fotos 1 */}
          <main className="w-full max-w-7xl grid gap-4 lg:grid-cols-3 items-start">
            {/* Vídeo + filtros + downloads */}
            <section className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col gap-4">
              <div className="w-full">
                <h2 className="text-lg sm:text-xl text-yellow-200 mb-2 break-all">
                  Acquisition {acqId}
                </h2>

                <div className="relative w-full rounded overflow-hidden bg-black aspect-video min-h-[180px] xs:min-h-[200px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[300px]">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-300 text-sm sm:text-base">
                        Loading video...
                      </p>
                    </div>
                  ) : previewUrl ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={previewUrl}
                      allow="fullscreen"
                      allowFullScreen
                      title={`Acquisition ${acqId} video`}
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-300 p-4 text-sm sm:text-base">
                        No AVI video found for this acquisition.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-3">
                  <h3 className="text-base sm:text-lg text-yellow-200 mb-2">
                    Active Filters
                  </h3>
                  {filterTags.length === 0 ? (
                    <p className="text-gray-400 text-xs sm:text-sm">
                      No filters applied.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filterTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-zinc-800 text-gray-100 text-[11px] sm:text-xs px-2 py-1 rounded-full border border-zinc-700"
                        >
                          <span className="font-semibold">{tag.label}:</span>{" "}
                          {tag.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-3">
                  <h3 className="text-base sm:text-lg text-yellow-200 mb-2">
                    Downloads
                  </h3>
                  {downloadLinks.length === 0 ? (
                    <p className="text-gray-400 text-xs sm:text-sm">
                      No download files found (AVI / CSV / MF4 / BLF).
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {downloadLinks.map((d) => (
                        <a
                          key={d.ext}
                          href={d.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-teal-900 hover:bg-teal-800 text-teal-100 text-[11px] sm:text-xs px-3 py-1 rounded-full border border-teal-700 font-semibold"
                        >
                          {d.ext}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Photos */}
            <section className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col">
              <h2 className="text-lg sm:text-xl text-yellow-200 mb-2">
                Photos
              </h2>

              {loading ? (
                <p className="text-gray-300 text-sm">Loading photos...</p>
              ) : photos.length === 0 ? (
                <p className="text-gray-300 text-sm">
                  No photos found for this acquisition.
                </p>
              ) : (
                <div className="border border-zinc-800 rounded p-2 bg-zinc-950 overflow-y-auto max-h-[14rem] xs:max-h-[16rem] sm:max-h-[20rem] md:max-h-[24rem] lg:max-h-[28rem] w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={`${photo.link}-${idx}`}
                        type="button"
                        onClick={() => openPhoto(idx)}
                        className="group flex flex-col items-center gap-1"
                      >
                        <div className="w-full aspect-video overflow-hidden rounded border border-zinc-800 bg-black">
                          <img
                            src={photo.thumbUrl}
                            alt={photo.timeLabel || "Frame"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        {photo.sec != null && (
                          <span className="text-[10px] sm:text-[11px] text-gray-300">
                            {formatTime(photo.sec)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>

        {/* Lightbox */}
        {activePhoto && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="max-w-5xl w-full px-3 sm:px-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-200 text-xs sm:text-sm">
                  {activePhoto.timeLabel
                    ? `Time: ${activePhoto.timeLabel}`
                    : "Photo"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={showPrevPhoto}
                    className="bg-zinc-800 hover:bg-zinc-700 text-gray-100 text-xs px-3 py-1 rounded-full"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={showNextPhoto}
                    className="bg-zinc-800 hover:bg-zinc-700 text-gray-100 text-xs px-3 py-1 rounded-full"
                  >
                    Next ▶
                  </button>
                  <button
                    onClick={closePhoto}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full"
                  >
                    Close ✕
                  </button>
                </div>
              </div>
              <div className="bg-black rounded-lg border border-zinc-700 overflow-hidden max-h-[80vh] flex items-center justify-center">
                <img
                  src={activePhoto.fullUrl}
                  alt={activePhoto.timeLabel || "Photo"}
                  className="max-h-[80vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SEMPRE NO FINAL */}
      <Footer />
    </div>
  );
};

export default Acquisition;
