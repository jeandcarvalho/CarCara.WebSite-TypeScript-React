import React, { useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useParams } from "react-router-dom";
import MapVideo from '../Maps/MapVideo';
import { Link } from "react-router-dom";
import useVideoData from '../Hooks/VideoData';
import { extrairIdGoogleDrive, formatString, changeViewToPreview } from '../Utils/VideoUtils';
import DownloadButton, { downloadFile } from '../Components/DownloadButtons';

const Video: React.FC = () => {
    const { video } = useParams<{ video?: string }>();
    const { filesdata, csvdata } = useVideoData(video);
    const csv = csvdata[0];

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on component load
    }, []);

    const fileWithLink = filesdata.find(file => file.VideoFile === video);
    const modifiedLink = fileWithLink ? changeViewToPreview(fileWithLink.Link) : '';
    const idfile = fileWithLink ? extrairIdGoogleDrive(fileWithLink.Link) : '';
    const idfilecsv = csv ? extrairIdGoogleDrive(csv.timestamps) : '';

    const handleVideoDownload = (fileId: string, fileName: string) => {
        downloadFile(fileId, fileName);
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
                                            <DownloadButton fileId={idfile} fileName="nome_do_arquivo.mp4" onClick={handleVideoDownload} title="Video File 1080p" />
                                            <DownloadButton fileId={idfilecsv} fileName="nome_do_arquivo.csv" onClick={(id, name) => { downloadFile(id, name); window.open(csv.timestamps, '_blank'); }} title="CSV Dataset" />
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
                                                <span className='font-medium text-sky-200 text-xl'>{formatString(' ' + fileWithLink.Weather + ' ' + fileWithLink.Period)}</span>
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
                                </p>
                            )}
                        </article>
                    </section>
                    {/* Section to promote the CarCara Extractor */}
                    <section className="bg-zinc-800 rounded p-4 mt-6">
                        <h2 className="text-yellow-300 text-xl font-semibold mb-2">
                            Want to learn how to extract data from the dataset? Try our CarCara Extractor!
                        </h2>
                        <p className="text-white mb-4">
                            The CarCara Extractor allows you to easily extract frames and data from the videos and datasets available on our platform. Get started with the powerful tool designed for data analysis.
                        </p>
                        <Link
                            to="/extractor"
                            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition duration-200"
                        >
                            Learn More About CarCara Extractor
                        </Link>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Video;
