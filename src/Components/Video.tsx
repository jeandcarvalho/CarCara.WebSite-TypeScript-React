import React, { useEffect, useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import api from '../Services/api';
import { useParams } from "react-router-dom";
import { json2csv } from "json-2-csv";
import MapVideo from '../Classes/MapVideo';
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
  
  interface GeoFilesProps {
    id: string;
    videoname: string;
    timestamps: Date;
    GPS_y: string;
    GPS_x: string;
    GPS_z: string;
  }
  
const Video: React.FC = () => {
  const { video } = useParams<{ video?: string }>();
  const videoclicked = video?.substring(0, 28);

  const [filesdata, setFiles] = useState<VideoFilesProps[]>([]);
  const [filesgeo, setGeo] = useState<GeoFilesProps[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    loadGeo();
  }, []);

  async function loadFiles() {
    const response = await api.get("/videofiless?page=1&pageSize=300&searchString=!!!!!");
    setFiles(response.data);
  }

  async function loadGeo() {
    const response = await api.get(`/coordinates?page=1&pageSize=3000&searchString=${videoclicked}`);
    setGeo(response.data);
  }

  function extrairIdGoogleDrive(link: string | undefined): string | null {
    if (link && link.includes("/file/d/")) {
      const startIdx = link.indexOf("/file/d/") + "/file/d/".length;
      const endIdx = link.indexOf("/view", startIdx);
      const id = link.substring(startIdx, endIdx);
      return id;
    } else if (link && link.includes("id=")) {
      const startIdx = link.indexOf("id=") + "id=".length;
      const id = link.substring(startIdx);
      return id;
    } else {
      return null;
    }
  }

  function downloadVideo(fileId: string, fileName: string) {
    if (!fileId || !fileName) {
      console.error("Invalid file ID or file name");
      return;
    }

    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadGeoCSV() {
    if (filesgeo.length === 0) {
      console.error("No data to download");
      return;
    }
    if (video !== undefined) {
      const novaConstante: string = video.slice(0, -4);
      const csvData = json2csv(filesgeo);
      const blob = new Blob([csvData], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `(GEO DATA) ${novaConstante}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const fileWithLink = filesdata.find(file => file.VideoFile === video);

  function changeViewToPreview(link: string): string {
    if (link.includes("/view")) {
      return link.replace("/view", "/preview");
    } else {
      return link;
    }
  }

  const formatString = (input: string): string => {
    return input.split(',').map(part => part.trim()).join(', ');
  };

  const modifiedLink = fileWithLink ? changeViewToPreview(fileWithLink.Link) : '';
  const idfile = fileWithLink ? extrairIdGoogleDrive(fileWithLink.Link) : '';

  const DownloadButton: React.FC<{ fileId: string | null; fileName: string }> = ({ fileId, fileName }) => {
    const handleClick = () => {
      if (fileId !== null) {
        downloadVideo(fileId, fileName);
      } else {
        console.error("File ID is null");
      }
    };

    return (
      <button className="bg-yellow-500 hover:scale-105 duration-200 text-black rounded relative w-full text-center justify-center" onClick={handleClick} title="Video File in .mp4">Video File 1080p</button>
    );
  };

  return (
    <div className='bg-zinc-950 min-h-screen flex flex-col'>
      <Header />
      <div className="flex-grow flex justify-center px-4">
        <main className="my-5 w-full md:w-full">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-1">
            {fileWithLink && (
             <iframe
             className="flex w-full items-center justify-center h-64 md:h-96"
             src={modifiedLink + '&vq=hd1080'}
             width="1040"
             height="355"
             allow="fullscreen"
           ></iframe>
            )}
            <article className="bg-zinc-900 rounded p-2 relative">
              {fileWithLink && (
                <p>
                  <article className="bg-zinc-900 rounded p-1 relative">
                    <p className='text-white mb-2 ml-2'>Download:</p>
                    <section className="grid grid-cols-2 gap-4 w-full mb-2">
                      <button className="bg-yellow-500 rounded p-2 relative w-full text-center justify-center hover:scale-105 duration-200">
                        <DownloadButton fileId={idfile} fileName="nome_do_arquivo.mp4" />
                      </button>                   
                      <button
                        className='text-black hover:scale-105 duration-200 bg-yellow-500 rounded relative w-full text-center justify-center'
                        onClick={downloadGeoCSV}
                      >
                        <span className='text-black'>Geo Coordinates</span>
                      </button>
                    </section>
                  </article>
                  <section className="grid grid-cols-2 gap-4 w-full">              
                    <article className="bg-zinc-900  ml-1 rounded p-2 relative ">
            
                         <span className='font-medium text-yellow-300 text-xl'>{formatString(fileWithLink.District) + ' - '}</span>
                  <span className="font-medium text-yellow-300 text-xl ">{fileWithLink.City}{' - '}{fileWithLink.State}</span>
                  <br  />
                  <article key={fileWithLink.id} className="bg-zinc-700 mt-5 rounded p-1 max-w-fit inline-block">
                    <span className='font-medium text-gray-300 text-xl'>{formatString(' ' + fileWithLink.RoadType) + ' Road'}</span>  
                  </article>
                  <br/>
                  <article key={fileWithLink.id} className="bg-sky-950 rounded p-1 my-2 max-w-fit inline-block">
                    <span className='font-medium text-sky-200 text-xl'>{formatString(' ' + fileWithLink.Weather+' '+fileWithLink.Period)}</span>   
                  </article>
                  <br/>
                  <article key={fileWithLink.id} className="bg-teal-950 rounded mb-2 p-1 max-w-fit inline-block">
                    <span className='font-medium text-teal-200 text-xl'>{formatString(' ' + fileWithLink.Area+' ')}</span>   
                  </article>
                    </article>
                    <article className="bg-zinc-900 rounded p-1 relative">
                    <MapVideo videoName={video} />
                    </article>
                  </section>                           
                </p>
              )}
            </article>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Video;
