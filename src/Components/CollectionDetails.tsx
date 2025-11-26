import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const API_BASE = "https://carcara-web-api.onrender.com";

type ItemLine = {
  acq_id: string;
  sec: number;
};

type SecsResponse = {
  collectionId: string;
  acq_id: string;
  secs: number[];
};

const CollectionDetails: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [queryAcqId, setQueryAcqId] = useState("");
  const [loaded, setLoaded] = useState<SecsResponse | null>(null);

  const [addRaw, setAddRaw] = useState("");
  const [removeRaw, setRemoveRaw] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  if (!collectionId) {
    return <div>Missing collection id.</div>;
  }

  const parseLines = (raw: string): ItemLine[] => {
    const lines = raw.split("\n");
    const items: ItemLine[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // aceita "acq_id sec" ou "acq_id,sec"
      const parts = trimmed.split(/[,\s]+/).filter(Boolean);
      if (parts.length < 2) continue;

      const acq_id = parts[0];
      const sec = parseInt(parts[1], 10);
      if (!acq_id || Number.isNaN(sec)) continue;

      items.push({ acq_id, sec });
    }

    return items;
  };

  const handleLoadSecs = async () => {
    if (!queryAcqId.trim()) return;
    if (!token) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `${API_BASE}/collections/${collectionId}/items?acq_id=${encodeURIComponent(
          queryAcqId.trim()
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error loading secs.");
        setLoaded(null);
        return;
      }

      setLoaded(data as SecsResponse);
    } catch (err) {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItems = async () => {
    if (!token) return;
    const items = parseLines(addRaw);
    if (items.length === 0) {
      setErrorMsg("Add: no valid lines (use 'acq_id sec' or 'acq_id,sec').");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `${API_BASE}/collections/${collectionId}/items/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error adding items.");
        return;
      }

      // feedback rápido
      setErrorMsg(`Added ${data.inserted} items.`);
      // se o acq_id bater com o que está carregado, recarrega secs
      if (loaded && items.some((i) => i.acq_id === loaded.acq_id)) {
        handleLoadSecs();
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItems = async () => {
    if (!token) return;
    const items = parseLines(removeRaw);
    if (items.length === 0) {
      setErrorMsg(
        "Remove: no valid lines (use 'acq_id sec' or 'acq_id,sec')."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `${API_BASE}/collections/${collectionId}/items/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error removing items.");
        return;
      }

      setErrorMsg(`Removed ${data.deleted} items.`);
      if (loaded && items.some((i) => i.acq_id === loaded.acq_id)) {
        handleLoadSecs();
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-5xl py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-300 mb-2 hover:underline"
          >
            ← Back to My Account
          </button>

          <h1 className="text-3xl font-medium text-yellow-300 mb-4">
            Collection items
          </h1>

          {errorMsg && (
            <div className="bg-zinc-900 border border-red-700 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {loading && (
            <p className="text-gray-300 mb-4">Loading / processing...</p>
          )}

          {/* Bloco: carregar secs de um acq_id */}
          <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-6">
            <h2 className="text-xl text-yellow-200 mb-3">
              Load secs for a specific acquisition
            </h2>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="flex-1">
                <label className="text-gray-300 block mb-1">acq_id</label>
                <input
                  className="w-full p-2 rounded bg-zinc-800 text-gray-100 border border-zinc-700"
                  value={queryAcqId}
                  onChange={(e) => setQueryAcqId(e.target.value)}
                  placeholder="20250121202200"
                />
              </div>
              <button
                onClick={handleLoadSecs}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Load secs
              </button>
            </div>

            {loaded && (
              <div className="mt-4">
                <p className="text-gray-200 text-sm">
                  <span className="font-semibold">Collection:</span>{" "}
                  {loaded.collectionId}
                </p>
                <p className="text-gray-200 text-sm">
                  <span className="font-semibold">acq_id:</span>{" "}
                  {loaded.acq_id}
                </p>
                <p className="text-gray-200 text-sm mt-2">
                  <span className="font-semibold">secs:</span>{" "}
                  {loaded.secs.length === 0
                    ? "(none in this collection)"
                    : loaded.secs.join(", ")}
                </p>
              </div>
            )}
          </section>

          {/* Bloco: adicionar itens */}
          <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-6">
            <h2 className="text-xl text-yellow-200 mb-3">
              Add items to this collection
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              One item per line. Format: <code>acq_id sec</code> or{" "}
              <code>acq_id,sec</code> (example:{" "}
              <code>20250121202200 12</code>).
            </p>
            <textarea
              className="w-full min-h-[120px] p-2 rounded bg-zinc-800 text-gray-100 border border-zinc-700 mb-3"
              value={addRaw}
              onChange={(e) => setAddRaw(e.target.value)}
              placeholder={"20250121202200 5\n20250121202200 10"}
            />
            <button
              onClick={handleAddItems}
              className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded transition duration-300"
            >
              Add items
            </button>
          </section>

          {/* Bloco: remover itens */}
          <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-6">
            <h2 className="text-xl text-yellow-200 mb-3">
              Remove items from this collection
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              Same format: one per line, <code>acq_id sec</code> or{" "}
              <code>acq_id,sec</code>.
            </p>
            <textarea
              className="w-full min-h-[120px] p-2 rounded bg-zinc-800 text-gray-100 border border-zinc-700 mb-3"
              value={removeRaw}
              onChange={(e) => setRemoveRaw(e.target.value)}
              placeholder={"20250121202200 5\n20250121202200 10"}
            />
            <button
              onClick={handleRemoveItems}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Remove items
            </button>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CollectionDetails;
