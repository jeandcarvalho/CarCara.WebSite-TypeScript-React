import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadgif from "../Components/img/gif.gif";
import Header from './Header';
import Footer from './Footer';
import { formatString } from '../Utils/StringUtilsVideos';

interface VideoFile {
  id: string;
  FileName: string;
  Timestamp: string;
  GPS_x: string;
  GPS_y: string;
  City: string;
  Country: string;
  District: string;
  State: string;
  Street: string;
  IMU: string;
  OBII: string;
  Radar: string;
  Csv: string;
  Mf4: string;
  VIEW360: string; // Correspondendo ao campo "360VIEW" do Prisma
  CAM_Front_Center: string;
  CAM_Front_Left: string;
  CAM_Front_Right: string;
  CAM_Rear_Center: string;
  CAM_Rear_Left: string;
  CAM_Rear_Right: string;
  Area: string;
  Misc: string;
  Period: string;
  RoadType: string; // Correspondendo ao campo "Road Type" do Prisma
  Traffic: string;
  Weather: string;
}

const City: React.FC = () => {
  const [filesData, setFilesData] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://carcara-web-api.onrender.com/videofiles');
        const data = await response.json();
        setFilesData(data);
      } catch (error) {
        console.error('Error fetching video files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='bg-zinc-950 min-h-screen flex flex-col'>
      <Header />
      <div className="flex-grow flex justify-center px-4">
        <main className="my-5 w-full max-w-7xl h-full">
          <div className="text-left">
            <h1 className="text-4xl font-medium mb-4 text-orange-100">
              <span className='font-medium text-yellow-300'>v4 Acquisitions</span>
            </h1>
          </div>
          {isLoading ? (
            <div className="w-full mt-11 flex justify-center items-center">
              <img src={loadgif} alt="Loading" className='w-32 h-32 mt-11 mb-11' />
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-2">
              {filesData
                .filter(file => file.City !== "Not Found" && file.District !== "Not Found")
                .map(file => (
                  <Link to={`/FullVideo/${file.FileName}`} key={file.id}>
                    <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 transition-transform duration-200 h-full">
                    <div className="w-full h-36 overflow-hidden"> {/* altura ainda mais reduzida */}
                      <img
                        className="w-full h-full object-cover rounded-t"
                       src={`https://drive.google.com/thumbnail?id=${file.VIEW360?.match(/[-\w]{25,}/)?.[0] || ''}`}
                       alt="Video Thumbnail"
                     />
                    </div>
                      <div className="p-2">                  
                        <article className="bg-zinc-900 my-2 rounded p-1 max-w-fit inline-block"> 
                        <span className="font-medium text-yellow-200 text-xl">{file.City} - {file.State}</span>
                        <br /> 
                         <span className="font-medium text-yellow-100 text-md">{file.Street} - {file.District}</span>
                        </article>     
                              
                        <article className="bg-gray-800 rounded mt-2 p-1 max-w-fit inline-block">
                          <span className='font-medium text-gray-100 text-md'>{formatString(file.RoadType)} Road</span>                       
                        </article>
                        <br />
                        <article className="bg-sky-950 my-2 rounded p-1 max-w-fit inline-block">
                          <span className='font-medium text-sky-100 text-md'>{formatString(file.Weather)} - {formatString(file.Period)}</span>                     
                        </article>
                        <br />
                        <article className="bg-teal-950 rounded p-1 max-w-fit inline-block">
                          <span className='font-medium text-teal-100 text-md'>{formatString(file.Area)}</span>
                        </article>
                      </div>
                    </article>
                  </Link>
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
