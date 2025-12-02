// src/Components/CollectionDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { thumbUrl, fullImageUrl } from "../Components/Acquisition/AcquisitionHelpers";

const API_BASE = "https://carcara-web-api.onrender.com";
const SECONDS_WITH_LINKS_URL = (collectionId: string) =>
  `${API_BASE}/collections/${collectionId}/seconds-with-links`;

type CollectionImageLink = {
  sec: number;
  ext: string;
  link: string;
};

type CollectionFileLink = {
  ext: string;
  link: string;
};

type CollectionSecondsWithLinksItem = {
  acq_id: string;
  secs: number[];
  images: CollectionImageLink[];
  files: CollectionFileLink[];
};

type CollectionSecondsWithLinksResult = {
  collectionId: string;
  name: string;
  description: string | null;
  items: CollectionSecondsWithLinksItem[];
};

type ViewMode = "photos" | "acq";

type PhotoItem = {
  acq_id: string;
  sec: number;
  imageLink: string;
};

type AcqCard = {
  acq_id: string;
  secsCount: number;
  imagesCount: number;
  previewLink: string | null;
  files: CollectionFileLink[];
};

type ViewerContext = "all" | "acq";

const PHOTOS_PER_PAGE = 24;

const CollectionDetails: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<CollectionSecondsWithLinksResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  // Redirect se não tiver logado
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  // Query params: mode, page, acq
  const searchParams = new URLSearchParams(location.search);
  const modeParam = searchParams.get("mode");
  const viewMode: ViewMode = modeParam === "acq" ? "acq" : "photos";

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const selectedAcq = searchParams.get("acq") || null;

  const updateQueryParams = (updates: {
    mode?: ViewMode;
    page?: number;
    acq?: string | null;
  }) => {
    const params = new URLSearchParams(location.search);

    if (updates.mode) {
      params.set("mode", updates.mode);
    }

    if (updates.page !== undefined) {
      params.set("page", String(updates.page));
    }

    if (updates.acq !== undefined) {
      if (updates.acq === null || updates.acq === "") {
        params.delete("acq");
      } else {
        params.set("acq", updates.acq);
      }
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: false }
    );
  };

  // Busca segundos + links da coleção
  useEffect(() => {
    if (!collectionId || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(SECONDS_WITH_LINKS_URL(collectionId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error || "Error loading collection data.");
          setData(null);
          return;
        }

        setData(json as CollectionSecondsWithLinksResult);
      } catch (err) {
        setErrorMsg("Connection error.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId, token]);

  // Lista “flatten” de todas as fotos (acq + sec)
  const allPhotos: PhotoItem[] = useMemo(() => {
    if (!data) return [];

    const result: PhotoItem[] = [];

    for (const item of data.items) {
      // sec -> primeiro link dessa sec
      const imagesBySec = new Map<number, string>();

      const sortedImages = [...item.images].sort((a, b) => a.sec - b.sec);
      for (const img of sortedImages) {
        if (!imagesBySec.has(img.sec)) {
          imagesBySec.set(img.sec, img.link);
        }
      }

      const secsSorted = Array.from(imagesBySec.keys()).sort((a, b) => a - b);

      for (const sec of secsSorted) {
        const link = imagesBySec.get(sec);
        if (!link) continue;

        result.push({
          acq_id: item.acq_id,
          sec,
          imageLink: link,
        });
      }
    }

    // Ordena por acq_id e depois sec
    result.sort((a, b) => {
      if (a.acq_id < b.acq_id) return -1;
      if (a.acq_id > b.acq_id) return 1;
      return a.sec - b.sec;
    });

    return result;
  }, [data]);

  // Cards por acquisition (mosaico de acq_id)
  const acqCards: AcqCard[] = useMemo(() => {
    if (!data) return [];

    return data.items.map((item) => {
      const imagesSorted = [...item.images].sort((a, b) => a.sec - b.sec);
      const previewLink = imagesSorted.length > 0 ? imagesSorted[0].link : null;

      return {
        acq_id: item.acq_id,
        secsCount: item.secs.length,
        imagesCount: item.images.length,
        previewLink,
        files: item.files,
      };
    });
  }, [data]);

  // Fotos só do acq selecionado (modo acq + ?acq=...)
  const selectedAcqPhotos: PhotoItem[] = useMemo(() => {
    if (!data || !selectedAcq) return [];

    const item = data.items.find((it) => it.acq_id === selectedAcq);
    if (!item) return [];

    const imagesBySec = new Map<number, string>();
    const sortedImages = [...item.images].sort((a, b) => a.sec - b.sec);

    for (const img of sortedImages) {
      if (!imagesBySec.has(img.sec)) {
        imagesBySec.set(img.sec, img.link);
      }
    }

    const secsSorted = Array.from(imagesBySec.keys()).sort((a, b) => a - b);

    const result: PhotoItem[] = [];
    for (const sec of secsSorted) {
      const link = imagesBySec.get(sec);
      if (!link) continue;
      result.push({
        acq_id: item.acq_id,
        sec,
        imageLink: link,
      });
    }

    return result;
  }, [data, selectedAcq]);

  // Stats
  const totalAcq = data?.items.length ?? 0;
  const totalSecs =
    data?.items.reduce((sum, it) => sum + it.secs.length, 0) ?? 0;
  const totalImages =
    data?.items.reduce((sum, it) => sum + it.images.length, 0) ?? 0;

  // Paginação do modo “photos”
  const totalPages =
    allPhotos.length === 0
      ? 1
      : Math.max(1, Math.ceil(allPhotos.length / PHOTOS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const photosForCurrentPage = useMemo(() => {
    if (viewMode !== "photos") return [];
    const start = (currentPage - 1) * PHOTOS_PER_PAGE;
    const end = start + PHOTOS_PER_PAGE;
    return allPhotos.slice(start, end);
  }, [viewMode, allPhotos, currentPage]);

  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerContext, setViewerContext] = useState<ViewerContext>("all");
  const [viewerIndex, setViewerIndex] = useState(0);

  const viewerList: PhotoItem[] =
    viewerContext === "all" ? allPhotos : selectedAcqPhotos;

  useEffect(() => {
    if (viewerIndex >= viewerList.length) {
      setViewerIndex(viewerList.length > 0 ? viewerList.length - 1 : 0);
    }
  }, [viewerList, viewerIndex]);

  const openViewerFromAll = (globalIndex: number) => {
    setViewerContext("all");
    setViewerIndex(globalIndex);
    setViewerOpen(true);
  };

  const openViewerFromAcq = (index: number) => {
    setViewerContext("acq");
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const goPrev = () => {
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    setViewerIndex((prev) =>
      prev < viewerList.length - 1 ? prev + 1 : prev
    );
  };

  if (!collectionId) {
    return <div>Missing collection id.</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-6xl py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-300 mb-2 hover:underline"
          >
            ← Back to My Account
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h1 className="text-3xl font-medium text-yellow-300">
                {data?.name || "Collection"}
              </h1>
              {data?.description && (
                <p className="text-gray-300 text-sm mt-1">
                  {data.description}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {totalAcq} acquisitions · {totalSecs} seconds · {totalImages}{" "}
                images
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateQueryParams({ mode: "photos", page: 1, acq: null })
                }
                className={`px-3 py-1 rounded text-sm font-semibold border ${
                  viewMode === "photos"
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "bg-zinc-800 text-gray-200 border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Photos view
              </button>
              <button
                onClick={() =>
                  updateQueryParams({ mode: "acq", page: 1, acq: null })
                }
                className={`px-3 py-1 rounded text-sm font-semibold border ${
                  viewMode === "acq"
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "bg-zinc-800 text-gray-200 border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Acquisitions view
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-zinc-900 border border-red-700 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {loading && (
            <p className="text-gray-300 mb-4">Loading collection data…</p>
          )}

          {!loading && data && data.items.length === 0 && (
            <p className="text-gray-300">
              This collection is empty. Add items from the Highlights panel.
            </p>
          )}

          {/* Modo PHOTOS: todas as fotos, paginado */}
          {!loading && data && viewMode === "photos" && allPhotos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-300 text-sm">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * PHOTOS_PER_PAGE +
                      1 <= allPhotos.length
                      ? (currentPage - 1) * PHOTOS_PER_PAGE + 1
                      : allPhotos.length}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold">
                    {Math.min(
                      currentPage * PHOTOS_PER_PAGE,
                      allPhotos.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">{allPhotos.length}</span>{" "}
                  photos
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() =>
                      updateQueryParams({
                        page: Math.max(1, currentPage - 1),
                      })
                    }
                    className={`px-2 py-1 rounded text-xs border ${
                      currentPage <= 1
                        ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                        : "border-zinc-700 text-gray-200 hover:bg-zinc-800"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-xs">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      updateQueryParams({
                        page: Math.min(totalPages, currentPage + 1),
                      })
                    }
                    className={`px-2 py-1 rounded text-xs border ${
                      currentPage >= totalPages
                        ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                        : "border-zinc-700 text-gray-200 hover:bg-zinc-800"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {photosForCurrentPage.map((p, idx) => {
                  const globalIndex =
                    (currentPage - 1) * PHOTOS_PER_PAGE + idx;
                  return (
                    <button
                      key={`${p.acq_id}-${p.sec}-${idx}`}
                      className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden text-left hover:border-yellow-500 transition"
                      onClick={() => openViewerFromAll(globalIndex)}
                    >
                      <div className="relative w-full h-32">
                        <img
                          src={thumbUrl(p.imageLink)}
                          alt={`${p.acq_id} sec ${p.sec}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2 py-1">
                        <p className="text-xs text-yellow-100 truncate">
                          {p.acq_id}
                        </p>
                        <p className="text-[10px] text-gray-300">
                          sec {p.sec}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Modo ACQ: mosaico de acq_id e depois fotos por acq */}
          {!loading && data && viewMode === "acq" && (
            <section className="mt-4">
              {!selectedAcq && (
                <>
                  <p className="text-gray-300 text-sm mb-3">
                    Click an acquisition to view only the photos from that
                    acq_id.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {acqCards.map((card) => (
                      <div
                        key={card.acq_id}
                        className="bg-zinc-900 border border-zinc-800 rounded p-3 flex flex-col"
                      >
                        <button
                          onClick={() =>
                            updateQueryParams({
                              mode: "acq",
                              acq: card.acq_id,
                              page: 1,
                            })
                          }
                          className="text-left"
                        >
                          <div className="w-full h-32 mb-2 rounded overflow-hidden border border-zinc-800 bg-zinc-950">
                            {card.previewLink ? (
                              <img
                                src={thumbUrl(card.previewLink)}
                                alt={card.acq_id}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                No preview image
                              </div>
                            )}
                          </div>
                          <p className="text-yellow-100 font-semibold truncate">
                            {card.acq_id}
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            {card.secsCount} seconds · {card.imagesCount} images
                          </p>
                        </button>

                        {card.files.length > 0 && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-xs mb-1">
                              Files for this acquisition:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {card.files.map((f) => (
                                <a
                                  key={f.ext}
                                  href={f.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] px-2 py-1 border border-zinc-700 rounded hover:border-yellow-500 text-gray-200"
                                >
                                  {f.ext.toUpperCase()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedAcq && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <button
                        onClick={() =>
                          updateQueryParams({ mode: "acq", acq: null, page: 1 })
                        }
                        className="text-xs text-gray-300 hover:underline"
                      >
                        ← Back to acquisitions
                      </button>
                      <h2 className="text-xl text-yellow-200 mt-1">
                        Acquisition {selectedAcq}
                      </h2>
                      <p className="text-gray-400 text-xs">
                        {selectedAcqPhotos.length} photos
                      </p>
                    </div>
                  </div>

                  {selectedAcqPhotos.length === 0 ? (
                    <p className="text-gray-300">
                      No images were found for this acquisition in this
                      collection.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedAcqPhotos.map((p, idx) => (
                        <button
                          key={`${p.acq_id}-${p.sec}-${idx}`}
                          className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden text-left hover:border-yellow-500 transition"
                          onClick={() => openViewerFromAcq(idx)}
                        >
                          <div className="relative w-full h-32">
                            <img
                              src={thumbUrl(p.imageLink)}
                              alt={`${p.acq_id} sec ${p.sec}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="px-2 py-1">
                            <p className="text-xs text-yellow-100 truncate">
                              {p.acq_id}
                            </p>
                            <p className="text-[10px] text-gray-300">
                              sec {p.sec}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <Footer />

      {/* Viewer fullscreen */}
      {viewerOpen && viewerList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/70 border-b border-zinc-800">
            <div className="text-xs text-gray-200">
              <span className="font-semibold">
                {viewerList[viewerIndex].acq_id}
              </span>{" "}
              · sec {viewerList[viewerIndex].sec} · {viewerIndex + 1} /{" "}
              {viewerList.length}
            </div>
            <button
              onClick={closeViewer}
              className="text-sm text-gray-300 hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <button
              onClick={goPrev}
              disabled={viewerIndex === 0}
              className={`mx-2 px-2 py-1 rounded border text-sm ${
                viewerIndex === 0
                  ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
                  : "border-zinc-600 text-gray-200 hover:bg-zinc-800"
              }`}
            >
              ← Previous
            </button>

            <div className="max-w-5xl max-h-[80vh] mx-4">
              <img
                src={fullImageUrl(viewerList[viewerIndex].imageLink)}
                alt={`${viewerList[viewerIndex].acq_id} sec ${
                  viewerList[viewerIndex].sec
                }`}
                className="max-w-full max-h-[80vh] object-contain rounded border border-zinc-700 bg-black"
              />
            </div>

            <button
              onClick={goNext}
              disabled={viewerIndex >= viewerList.length - 1}
              className={`mx-2 px-2 py-1 rounded border text-sm ${
                viewerIndex >= viewerList.length - 1
                  ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
                  : "border-zinc-600 text-gray-200 hover:bg-zinc-800"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;
