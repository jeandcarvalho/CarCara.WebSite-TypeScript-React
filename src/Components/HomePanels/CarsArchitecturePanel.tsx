import { Link } from "react-router-dom";

type CarsArchitecturePanelProps = {
  cars: string;
};

export default function CarsArchitecturePanel({ cars }: CarsArchitecturePanelProps) {
  return (
    <div className="bg-zinc-900 flex-grow flex justify-center px-4">
      <div className="w-full max-w-5xl flex mt-5 mb-5 flex-col md:flex-row items-center md:items-start px-3 text-white">
        <div className="md:w-2/5 mb-5 flex justify-center items-center mr-3 mt-3">
          <img
            className="w-full max-w-md md:max-w-lg h-[330px] md:h-[415px] object-cover rounded-lg"
            src={cars}
            alt="Overview of the 3 Cars"
          />
        </div>

        <div className="md:w-1/2 ml-3 text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
          <div className="flex flex-col items-center md:items-start ">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-4 text-yellow-300 text-roboto mr-3">
              Introduction to the DAQ Architecture
            </h1>

            <p className="text-base md:text-lg mb-6 text-zinc-300">
              This section provides an overview of the vehicles and data structures used in the Data Acquisition (DAQ)
              architecture. Learn more about the Renault CAPTUR, DAF CF 410, and Jeep Renegade, and explore their
              respective data formats.
            </p>

            <Link to="/About">
              <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base mb-5 md:text-lg font-bold py-2 px-4 md:px-6 rounded-full transition duration-300">
                Explore Our Architecture
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}