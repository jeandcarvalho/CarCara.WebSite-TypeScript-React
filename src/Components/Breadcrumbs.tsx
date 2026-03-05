import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Crumb = { label: string; to?: string };

type Props = {
  className?: string;
};

function getHashRouteFromHash(hash: string): { path: string; search: string } {
  if (!hash) return { path: "/", search: "" };

  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const qIndex = cleaned.indexOf("?");

  const rawPath = (qIndex >= 0 ? cleaned.slice(0, qIndex) : cleaned) || "/";
  const search = qIndex >= 0 ? cleaned.slice(qIndex) : "";

  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return { path, search };
}

function normalizeTo(toPath: string): string {
  return toPath.startsWith("/") ? toPath : `/${toPath}`;
}

function titleizeRoute(path: string): string {
  const p = path.replace(/^\//, "");
  if (!p) return "Home";

  return p
    .split(/[\/\-_]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function stripPageParams(search: string): string {
  if (!search) return "";

  const qs = search.startsWith("?") ? search.slice(1) : search;
  if (!qs) return "";

  const sp = new URLSearchParams(qs);
  sp.delete("page");
  sp.delete("per_page");

  const out = sp.toString();
  return out ? `?${out}` : "";
}

function stripParams(search: string, keys: string[]): string {
  if (!search) return "";

  const qs = search.startsWith("?") ? search.slice(1) : search;
  if (!qs) return "";

  const sp = new URLSearchParams(qs);
  keys.forEach((k) => sp.delete(k));

  const out = sp.toString();
  return out ? `?${out}` : "";
}

function stripForSearch(search: string): string {
  // Search should keep filters, but NOT pagination or acq_id
  return stripParams(search, ["page", "per_page", "acq_id"]);
}

function stripForView(search: string): string {
  // View should keep page + filters, but NOT acq_id
  return stripParams(search, ["acq_id"]);
}

function isSearchCrumb(label: string) {
  return label.toLowerCase() === "search";
}

const HOME_TO = "/";
const ACQ_TO = "/daqs";

const Breadcrumbs: React.FC<Props> = ({ className }) => {
  // ✅ Robust: acompanha QUALQUER mudança de hash (mesmo via replaceState)
  const [hash, setHash] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.location.hash || "",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let prev = window.location.hash || "";
    const tick = () => {
      const h = window.location.hash || "";
      if (h !== prev) {
        prev = h;
        setHash(h);
      }
    };

    // polling leve (pega replaceState/pushState que não disparam hashchange)
    const id = window.setInterval(tick, 150);

    // também pega o caso normal (cliques/anchor)
    const onHashChange = () => tick();
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const route = useMemo(() => {
    return getHashRouteFromHash(hash);
  }, [hash]);

  const crumbs: Crumb[] = useMemo(() => {
    const { path, search } = route;
    const lower = path.toLowerCase();

    if (lower === "/" || lower === "/home") {
      return [{ label: "Home" }];
    }

    if (lower === "/about") {
      return [
        { label: "Home", to: HOME_TO },
        { label: "About" },
      ];
    }

    if (
      lower === "/daqs" ||
      lower === "/daq" ||
      lower === "/acquisition" ||
      lower === "/acquisitions"
    ) {
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions" },
      ];
    }

    if (lower === "/search") {
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions", to: ACQ_TO },
        { label: "Search" },
      ];
    }

    if (lower === "/view") {
      const searchTo = `/search${stripPageParams(search || "")}`;

      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions", to: ACQ_TO },
        { label: "Search", to: searchTo },
        { label: "Results" },
      ];
    }

    // ✅ Acquisition details (/acquisition/:id)
    if (/^\/acquisition(\/|$)/.test(lower) && lower !== "/acquisition") {
      const searchTo = `/search${stripForSearch(search || "")}`;
      // IMPORTANT: usa o search ATUAL (com page atualizada) ✅
      const viewTo = `/View${stripForView(search || "")}`;

      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions", to: ACQ_TO },
        { label: "Search", to: searchTo },
        { label: "Results", to: viewTo },
        { label: "Details" },
      ];
    }

    return [
      { label: "Home", to: HOME_TO },
      { label: titleizeRoute(path) },
    ];
  }, [route]);

  return (
    <div
      className={[
        "w-full bg-zinc-950 border-b border-zinc-800",
        className || "",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-2 text-xs md:text-sm text-zinc-400">
          <span className="opacity-80">🧭</span>

          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            const isSearch = isSearchCrumb(c.label);

            const normalLink = "hover:text-yellow-300 transition-colors";
            const searchLink = "text-zinc-400 hover:text-yellow-300 transition-colors";

            return (
              <React.Fragment key={`${c.label}-${idx}`}>
                {idx > 0 && <span className="text-zinc-600">/</span>}

                {c.to && !isLast ? (
                  <Link
                    to={normalizeTo(c.to)}
                    className={isSearch ? searchLink : normalLink}
                    title={isSearch ? "Edit filters" : c.to}
                  >
                    {c.label}
                    {isSearch && (
                      <span className="ml-1 text-[10px] opacity-40">✎</span>
                    )}
                  </Link>
                ) : (
                  <span className={isLast ? "text-zinc-200" : ""}>
                    {c.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;