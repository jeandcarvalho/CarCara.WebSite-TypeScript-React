// src/Pages/ExploreAcquisitions.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

type IconKey =
  | "visual"
  | "detection"
  | "telemetry"
  | "localization"
  | "weather"
  | "road"
  | "semseg"
  | "scenario"
  | "search"
  | "night_moto"
  | "tree"
  | "cloud"
  | "car"
  | "signpost";

type Preset = {
  title: string;
  to: string;
  badge?: string;
  icons: [IconKey, IconKey]; // fallback
  thumbs?: [string, string, string]; // 3 thumbs
};

const ICON_BASE = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons";

const ICONS: Record<IconKey, { label: string; filename: string; hint: string }> =
  {
    visual: {
      label: "Visual Perception",
      filename: "camera-video.svg",
      hint: "Cameras / video streams / 360 view",
    },
    detection: {
      label: "Object Detection",
      filename: "bounding-box.svg",
      hint: "YOLO detections, boxes, tracking overlays",
    },
    telemetry: {
      label: "Vehicle Telemetry",
      filename: "speedometer2.svg",
      hint: "CAN / OBD / speed / steering / dynamics",
    },
    localization: {
      label: "Localization & Motion",
      filename: "geo-alt.svg",
      hint: "GPS / IMU / trajectory / ego motion",
    },
    weather: {
      label: "Environmental Context",
      filename: "cloud-rain.svg",
      hint: "Weather / lighting / visibility conditions",
    },
    road: {
      label: "Road & Map Semantics",
      filename: "map.svg",
      hint: "OSM / lanes / road type / map context",
    },
    semseg: {
      label: "Semantic Segmentation",
      filename: "palette.svg",
      hint: "Scene parsing (vegetation, sidewalk, buildings...)",
    },
    scenario: {
      label: "Scenario",
      filename: "layers.svg",
      hint: "Curated scenario slices / higher-level filters",
    },
    search: {
      label: "Open Search",
      filename: "funnel.svg",
      hint: "Go to Search and build custom filters",
    },

    // extras
    night_moto: {
      label: "Night",
      filename: "moon-stars.svg",
      hint: "Night scenes",
    },
    tree: {
      label: "Vegetation",
      filename: "tree.svg",
      hint: "Vegetation / greenery",
    },
    cloud: {
      label: "Cloud",
      filename: "cloud.svg",
      hint: "Cloudy conditions",
    },
    car: {
      label: "Car",
      filename: "car-front-fill.svg",
      hint: "Vehicles / traffic",
    },
    signpost: {
      label: "Urban / Signage",
      filename: "signpost-2-fill.svg",
      hint: "Urban driving / signs / intersections",
    },
  };

function iconUrl(key: IconKey) {
  return `${ICON_BASE}/${ICONS[key].filename}`;
}



type ThumbCarouselProps = {
  thumbs: [string, string, string];
  title: string;
};

const ThumbCarousel: React.FC<ThumbCarouselProps> = ({ thumbs, title }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);


  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = () => {
    // troca IMEDIATA ao encostar + loop
    stop();
    setIdx((v) => (v + 1) % 3);
    timerRef.current = window.setInterval(() => {
      setIdx((v) => (v + 1) % 3);
    }, 850);
  };

  useEffect(() => () => stop(), []);

  return (
    <div
      className="
        relative w-full h-40 sm:h-44 md:h-48 lg:h-52
        rounded-2xl overflow-hidden border border-zinc-800
        bg-zinc-950/40
      "
      // Desktop
      onMouseEnter={() => start()}
      onMouseLeave={() => stop()}
      // Mobile: encostou = começa (sem precisar clicar)
      onTouchStart={(e) => {
        // não impede scroll do resto da página, mas evita clique/navegação acidental no link
        e.stopPropagation();
        start();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        stop();
      }}
      title={title}
      aria-label={title}
    >
      <img
        src={thumbs[idx]}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-zinc-950/10 to-transparent" />

      {/* dots */}
      <div className="absolute bottom-2 left-2 flex gap-1.5">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className={[
              "w-2 h-2 rounded-full border border-zinc-300/40",
              d === idx ? "bg-yellow-300" : "bg-zinc-500/40",
            ].join(" ")}
          />
        ))}
      </div>

    </div>
  );
};

const presets: Preset[] = [
  // 1) Overcast + High Vegetation
  {
    title: "Overcast + High Vegetation",
    to: "/view?b.condition=Overcast&s.vegetation=50.41",
    badge: "Environment",
    icons: ["weather", "tree"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/1PSskKFeJtAjiKhxBmgDALlXZomgBezbg=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1SZAvAkdVXYNIJnf1VENmwZQ0GMlI3pTV=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1CoGFvqpRSzj8ApEjGE_SS3_r2nBWRKVs=w1200-h800-n",
    ],
  },

  // 2) Night + Motorcycle + dist <= 15
  {
    title: "Night + Motorcycle + distance ≤ 15 m",
    to: "/view?b.period=night&y.class=motorcycle&y.conf=0.66&y.dist_m=15",
    badge: "Perception",
    icons: ["night_moto", "detection"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/1V-vQ23BI16tn2ODTdKTyMw4BCRO5m_C3=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1cIieIBCCQfHvCw5k6uc4Y55ynYix0dpr=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/151r6Kmx0-ykd-yJJ3sBelB7Auh6MQIqb=w1200-h800-n",
    ],
  },

  // 3) Partly Cloudy + Speed ≈ 90 km/h
  {
    title: "Partly Cloudy + Speed ≈ 90 km/h",
    to: "/view?b.condition=Partly+cloudy&c.v=90",
    badge: "Telemetry",
    icons: ["cloud", "telemetry"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/1bmILGSUxlXhbcnxxbgfuSQH3ssFlES1u=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1P-UU0hK5UxmVCV5w7fihusgKcG9YuVlC=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1RGtx4ZuzQhnb8Q6qXiqNHSclWqV3rMa3=w1200-h800-n",
    ],
  },

  // 4) Urban Daytime + Dense Traffic
  {
    title: "Urban Daytime + Dense Traffic",
    to: "/view?b.period=day&o.highway=local%2Csecondary_link%2Csecondary&s.building=28.72..&y.class=car&y.rel=EGO%2CR-out%2CL-1%2CR%2B1&y.conf=0.66..&y.dist_m=..10",
    badge: "Scenario",
    icons: ["signpost", "detection"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/1yly0ZR2Aga1oo0po5DwfZ4OTT817g5CO=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1nXYXGhwJkwQc71Gs67fk2tWRb5kFPGhs=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1O0zf91U5MJc5SmMSkp3rzbpwABQoUW4a=w1200-h800-n",
    ],
  },

  // 5) Rainy / Wet Road
  {
    title: "Rainy / Wet Road",
    to: "/view?b.condition=Drizzle%3A+light%2CDrizzle%3A+moderate%2CDrizzle%3A+dense",
    badge: "Weather",
    icons: ["weather", "road"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/1bq_cqyaYJPijU6G0-Gps1YaqqNbJTmJc=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1bB_f2y1GXZSVASF1H0lUeXc5dKufwBci=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1aWkB_6bmxnOEbhRVqIpXfRSUV5uaMynx=w1200-h800-n",
    ],
  },

  // 6) Highway + Higher Speed + Night
  {
    title: "Highway + Higher Speed + Night",
    to: "/view?b.period=night&c.v=110..&o.highway=primary%2Cprimary_link",
    badge: "Road",
    icons: ["road", "telemetry"],
    thumbs: [
      "https://lh3.googleusercontent.com/d/15M8hrgkGBj2JiT43m6dlY0969dn2POuS=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1iagX63XXQ9c0gHDD8lPEiTxa4ShfdAXm=w1200-h800-n",
      "https://lh3.googleusercontent.com/d/1-8-sars2uz3ZLfw3hv6vPb0xR820JRLg=w1200-h800-n",
    ],
  },
];

const ExploreAcquisitions: React.FC = () => {
  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex justify-center px-4">
        <main className="w-full max-w-7xl h-full">
          {/* Title */}
          <div className="text-left px-2">
            <h1 className="text-4xl font-medium mb-2 text-orange-100">
              <span className="font-medium text-yellow-300">
                Explore Acquisitions
              </span>
            </h1>
            <p className="text-zinc-300 text-base md:text-lg max-w-3xl">
              Start with curated presets (fast discovery) or jump into the full
              Search to build advanced filters.
            </p>
          </div>

          {/* Main CTA */}
          <section className="mt-6 px-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">
                    Full Search
                  </h2>
                  <p className="text-zinc-300 mt-1">
                    Go to Search and combine advanced filters (condition,
                    period, YOLO, semseg, CAN, OSM, etc.).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to="/Search" className="w-full sm:w-auto">
                    <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-extrabold px-5 py-3 rounded-xl transition duration-200 shadow-lg flex items-center justify-center gap-2">
                      <img
                        src={iconUrl("search")}
                        alt="Search"
                        className="w-5 h-5"
                      />
                      Open Search
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Presets */}
          <section className="mt-6 px-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl md:text-2xl font-semibold text-zinc-100">
                Quick Presets
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {presets.map((p) => (
                <Link
                  key={p.title}
                  to={p.to}
                  className="group"
                  title={`${ICONS[p.icons[0]].hint} • ${ICONS[p.icons[1]].hint}`}
                >
                  <div className="h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex flex-col gap-4">
                      {/* BIG preview */}
                      {p.thumbs ? (
                        <ThumbCarousel thumbs={p.thumbs} title={p.title} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-center">
                            <img
                              src={iconUrl(p.icons[0])}
                              alt={ICONS[p.icons[0]].label}
                              className="w-5 h-5 invert opacity-90"
                              loading="lazy"
                            />
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-center">
                            <img
                              src={iconUrl(p.icons[1])}
                              alt={ICONS[p.icons[1]].label}
                              className="w-5 h-5 invert opacity-90"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}

                      {/* Text row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="text-zinc-100 font-extrabold text-lg leading-snug">
                            {p.title}
                          </div>

                          {p.badge ? (
                            <div className="mt-2">
                              <span className="inline-flex bg-zinc-800 text-zinc-100 text-xs font-bold px-2 py-1 rounded-full border border-zinc-700">
                                {p.badge}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors select-none text-2xl mt-0.5">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ExploreAcquisitions;