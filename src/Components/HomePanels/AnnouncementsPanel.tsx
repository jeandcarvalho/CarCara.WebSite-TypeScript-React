export default function AnnouncementsPanel() {
  return (
    <div className="bg-zinc-900 text-white py-6 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-yellow-300 text-roboto">
          Announcements
        </h2>

  <ul className="text-base md:text-sm space-y-3 leading-relaxed">
      <li>
        <b>December 2025</b> — AI analysis layer introduced together with a companion
        local module (soon available for download). Using the same user account,
        researchers can process their curated collections through external LLM APIs,
        enabling large-scale automated interpretation and reporting.
      </li>

      <li>
        <b>November 2025</b> — User account system introduced with per-user collections,
        allowing researchers to bookmark and organize key acquisition moments.
        This enables faster access to relevant segments without repeatedly relying
        on complex search filters.
      </li>

      <li>
        <b>September 2025</b> — Backend and frontend adapted to the expanded normalized
        dataset structure, introducing new filtering capabilities so users can query
        perception outputs and contextual metadata directly within the platform.
      </li>

      <li>
        <b>July 2025</b> — Multimodal dataset expanded with synchronized perception AI
        outputs, including lane detection, semantic segmentation, and object detection
        with tracking IDs. These perception layers were integrated alongside existing
        environmental and map-based metadata.
      </li>

      <li>
        <b>June 2025</b> — Data normalization milestone: transition from block-level
        (5-minute acquisition segments) to a unified 1 Hz structure across sensors,
        enabling more precise temporal analysis of events within each acquisition.
      </li>

      <li>
        <b>March 2025</b> — Improved website fluidity, new “Architecture” page covering
        the three instrumented vehicles, and a redesigned homepage.
      </li>

      <li>
        <b>October–December 2024</b> — Dataset enrichment phase through external APIs,
        integrating weather data and geographic context from map services and reducing
        the need for manual acquisition classification.
      </li>

      <li>
        <b>July 2024</b> — CarCara officially launched with the v3 datasets, initially
        relying on manual classification of acquisition blocks to organize the
        collected driving scenarios.
      </li>
    </ul>
      </div>
    </div>
  );
}