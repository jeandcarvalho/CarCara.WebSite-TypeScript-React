type ExamplesPanelProps = {
  ai1: string;
  ai2: string;
};

export default function ExamplesPanel({ ai1, ai2 }: ExamplesPanelProps) {
  return (
    <div className="bg-zinc-900 text-white py-3 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex justify-center">
            <img src={ai1} alt="Example 1" className="rounded-lg shadow-lg h-48 md:h-96 mt-3" />
          </div>

          <div className="flex justify-center">
            <img src={ai2} alt="Example 2" className="rounded-lg shadow-lg h-48 md:h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}