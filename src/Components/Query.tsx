import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../Services/api';
import loadgif from "../Components/img/gif.gif";
import Header from '../Components/Header';
import Footer from '../Components/Footer';

interface VideoFilesProps {
  id: string;
  VideoFile: string;
  Link: string;
  Date: string;
  District: string;
  City: string;
  State: string;
  Gps_y: string;
  Gps_x: string;
  Area: string;
  RoadType: string;
  Traffic: string;
  Misc: string;
  Weather: string;
  Period: string;
}

const City: React.FC = () => {
  const { city } = useParams();
  const [filesdata, setFiles] = useState<VideoFilesProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await api.get(`/videofiless?page=1&pageSize=300&searchString=${city}`);
        setFiles(response.data);
      } catch (error) {
        console.error("Error loading files:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFiles();
  }, [city]);

  if (!city) {
    return <div>City is undefined</div>;
  }

  window.onload = () => window.scrollTo(0, 0);

  const formatString = (input: string): string => {
    return input.split(',').map(part => part.trim()).join(', ');
  };

  const filterCityString = (city: string): string => {
    const filtros = city.replace(/_/g, " ");
    const parts = filtros.split('!');
    const partss = parts.filter(part => part.trim() !== "");
    return partss.join(' - ');
  };

  const result = filterCityString(city);

  return (
    <div className='bg-zinc-950 min-h-screen flex flex-col'>
      <Header />
      <div className="flex-grow flex justify-center px-4">
        <main className="my-5 w-full max-w-7xl h-full">
          <div className="text-left">
            <h1 className="text-4xl font-medium mb-4 text-orange-100">
              <span className='font-medium text-yellow-300'>Video Files</span>
            </h1>
            <h2 className="text-2xl mb-3 mt-3 w-full text-orange-300">
              <p>
                <span className='text-zinc-500 font-normal'>Filters:</span>
                <span className='text-zinc-400 font-semibold ml-2'>{result}</span>
              </p>
            </h2>
          </div>
          {isLoading ? (
            <div className="w-full mt-11 flex justify-center items-center">
              <img src={loadgif} alt="Loading" className='w-32 h-32 mt-11 mb-11' />
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
              {filesdata.map((Files) => (
                Files.City !== "Not Found" && Files.District !== "Not Found" && (
                  <Link to={`/video/${Files.VideoFile}`} key={Files.VideoFile}>
                    <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 transition-transform duration-200 h-full">
                      <img
                        className="w-full h-40 object-cover rounded-t"
                        src={`https://drive.google.com/thumbnail?id=${Files.Link?.match(/[-\w]{25,}/)?.[0] || ''}`}
                        alt="Video Thumbnail"
                      />
                      <div className="p-2">
                        <span className="font-medium text-yellow-200 text-xl">{Files.City} - {Files.State}</span>
                        <br />
                        <article className="bg-gray-800 rounded mt-2 p-1 max-w-fit inline-block">
                          <span className='font-medium text-gray-100 text-md'>{formatString(Files.RoadType)} Road</span>
                        </article>
                        <br />
                        <article className="bg-sky-950 my-2 rounded p-1 max-w-fit inline-block">
                          <span className='font-medium text-sky-100 text-md'>{formatString(Files.Weather)}</span>
                          <span className='font-medium text-sky-100 text-md'>{Files.Period}</span>
                        </article>
                        <br />
                        <article className="bg-teal-950 rounded p-1 max-w-fit inline-block">
                          <span className='font-medium text-teal-100 text-md'>{formatString(Files.Area)}</span>
                        </article>
                      </div>
                    </article>
                  </Link>
                )
              ))}
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default City;
