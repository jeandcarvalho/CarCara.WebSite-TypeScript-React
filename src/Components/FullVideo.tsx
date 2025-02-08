import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useParams } from "react-router-dom";
import MapVideo from '../Maps/MapVideo';
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
            <div className="flex-grow flex justify-center px-4">
                <main className="my-5 w-full md:w-full">
                    {isLoading ? (
                        <div className="w-full mt-11 flex justify-center items-center">
                            <img src={loadgif} alt="Loading" className='w-32 h-32 mt-11 mb-11' />
                        </div>
                    ) : (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-1">
                            {fileWithLink && (
                                <iframe
                                    className="flex w-full items-center justify-center h-96 md:h-96"
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
                                            <p className='text-white mb-2 ml-2'>Download:</p>                                      
                                            <section className="grid grid-cols-3 gap-4 w-full mb-2">
                                                
                                                <DownloadButton fileId={idcsv} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Mf4 to Csv" />
                                                <DownloadButtonVideo fileId={id360} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="360 View" />
                                                <DownloadButton fileId={idmf4} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Mf4" />       
                                                <DownloadButtonVideo fileId={idfrontLeft} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Front Left" />
                                                <DownloadButtonVideo fileId={idfrontCenter} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Front Center" />
                                                <DownloadButtonVideo fileId={idfrontRight} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Front Right" />        
                                                <DownloadButtonVideo fileId={idrearLeft} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Rear Left" /> 
                                                <DownloadButtonVideo fileId={idrearCenter} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Rear Center" /> 
                                                <DownloadButtonVideo fileId={idrearRight} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Rear Right" />  
                                                <DownloadButton fileId={idimu} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="IMU.blf" />
                                                <DownloadButton fileId={idcan} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="CAN.blf" />
                                                <DownloadButton fileId={idradar} fileName="nome_do_arquivo.mp4" onClick={handleFileDownload} title="Radar.blf" />                                     
                                            </section>
                                        </article>
                                        <section className="grid grid-cols-2 gap-4 w-full">
                                            <article className="bg-zinc-900 ml-1 rounded p-2 relative ">
                                                <span className='font-medium text-yellow-300 text-xl'>{formatString(fileWithLink.District) + ' - '}</span>
                                                <span className="font-medium text-yellow-300 text-xl ">{fileWithLink.City}{' - '}{fileWithLink.State}</span>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-zinc-700 mt-5 rounded p-1 max-w-fit inline-block">
                                                    <span className='font-medium text-gray-300 text-xl'>{formatString(' ' + fileWithLink.RoadType) + ' Road'}</span>
                                                </article>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-sky-950 rounded p-1 my-2 max-w-fit inline-block">
                                                    <span className='font-medium text-sky-200 text-xl'>{formatString(' ' + fileWithLink.Weather + ' - ' + fileWithLink.Period)}</span>
                                                </article>
                                                <br />
                                                <article key={fileWithLink.id} className="bg-teal-950 rounded mb-2 p-1 max-w-fit inline-block">
                                                    <span className='font-medium text-teal-200 text-xl'>{formatString(' ' + fileWithLink.Area + ' ')}</span>
                                                </article>
                                            </article>
                                            <article className="bg-zinc-900 rounded p-1 relative">
                                                <div className='relative z-0'>
                                                    <MapVideo videoName={video} />
                                                </div>
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
