// src/Components/Acquisition.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import {
  getDrivePreviewUrl,
  getDriveThumbUrl,
  getDriveImageUrl,
  parseFilterTagsFromSearch,
  EXT_DOWNLOAD_ORDER,
  FilterTag,
} from "./AcquisitionHelpers";

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

type AcqIdsResponse = {
  page: number;
  per_page: number;
  has_more: boolean;
  total?: number;
  total_pages?: number;
  acq_ids: string[];
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const Acquisition: React.FC = () => {
  const { acqId } = useParams<{ acqId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<AcquisitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  const [mainMode, setMainMode] = useState<"video" | "photo">("video");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // lista de acq_ids que batem com os mesmos filtros (sem acq_id)
  const [acqNav, setAcqNav] = useState<AcqIdsResponse | null>(null);
  const [acqNavLoading, setAcqNavLoading] = useState(false);
  const [acqNavError, setAcqNavError] = useState("");

  // fetch acquisition data
  useEffect(() => {
    if (!acqId) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const search = new URLSearchParams(location.search);
        search.set("acq_id", acqId);

        const url = `${API_BASE}/api/acquisition?${search.toString()}`;

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          headers,
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

  // fetch acq_ids list (navigation) based on filters only
  useEffect(() => {
    const fetchAcqNav = async () => {
      setAcqNavLoading(true);
      setAcqNavError("");

      try {
        const params = new URLSearchParams(location.search);
        params.delete("acq_id");

        // evita query gigante sem filtros (match vazio no Mongo)
        const hasFilters = Array.from(params.keys()).some((k) => {
          if (k === "page" || k === "per_page") return false;
          const v = params.get(k);
          return !!v;
        });

        if (!hasFilters) {
          setAcqNav(null);
          setAcqNavLoading(false);
          return;
        }

        const url = new URL(`${API_BASE}/api/search-acq-ids`);
        params.forEach((value, key) => {
          if (value) url.searchParams.append(key, value);
        });

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url.toString(), {
          headers,
        });
        const json = await res.json();

        if (!res.ok) {
          setAcqNavError(json.error || "Error loading acquisitions list.");
          setAcqNav(null);
        } else {
          setAcqNav(json);
        }
      } catch (err) {
        setAcqNavError("Connection error while loading acquisitions list.");
        setAcqNav(null);
      } finally {
        setAcqNavLoading(false);
      }
    };

    fetchAcqNav();
  }, [location.search, token]);

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

  const filterTags = useMemo<FilterTag[]>(
    () => parseFilterTagsFromSearch(location.search),
    [location.search]
  );

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

  const activePhoto = useMemo(() => {
    if (activePhotoIndex === null) return null;
    if (!photos[activePhotoIndex]) return null;
    return photos[activePhotoIndex];
  }, [activePhotoIndex, photos]);

  const acqList = acqNav?.acq_ids ?? [];
  const currentIndex = useMemo(() => {
    if (!acqId || !acqList.length) return -1;
    return acqList.indexOf(acqId);
  }, [acqId, acqList]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < acqList.length - 1;

  const isLogged = !!token;

  const openPhotoInMainPanel = (index: number) => {
    setActivePhotoIndex(index);
    setMainMode("photo");
  };

  const backToVideo = () => {
    setMainMode("video");
  };

  const goToPhoto = (direction: 1 | -1) => {
    if (photos.length === 0) return;
    if (activePhotoIndex === null) return;
    const total = photos.length;
    const nextIndex = (activePhotoIndex + direction + total) % total;
    setActivePhotoIndex(nextIndex);
  };

  const goToAcq = (targetId: string | null) => {
    if (!targetId) return;
    navigate(`/acquisition/${targetId}${location.search}`);
  };

  const goPrevAcq = () => {
    if (!hasPrev) return;
    const targetId = acqList[currentIndex - 1];
    goToAcq(targetId);
  };

  const goNextAcq = () => {
    if (!hasNext) return;
    const targetId = acqList[currentIndex + 1];
    goToAcq(targetId);
  };

  const goBackToView = () => {
    const params = new URLSearchParams(location.search);
    params.delete("acq_id");
    const qs = params.toString();
    navigate(`/View${qs ? `?${qs}` : ""}`);
  };

  const goToFirstPhoto = () => {
    if (photos.length === 0) return;
    setActivePhotoIndex(0);
    setMainMode("photo");
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col mt-5">
        {errorMsg && (
          <div className="mx-3 mb-2 bg-red-900 text-red-100 text-sm px-3 py-2 rounded border border-red-700">
            {errorMsg}
          </div>
        )}
        {acqNavError && (
          <div className="mx-3 mb-2 bg-red-900 text-red-100 text-xs px-3 py-1 rounded border border-red-700">
            {acqNavError}
          </div>
        )}

        <div className="flex justify-center px-2 sm:px-3 pb-6">
          <main className="w-full max-w-7xl grid gap-4 lg:grid-cols-3 items-start">
            <section className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col gap-4">
              <div className="w-full">
                {/* NAV / CONTROLS */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="mt-1 flex items-start justify-between text-[11px] sm:text-xs text-gray-200 gap-2">
                    {/* Left column: Back to View + Previous */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={goBackToView}
                        className="inline-flex items-center text-[11px] sm:text-xs px-2 py-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-gray-200"
                      >
                        ← Back to View
                      </button>

                      {acqList.length > 0 && currentIndex >= 0 && (
                        <button
                          type="button"
                          onClick={goPrevAcq}
                          disabled={!hasPrev}
                          className={`px-3 py-1 rounded-full border ${
                            hasPrev
                              ? "border-zinc-600 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                              : "border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                          }`}
                        >
                          ← Previous
                        </button>
                      )}
                    </div>

                    {/* Middle: acquisition counter */}
                    {acqList.length > 0 && currentIndex >= 0 && (
                      <div className="flex-1 text-center mt-4 sm:mt-3">
                        <span>
                          Acquisition {currentIndex + 1} of{" "}
                          {acqNav?.total ?? acqList.length}
                        </span>
                      </div>
                    )}

                    {/* Right column: Go to photos / Back to video + Next */}
                    <div className="flex flex-col gap-1 items-end">
                      {acqList.length > 0 && currentIndex >= 0 && (
                        <>
                          {mainMode === "photo" ? (
                            <button
                              type="button"
                              onClick={backToVideo}
                              className="px-3 py-1 rounded-full border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-gray-100"
                            >
                              Back to video
                            </button>
                          ) : photos.length > 0 ? (
                            <button
                              type="button"
                              onClick={goToFirstPhoto}
                              className="px-3 py-1 rounded-full border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-gray-100"
                            >
                              Go to photos
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={goNextAcq}
                            disabled={!hasNext}
                            className={`px-3 py-1 rounded-full border ${
                              hasNext
                                ? "border-zinc-600 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                                : "border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                            }`}
                          >
                            Next →
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {acqNavLoading && (
                    <p className="text-xs text-gray-400">
                      Loading acquisition list...
                    </p>
                  )}
                </div>

                {/* MAIN PANEL: VIDEO / PHOTO */}
                <div className="relative w-full rounded overflow-hidden bg-black aspect-video min-h-[180px] xs:min-h-[200px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[300px]">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-300 text-sm sm:text-base">
                        Loading...
                      </p>
                    </div>
                  ) : mainMode === "photo" && activePhoto ? (
                    <>
                      <img
                        src={activePhoto.fullUrl}
                        alt={activePhoto.timeLabel || "Photo"}
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      />
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => goToPhoto(-1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-900/70 hover:bg-zinc-800/90 text-gray-100 text-xl sm:text-2xl px-2 py-1 rounded-full border border-zinc-700"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => goToPhoto(1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900/70 hover:bg-zinc-800/90 text-gray-100 text-xl sm:text-2xl px-2 py-1 rounded-full border border-zinc-700"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2 right-2 bg-zinc-900/80 text-gray-100 text-xs sm:text-sm px-2 py-1 rounded-full border border-zinc-700">
                            {activePhotoIndex !== null &&
                              `${activePhotoIndex + 1} / ${photos.length}`}
                          </div>
                        </>
                      )}
                    </>
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
                          {tag.label}
                          {tag.value && (
                            <>
                              <span className="font-semibold">: </span>
                              {tag.value}
                            </>
                          )}
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

            <section className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h2 className="text-lg sm:text-xl text-yellow-200">
                  Photos{photos.length > 0 ? ` (${photos.length})` : ""}
                </h2>
                {photos.length > 0 && activePhotoIndex !== null && (
                  <span className="text-[11px] sm:text-xs text-gray-300">
                    Viewing {activePhotoIndex + 1} / {photos.length}
                  </span>
                )}
              </div>

              {loading ? (
                <p className="text-gray-300 text-sm">Loading photos...</p>
              ) : photos.length === 0 ? (
                <>
                  {!isLogged && (
                    <p className="text-gray-400 text-[11px] sm:text-xs mb-1">
                      Log in to manage your own collections and save favorite acquisitions.
                    </p>
                  )}
                  <p className="text-gray-300 text-sm">
                    No photos found for this acquisition.
                  </p>
                </>
              ) : (
                <div className="border border-zinc-800 rounded p-2 bg-zinc-950 overflow-y-auto max-h-[28rem] xs:max-h-[32rem] sm:max-h-[26rem] md:max-h-[26rem] lg:max-h-[30rem] w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {photos.map((photo, idx) => {
                      const isActive =
                        mainMode === "photo" && activePhotoIndex === idx;
                      return (
                        <button
                          key={`${photo.link}-${idx}`}
                          type="button"
                          onClick={() => openPhotoInMainPanel(idx)}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-full aspect-video overflow-hidden rounded border  ${
                              isActive
                                ? "border-yellow-400 ring-2 ring-yellow-400/70"
                                : "border-zinc-800"
                            } bg-black`}
                          >
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
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Acquisition;
