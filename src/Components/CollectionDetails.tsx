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

const PHOTOS_PER_PAGE = 60;

type ParsedAcqId = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

function parseAcqId(acq_id: string): ParsedAcqId | null {
  if (!/^\d{14}$/.test(acq_id)) return null;
  const year = acq_id.slice(0, 4);
  const month = acq_id.slice(4, 6);
  const day = acq_id.slice(6, 8);
  const hour = acq_id.slice(8, 10);
  const minute = acq_id.slice(10, 12);
  const second = acq_id.slice(12, 14);
  return { year, month, day, hour, minute, second };
}

// Completo: "DD/MM/YYYY HH:MM:SS"
function formatAcqId(acq_id: string): string {
  const p = parseAcqId(acq_id);
  if (!p) return acq_id;
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

// Só data: "DD/MM/YYYY"
function formatAcqIdDate(acq_id: string): string {
  const p = parseAcqId(acq_id);
  if (!p) return acq_id;
  return `${p.day}/${p.month}/${p.year}`;
}

// Só hora: "HH:MM:SS"
function formatAcqIdTime(acq_id: string): string {
  const p = parseAcqId(acq_id);
  if (!p) return "";
  return `${p.hour}:${p.minute}:${p.second}`;
}

// helpers locais para add/remove itens na coleção
async function addItemToCollectionApi(
  collectionId: string,
  acqId: string,
  sec: number,
  token: string
): Promise<void> {
  await fetch(`${API_BASE}/collections/${collectionId}/items/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [{ acq_id: acqId, sec }],
    }),
  });
}

async function removeItemFromCollectionApi(
  collectionId: string,
  acqId: string,
  sec: number,
  token: string
): Promise<void> {
  await fetch(`${API_BASE}/collections/${collectionId}/items/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [{ acq_id: acqId, sec }],
    }),
  });
}

async function addManyItemsToCollectionApi(
  collectionId: string,
  items: { acq_id: string; sec: number }[],
  token: string
): Promise<void> {
  if (!items.length) return;
  await fetch(`${API_BASE}/collections/${collectionId}/items/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
}

async function removeManyItemsFromCollectionApi(
  collectionId: string,
  items: { acq_id: string; sec: number }[],
  token: string
): Promise<void> {
  if (!items.length) return;
  await fetch(`${API_BASE}/collections/${collectionId}/items/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
}

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
  // Default agora é Acquisition Manager
  const viewMode: ViewMode = modeParam === "photos" ? "photos" : "acq";

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

  // BOTÃO BACK TO MY ACCOUNT: ir direto pra /account com estilo do Back to View
  const goBackToAccount = () => {
    navigate("/account");
  };

  // --- EDIT MODE (mosaico da acquisition) ---

  const [editMode, setEditMode] = useState(false); // edit dentro da acquisition
  const [acqEditMode, setAcqEditMode] = useState(false); // edit geral de acquisitions
  const [membershipSet, setMembershipSet] = useState<Set<string>>(
    () => new Set()
  );
  const [editError, setEditError] = useState("");

  // helper pra chave única de cada foto
  const makeKey = (acq_id: string, sec: number) => `${acq_id}-${sec}`;

  // sempre que trocar acquisition selecionada ou dados, reseta membership
  useEffect(() => {
    if (!selectedAcq || selectedAcqPhotos.length === 0) {
      setMembershipSet(new Set());
      setEditMode(false); // agora NÃO liga sozinho
      setEditError("");
      return;
    }

    const next = new Set<string>();
    selectedAcqPhotos.forEach((p) => {
      next.add(makeKey(p.acq_id, p.sec));
    });
    setMembershipSet(next);
    // deixa editMode false por padrão, usuário que liga
    setEditMode(false);
    setEditError("");
  }, [selectedAcq, selectedAcqPhotos]);

  const handleTogglePhotoInCollection = async (photo: PhotoItem) => {
    if (!token || !collectionId || !selectedAcq) return;

    const key = makeKey(photo.acq_id, photo.sec);
    const isInCollection = membershipSet.has(key);

    // optimistic
    setMembershipSet((prev) => {
      const next = new Set(prev);
      if (isInCollection) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setEditError("");

    try {
      if (isInCollection) {
        await removeItemFromCollectionApi(collectionId, photo.acq_id, photo.sec, token);
      } else {
        await addItemToCollectionApi(collectionId, photo.acq_id, photo.sec, token);
      }
    } catch (err) {
      // reverte em caso de erro
      setMembershipSet((prev) => {
        const next = new Set(prev);
        if (isInCollection) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
      setEditError("Error updating this photo in the collection.");
    }
  };

  // Remove todos os itens de UMA acquisition (modo geral, lista de aquisições)
  const handleRemoveAllFromAcquisition = async (acqId: string) => {
    if (!token || !collectionId || !data) return;

    const item = data.items.find((it) => it.acq_id === acqId);
    if (!item || item.secs.length === 0) return;

    const confirmRemove = window.confirm(
      "Are you sure you want to remove all photos from this acquisition in this collection? This action cannot be undone."
    );
    if (!confirmRemove) return;

    const itemsPayload = item.secs.map((sec) => ({ acq_id: acqId, sec }));

    setEditError("");

    try {
      await removeManyItemsFromCollectionApi(collectionId, itemsPayload, token);

      // atualiza data local removendo essa acquisition (ou limpando)
      setData((prev) => {
        if (!prev) return prev;
        const newItems = prev.items
          .map((it) =>
            it.acq_id === acqId ? { ...it, secs: [], images: [] } : it
          )
          .filter((it) => it.secs.length > 0 || it.images.length > 0);
        return { ...prev, items: newItems };
      });
    } catch (err) {
      setEditError("Error removing all photos from this acquisition.");
    }
  };

  // Remove todas as fotos da acquisition atual (modo dentro da acquisition)
  const handleRemoveAllInSelectedAcq = async () => {
    if (!token || !collectionId || !selectedAcq || selectedAcqPhotos.length === 0)
      return;

    const photosInCollection = selectedAcqPhotos.filter((p) =>
      membershipSet.has(makeKey(p.acq_id, p.sec))
    );
    if (!photosInCollection.length) return;

    const confirmRemove = window.confirm(
      "Are you sure you want to remove all photos from this acquisition in this collection? This action cannot be undone."
    );
    if (!confirmRemove) return;

    const itemsPayload = photosInCollection.map((p) => ({
      acq_id: p.acq_id,
      sec: p.sec,
    }));

    setEditError("");
    // otimista: remove todas do membership
    setMembershipSet((prev) => {
      const next = new Set(prev);
      photosInCollection.forEach((p) =>
        next.delete(makeKey(p.acq_id, p.sec))
      );
      return next;
    });

    try {
      await removeManyItemsFromCollectionApi(collectionId, itemsPayload, token);
    } catch (err) {
      // reverte
      setMembershipSet((prev) => {
        const next = new Set(prev);
        photosInCollection.forEach((p) =>
          next.add(makeKey(p.acq_id, p.sec))
        );
        return next;
      });
      setEditError("Error removing all photos from this acquisition.");
    }
  };

  // Adiciona todas as fotos (que estavam removidas) na acquisition atual
  const handleAddAllInSelectedAcq = async () => {
    if (!token || !collectionId || !selectedAcq || selectedAcqPhotos.length === 0)
      return;

    const photosNotInCollection = selectedAcqPhotos.filter(
      (p) => !membershipSet.has(makeKey(p.acq_id, p.sec))
    );
    if (!photosNotInCollection.length) return;

    const itemsPayload = photosNotInCollection.map((p) => ({
      acq_id: p.acq_id,
      sec: p.sec,
    }));

    setEditError("");
    // otimista: adiciona todas no membership
    setMembershipSet((prev) => {
      const next = new Set(prev);
      photosNotInCollection.forEach((p) =>
        next.add(makeKey(p.acq_id, p.sec))
      );
      return next;
    });

    try {
      await addManyItemsToCollectionApi(collectionId, itemsPayload, token);
    } catch (err) {
      // reverte
      setMembershipSet((prev) => {
        const next = new Set(prev);
        photosNotInCollection.forEach((p) =>
          next.delete(makeKey(p.acq_id, p.sec))
        );
        return next;
      });
      setEditError("Error adding all photos back to this acquisition.");
    }
  };

  if (!collectionId) {
    return <div>Missing collection id.</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-6xl py-4">
          {/* Back to My Account com estilo do Back to View */}
          <button
            type="button"
            onClick={goBackToAccount}
            className="inline-flex items-center text-[11px] sm:text-xs px-2 py-1 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-gray-200 mb-3"
          >
            ← Back to My Account
          </button>

          {/* Big panel englobando toda a visualização da coleção */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
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
                  Highlights Mosaic
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
                  Acquisition Manager
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-zinc-900 border border-red-700 text-red-100 p-2 rounded">
                {errorMsg}
              </div>
            )}

            {loading && (
              <p className="text-gray-300">Loading collection data…</p>
            )}

            {!loading && data && data.items.length === 0 && (
              <p className="text-gray-300">
                This collection is empty. Add items from the Highlights panel.
              </p>
            )}

            {/* Modo PHOTOS: todas as fotos, paginado */}
            {!loading &&
              data &&
              viewMode === "photos" &&
              allPhotos.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-sm">
                      Showing{" "}
                      <span className="font-semibold">
                        {(currentPage - 1) * PHOTOS_PER_PAGE + 1 <=
                        allPhotos.length
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

                  {/* thumbs ainda menores, mais colunas → mais fotos por tela */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-[6px]">
                    {photosForCurrentPage.map((p, idx) => {
                      const globalIndex =
                        (currentPage - 1) * PHOTOS_PER_PAGE + idx;
                      const dateLabel = formatAcqIdDate(p.acq_id);
                      const timeLabel = formatAcqIdTime(p.acq_id);

                      return (
                        <button
                          key={`${p.acq_id}-${p.sec}-${idx}`}
                          className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden text-left hover:border-yellow-500 transition"
                          onClick={() => openViewerFromAll(globalIndex)}
                        >
                          <div className="relative w-full h-16">
                            <img
                              src={thumbUrl(p.imageLink)}
                              alt={`${formatAcqId(p.acq_id)} · sec ${p.sec}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="px-1.5 py-1">
                            <p className="text-[9px] text-yellow-100 truncate">
                              {dateLabel}
                            </p>
                            <p className="text-[9px] text-gray-300 truncate">
                              {timeLabel
                                ? `${timeLabel} · sec ${p.sec}`
                                : `sec ${p.sec}`}
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
              <section className="mt-2">
                {!selectedAcq && (
                  <>
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <p className="text-gray-300 text-sm">
                        Click an acquisition to view and edit only the photos
                        from that acq_id.
                      </p>
                      {acqCards.length > 0 && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => setAcqEditMode((prev) => !prev)}
                            className={`px-3 py-1 rounded-full border text-xs ${
                              acqEditMode
                                ? "border-teal-500 bg-teal-900 text-teal-100 hover:bg-teal-800"
                                : "border-zinc-600 bg-zinc-800 text-gray-100 hover:bg-zinc-700"
                            }`}
                          >
                            {acqEditMode
                              ? "Done editing acquisitions"
                              : "Edit acquisitions"}
                          </button>
                          {acqEditMode && (
                            <p className="text-[10px] text-gray-400 text-right max-w-xs">
                              In acquisition edit mode, use “Remove all” on a
                              card to delete all photos from that acquisition in
                              this collection.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {acqCards.map((card) => (
                        <div
                          key={card.acq_id}
                          className={`bg-zinc-950 rounded p-3 flex flex-col border ${
                            acqEditMode ? "border-zinc-700" : "border-zinc-800"
                          }`}
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
                                  alt={formatAcqId(card.acq_id)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                  No preview image
                                </div>
                              )}
                            </div>
                            <p className="text-yellow-100 font-semibold truncate">
                              {formatAcqId(card.acq_id)}
                            </p>
                            <p className="text-gray-300 text-xs mt-1">
                              {card.secsCount} seconds · {card.imagesCount}{" "}
                              images
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

                          {acqEditMode && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAllFromAcquisition(card.acq_id)
                              }
                              className="mt-3 text-[11px] px-2 py-1 rounded-full border border-red-500 text-red-300 hover:bg-red-900/40"
                            >
                              Remove all photos from this acquisition
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedAcq && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
                      <div>
                        <button
                          onClick={() =>
                            updateQueryParams({
                              mode: "acq",
                              acq: null,
                              page: 1,
                            })
                          }
                          className="text-xs text-gray-300 hover:underline"
                        >
                          ← Back to acquisitions
                        </button>
                        <h2 className="text-xl text-yellow-200 mt-1">
                          Acquisition {formatAcqId(selectedAcq)}
                        </h2>
                        <p className="text-gray-400 text-xs">
                          {selectedAcqPhotos.length} photos
                        </p>
                      </div>

                      {selectedAcqPhotos.length > 0 && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditMode((prev) => !prev)}
                            className={`px-3 py-1 rounded-full border text-xs ${
                              editMode
                                ? "border-teal-500 bg-teal-900 text-teal-100 hover:bg-teal-800"
                                : "border-zinc-600 bg-zinc-800 text-gray-100 hover:bg-zinc-700"
                            }`}
                          >
                            {editMode ? "Done editing" : "Edit mode"}
                          </button>
                          {editMode && (
                            <>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={handleRemoveAllInSelectedAcq}
                                  className="text-[11px] px-2 py-1 rounded-full border border-red-500 text-red-300 hover:bg-red-900/40"
                                >
                                  Remove all photos
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddAllInSelectedAcq}
                                  className="text-[11px] px-2 py-1 rounded-full border border-teal-500 text-teal-200 hover:bg-teal-900/40"
                                >
                                  Add all photos
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 text-right max-w-xs">
                                In edit mode, use ✓ to keep, – to remove, or the
                                buttons above to update all photos in this
                                acquisition.
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editError && (
                      <p className="text-xs text-red-300 mb-2">{editError}</p>
                    )}

                    {selectedAcqPhotos.length === 0 ? (
                      <p className="text-gray-300">
                        No images were found for this acquisition in this
                        collection.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedAcqPhotos.map((p, idx) => {
                          const key = makeKey(p.acq_id, p.sec);
                          const isInCollection = membershipSet.has(key);

                          return (
                            <button
                              key={`${p.acq_id}-${p.sec}-${idx}`}
                              className={`bg-zinc-950 rounded overflow-hidden text-left transition border ${
                                isInCollection
                                  ? "border-zinc-800 hover:border-yellow-500"
                                  : "border-red-500/80 hover:border-red-400/90"
                              }`}
                              onClick={() => openViewerFromAcq(idx)}
                            >
                              <div className="relative w-full h-32">
                                <img
                                  src={thumbUrl(p.imageLink)}
                                  alt={`${formatAcqId(p.acq_id)} · sec ${p.sec}`}
                                  className="w-full h-full object-cover"
                                />
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePhotoInCollection(p);
                                    }}
                                    className={`absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                                      isInCollection
                                        ? "bg-teal-500 border-teal-400 text-black"
                                        : "bg-red-600 border-red-400 text-white"
                                    }`}
                                  >
                                    {isInCollection ? "✓" : "–"}
                                  </button>
                                )}
                              </div>
                              <div className="px-2 py-1">
                                <p className="text-xs text-yellow-100 truncate">
                                  {formatAcqId(p.acq_id)}
                                </p>
                                <p className="text-[10px] text-gray-300">
                                  sec {p.sec}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Viewer fullscreen */}
      {viewerOpen && viewerList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/70 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-200">
                <span className="font-semibold">
                  {formatAcqId(viewerList[viewerIndex].acq_id)}
                </span>{" "}
                · sec {viewerList[viewerIndex].sec} · {viewerIndex + 1} /{" "}
                {viewerList.length}
              </div>
              {editMode && viewerContext === "acq" && (
                (() => {
                  const current = viewerList[viewerIndex];
                  const key = makeKey(current.acq_id, current.sec);
                  const isInCollection = membershipSet.has(key);
                  return (
                    <button
                      type="button"
                      onClick={() => handleTogglePhotoInCollection(current)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        isInCollection
                          ? "border-red-500 text-red-300 hover:bg-red-900/40"
                          : "border-teal-500 text-teal-200 hover:bg-teal-900/40"
                      }`}
                    >
                      {isInCollection
                        ? "Remove from this collection"
                        : "Re-add to this collection"}
                    </button>
                  );
                })()
              )}
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
                alt={`${formatAcqId(
                  viewerList[viewerIndex].acq_id
                )} · sec ${viewerList[viewerIndex].sec}`}
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
