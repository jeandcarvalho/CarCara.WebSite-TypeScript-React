import { Link } from "react-router-dom";

type HeroPanelProps = {
  acq: string;
};

export default function HeroPanel({ acq }: HeroPanelProps) {
  return (
    <div className="bg-zinc-950 flex-grow flex justify-center px-4">
      <div className="w-full max-w-5xl flex mt-3 mb-3 flex-col md:flex-row items-center md:items-start px-3 text-white">
        {/* Coluna esquerda */}
        <div className="md:w-1/2 ml-3 text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
          <div className="flex flex-col items-center md:items-start">
            <div className="mt-5 mb-4">
              <h2 className="text-sm uppercase tracking-widest text-zinc-400 mb-2">
                CarCara Platform
              </h2>

              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-yellow-300 text-roboto">
                AI-Driving for<br className="hidden md:block" />
                Smarter Mobility
              </h1>

              <p className="mt-4 text-zinc-300 text-base md:text-lg max-w-md text-roboto">
                A multimodal automotive data platform combining vision, vehicle telemetry,
                and contextual intelligence to support perception, reasoning, and driving
                assistance research.
              </p>
            </div>

            {/* Mini highlights */}
            <div className="flex flex-wrap gap-2 mt-2 mb-4 justify-center md:justify-start">
              {[
                "Dataset",
                "Signal Processing",
                "Environment Perception",
                "Object Recognition",
                "Language Processing",
                "Intelligent Data for Smarter Driving (IDSD)",
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>

            <Link to="/fullfiles">
              <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-200 text-base md:text-lg font-bold py-2 px-6 rounded-full transition duration-300 text-roboto mb-6">
                Explore Driving Data
              </button>
            </Link>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="md:w-2/3 mb-5 flex justify-center items-center mr-3 mt-5">
          <img
            className="w-full max-w-md md:max-w-lg h-[140px] md:h-[300px] object-cover rounded-lg"
            src={acq}
            alt="CarCara preview"
          />
        </div>
      </div>
    </div>
  );
}