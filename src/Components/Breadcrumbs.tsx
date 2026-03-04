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

    // ✅ Search (já deixa pronto pra voltar pra Home)
    // também inclui Acquisitions como “nível”
    if (lower === "/search") {
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions", to: ACQ_TO },
        { label: "Search" },
      ];
    }

    // ✅ View (Home -> Acquisitions -> Search?query -> View)
    if (lower === "/view") {
      const searchTo = `/search${search || ""}`;
      return [
        { label: "Home", to: HOME_TO },
        { label: "Acquisitions", to: ACQ_TO },
        { label: "Search", to: searchTo },
        { label: "View" },
      ];
    }

    // ✅ fallback genérico: Home / <Rota>
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