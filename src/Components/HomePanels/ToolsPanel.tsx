export default function ToolsPanel() {
  return (
    <div className="bg-zinc-950 text-white py-7 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Tools</h2>

        <p className="text-lg mb-6">
          We provide a Python tool to convert MF4 files to CSV for easy processing. The tool uses the{" "}
          <strong>asammdf</strong> library, which allows you to convert measurement files from the MF4 format into CSV
          format for further analysis. You can also adjust the time rate, which by default is set to 1 second, in the
          script.
        </p>

        <p className="text-lg mb-6">You can access the repository and download the tool from the link below:</p>

        <a
          href="https://github.com/jeandcarvalho/MF4-Converter"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 rounded-full transition duration-300 text-roboto"
        >
          Visit MF4-Converter Repository
        </a>
      </div>
    </div>
  );
}