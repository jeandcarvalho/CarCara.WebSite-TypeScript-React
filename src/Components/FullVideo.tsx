import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import MapVideoFull from '../Maps/MapVideoFull';
import loadgif from "../Components/img/gif.gif";
import { extrairIdGoogleDrive, formatString, changeViewToPreview } from '../Utils/VideoUtils';
import DownloadButton, { downloadFile } from './DownloadButtons';
import DownloadButtonVideo, { downloadVideo } from './DownloadButtonsVideo';


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
    VIEW360: string;
    CAM_Front_Center: string;
    CAM_Front_Left: string;
    CAM_Front_Right: string;
    CAM_Rear_Center: string;
    CAM_Rear_Left: string;
    CAM_Rear_Right: string;
    Area: string;
    Misc: string;
    Period: string;
    RoadType: string;
    Traffic: string;
    Weather: string;
}

const Video: React.FC = () => {
    const { video } = useParams<{ video?: string }>();
    const [filesData, setFilesData] = useState<VideoFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    useEffect(() => {
        window.scrollTo(0, 0);
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

    const fileWithLink = filesData.find(file => file.FileName === video);
    const Link360 = fileWithLink ? changeViewToPreview(fileWithLink.VIEW360) : '';
    const id360 = fileWithLink ? extrairIdGoogleDrive(fileWithLink.VIEW360) : '';
    const idcsv = fileWithLink ? extrairIdGoogleDrive(fileWithLink.Csv) : '';
    const idmf4 = fileWithLink ? extrairIdGoogleDrive(fileWithLink.Mf4) : '';
    const idfrontCenter = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Front_Center) : '';
    const idfrontLeft = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Front_Left) : '';
    const idfrontRight = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Front_Right) : '';
    const idrearCenter = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Rear_Center) : '';
    const idrearRight = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Rear_Right) : '';
    const idrearLeft = fileWithLink ? extrairIdGoogleDrive(fileWithLink.CAM_Rear_Left) : '';

    const idcan = fileWithLink ? extrairIdGoogleDrive(fileWithLink.OBII) : '';
    const idimu = fileWithLink ? extrairIdGoogleDrive(fileWithLink.IMU) : '';
    const idradar = fileWithLink ? extrairIdGoogleDrive(fileWithLink.Radar) : '';

    const handleFileDownload = (fileId: string, fileName: string) => {
        downloadFile(fileId, fileName);
    };

    const handleVideoDownload = (fileId: string, fileName: string) => {
        downloadVideo(fileId, fileName);
    };

    return (
        <div className='bg-zinc-950 min-h-screen flex flex-col'>
            <Header />

              <div className="my-3 ml-3">
                                    <Link to="/FullFiles">
                                        <button className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto">
                                            ← v4 Acquisitions
                                        </button>
                                    </Link>
                                </div>
            <div className="flex-grow flex justify-center px-4">
                <main className="my-1 w-full md:w-full">
                    {isLoading ? (
                        <div className="w-full mt-11 flex justify-center items-center">
                            <img src={loadgif} alt="Loading" className='w-32 h-32 mt-11 mb-11' />
                        </div>
                    ) : (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full ">
                            {fileWithLink && (
                                <iframe
                                    className="flex w-full items-center justify-center h-[200px] md:h-[530px]"
                                    src={Link360 + '&vq=hd1080'}
                                    width="1040"
                                    height="375"
                                    allow="fullscreen"
                                ></iframe>
                            )}
                            <article className="bg-zinc-900 rounded p-2 relative">
                                {fileWithLink && (
                                    <>
                                        <article className="bg-zinc-900 rounded p-1 relative">                                    
                                          
                                        </article>
                                        <section className="grid grid-cols-2 gap-4 w-full">










                                            <article className="bg-zinc-900 ml-1 rounded p-2 relative ">



                                                
                                                <span className='font-medium text-yellow-300 text-xl'>{formatString(fileWithLink.District) + ' - '}</span>
                                                <span className="font-medium text-yellow-300 text-xl ">{fileWithLink.City}{' - '}{fileWithLink.State}</span>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-zinc-700 mt-5 rounded p-1 max-w-fit inline-block">
                                                    <span className='font-medium text-gray-300'>{formatString(' ' + fileWithLink.RoadType) + ' Road'}</span>
                                                </article>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-sky-950 rounded p-1 my-2 max-w-fit inline-block">
                                                    <span className='font-medium text-sky-200'>{formatString(' ' + fileWithLink.Weather + ' - ' + fileWithLink.Period)}</span>
                                                </article>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-teal-950 rounded mb-2 p-1 max-w-fit inline-block">
                                                    <span className='font-medium text-teal-200'>{formatString(' ' + fileWithLink.Area + ' ')}</span>
                                                </article>


                            

<section className="grid grid-cols-3 gap-2 w-full mb-2">
    <h2 className="col-span-3 text-lg d mt-2 text-white">Video Downloads</h2>

    <DownloadButtonVideo fileId={idfrontLeft} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇖ Front  Left" />
    <DownloadButtonVideo fileId={idfrontCenter} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇑ Front Center" />
    <DownloadButtonVideo fileId={idfrontRight} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇗ Front Right" />
    <DownloadButtonVideo fileId={idrearLeft} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇙ Rear  Left" />
    <DownloadButtonVideo fileId={idrearCenter} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇓ Rear Center" />
    <DownloadButtonVideo fileId={idrearRight} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="⇘ Rear Right" />
</section>
    <DownloadButtonVideo fileId={id360} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="360 View" />

                                            </article>
                                            <article className="bg-zinc-900 rounded p-1 relative">
                                                <div className='relative z-0'>
                                                    <MapVideoFull videoName={fileWithLink.FileName} />
                                                </div>
                                                <section className="grid grid-cols-2 gap-3 w-full mb-2">
    <h2 className="col-span-2 text-lg my-2 text-white">File Downloads</h2>
    <DownloadButton fileId={idcsv} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Mf4 to Csv" />
    <DownloadButton fileId={idmf4} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Mf4" />
    <DownloadButton fileId={idimu} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="IMU.blf" />
    <DownloadButton fileId={idcan} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="CAN.blf" />
    <DownloadButton fileId={idradar} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Radar.blf" />
</section>
                                            </article>
                                        </section>
                                    </>
                                )}
                            </article>
                        </section>
                    )}
                   
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Video;
