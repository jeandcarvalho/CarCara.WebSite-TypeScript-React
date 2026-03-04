type CollaboratorsPanelProps = {
  logoscarcara: string;
};

export default function CollaboratorsPanel({ logoscarcara }: CollaboratorsPanelProps) {
  return (
    <div className="bg-zinc-950 text-white pt-7 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">
          Collaborators
        </h2>

        <div className="flex justify-center space-x-6">
          <img src={logoscarcara} alt="Collaborator 1" className="rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
}