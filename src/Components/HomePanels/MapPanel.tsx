import MapComponent from "../../Maps/MapComponent";

type MapPanelProps = {
  states: string[];
};

export default function MapPanel({ states }: MapPanelProps) {
  return (
    <div className="bg-zinc-950 text-white py-5 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-yellow-400 text-xs md:text-sm py-3">
          Visited States:
          <span className="text-gray-300">{" " + states.join(" • ")}</span>
        </p>

        <MapComponent states={states} />
      </div>

      <div className="flex justify-center items-center mt-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-3 px-5 rounded-full transition duration-300 text-roboto"
        >
          ↑ Back to Top
        </button>
      </div>
    </div>
  );
}