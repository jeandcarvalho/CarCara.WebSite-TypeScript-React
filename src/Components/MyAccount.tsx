import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const API_BASE = "https://carcara-web-api.onrender.com";

type User = {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
};

type Collection = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  itemsCount: number;
};

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // user info (auth/me)
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!meRes.ok) {
          setErrorMsg("Authentication error. Please sign in again.");
          setLoading(false);
          return;
        }
        const meData = await meRes.json();
        setUser(meData);

        // collections
        const colRes = await fetch(`${API_BASE}/collections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const colData = await colRes.json();
        if (!colRes.ok) {
          setErrorMsg(colData.error || "Error loading collections.");
        } else {
          setCollections(colData);
        }
      } catch (err) {
        setErrorMsg("Connection error.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error creating collection.");
        return;
      }

      setCollections((prev) => [data, ...prev]);
      setNewName("");
      setNewDesc("");
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this collection?")) return;

    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        setErrorMsg(data.error || "Error deleting collection.");
        return;
      }

      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-5xl py-4">
          <h1 className="text-3xl font-medium text-yellow-300 mb-4">
            My Account
          </h1>

          {errorMsg && (
            <div className="bg-red-900 text-red-100 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <p className="text-gray-200">Loading...</p>
          ) : (
            <>
              {/* User info */}
              {user && (
                <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-6">
                  <h2 className="text-xl text-yellow-200 mb-2">Profile</h2>
                  <p className="text-gray-200">
                    <span className="font-semibold">Name:</span>{" "}
                    {user.name || "-"}
                  </p>
                  <p className="text-gray-200">
                    <span className="font-semibold">Email:</span>{" "}
                    {user.email}
                  </p>
                </section>
              )}

              {/* New collection form */}
              <section className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-6">
                <h2 className="text-xl text-yellow-200 mb-3">
                  New Collection
                </h2>
                <form
                  onSubmit={handleCreate}
                  className="space-y-3 md:flex md:items-end md:space-y-0 md:space-x-3"
                >
                  <div className="flex-1">
                    <label className="text-gray-300 block mb-1">Name</label>
                    <input
                      className="w-full p-2 rounded bg-zinc-800 text-gray-100 border border-zinc-700"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-300 block mb-1">
                      Description (optional)
                    </label>
                    <input
                      className="w-full p-2 rounded bg-zinc-800 text-gray-100 border border-zinc-700"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Create
                  </button>
                </form>
              </section>

              {/* Collections list */}
              <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
                <h2 className="text-xl text-yellow-200 mb-3">
                  Your Collections
                </h2>

                {collections.length === 0 ? (
                  <p className="text-gray-300">
                    You don't have any collections yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {collections.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-800 rounded p-3 gap-2"
                      >
                        <div className="flex-1">
                          <p className="text-yellow-100 font-semibold">
                            {c.name}
                          </p>
                          {c.description && (
                            <p className="text-gray-300 text-sm">
                              {c.description}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs mt-1">
                            {c.itemsCount} items
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/collections/${c.id}`)}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            View items
                          </button>

                          <button
                            onClick={() => handleDelete(c.id)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MyAccount;
