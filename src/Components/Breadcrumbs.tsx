import React, { useMemo } from "react";
import { Link } from "react-router-dom";

type Crumb = { label: string; to?: string };

type Props = {
  className?: string;
};

function getHashRoute(): { path: string; search: string } {
  if (typeof window === "undefined") return { path: "/", search: "" };

  const hash = window.location.hash || ""; // "#/View?b.vehicle=Captur"
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash; // "/View?..."
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
  // "/my-page_name" -> "My Page Name"
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

const HOME_TO = "/";
const ACQ_TO = "/daqs";

const Breadcrumbs: React.FC<Props> = ({ className }) => {
  const route = useMemo(() => getHashRoute(), []);

  const crumbs: Crumb[] = useMemo(() => {
    const { path, search } = route;
    const lower = path.toLowerCase();

    // ✅ Home
    if (lower === "/" || lower === "/home") {
      return [{ label: "Home" }];
    }

    // ✅ About
    if (lower === "/about") {
      return [
        { label: "Home", to: HOME_TO },
        { label: "About" },
      ];
    }

    // ✅ Acquisitions page (/daqs)
    if (
      lower === "/daqs" ||
      lower === "/daq" ||
      lower === "/acquisition" ||
      lower === "/acquisitions"
    ) {
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisition" },
      ];
    }

    // ✅ Search (Home -> Acquisition -> Search)
    if (lower === "/search") {
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisition", to: ACQ_TO },
        { label: "Search" },
      ];
    }

    // ✅ View (Home -> Acquisition -> Search?filters -> View)
    if (lower === "/view") {
      // important: remove page/per_page from View query when going back to Search
      const searchTo = `/search${stripPageParams(search || "")}`;

      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisition", to: ACQ_TO },
        { label: "Search", to: searchTo },
        { label: "View" },
      ];
    }

    // ✅ Acquisition details (/acquisition/:id)
    if (/^\/acquisition(\/|$)/.test(lower) && lower !== "/acquisition") {
      const searchTo = `/search${stripForSearch(search || "")}`;
      const viewTo = `/View${stripForView(search || "")}`;

      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisition", to: ACQ_TO },
        { label: "Search", to: searchTo },
        { label: "View", to: viewTo },
        { label: "Visualizer" },
      ];
    }

    // ✅ fallback genérico
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

            return (
              <React.Fragment key={`${c.label}-${idx}`}>
                {idx > 0 && <span className="text-zinc-600">/</span>}

                {c.to && !isLast ? (
                  <Link
                    to={normalizeTo(c.to)}
                    className="hover:text-yellow-300 transition-colors"
                    title={c.to}
                  >
                    {c.label}
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
