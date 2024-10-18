import Header from './Header';
import Footer from './Footer';
import acquisitionImg from '../Components/img/frontCamera.png'; // Imagem sobre as aquisições
import extractorImg from '../Components/img/extractorpic.jpg'; // Imagem sobre o extractor
import analysisImg from '../Components/img/examples.png'; // Imagem sobre a análise
import { Link } from 'react-router-dom';

const HowTo = () => {
    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-5xl px-4 text-center text-white py-3">
                    <h2 className="text-5xl font-bold mb-6 text-roboto text-yellow-400 text-left">How to Use CarCara</h2>
                    
                    {/* Seção 1 - Aquisições */}
                    <div className="flex flex-col md:flex-row items-center mb-8">
                        <img
                            src={acquisitionImg}
                            alt="Acquisition Overview"
                            className="mr-2 mb-2 md:mb-0"
                            style={{ width: "100%", height: "auto", maxWidth: "400px" }}
                        />
                        <div className="text-left md:ml-8">
                            <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">1. Data Acquisition</h3>
                            <p className="text-base font-semi md:text-sm text-roboto text-white">
                                CarCara starts by collecting vehicle data through multiple high-precision sensors and cameras during the acquisition phase. These acquisitions include videos from front and rear cameras, GPS coordinates, and other measurements.
                            </p>
                            <ul className="list-disc list-inside text-left mt-2">
                                <li>6 Cameras capturing 360° views</li>
                                <li>GPS, IMU, Radar data available</li>
                                <li>High-resolution videos</li>
                            </ul>
                            <p className="mt-4">
                                Learn more about the acquisitions on our <Link to="/acquisitions" className="text-yellow-400 underline">Acquisitions Page</Link>.
                            </p>
                        </div>
                    </div>

                    {/* Seção 2 - Extractor */}
                    <div className="flex flex-col md:flex-row items-center mb-8">
                        <img
                            src={extractorImg}
                            alt="Extractor Overview"
                            className="mr-2 mb-2 md:mb-0"
                            style={{ width: "100%", height: "auto", maxWidth: "400px" }}
                        />
                        <div className="text-left md:ml-8">
                            <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">2. Extractor Tool</h3>
                            <p className="text-base font-semi md:text-sm text-roboto text-white">
                                The CarCara Extractor is responsible for processing and converting raw data into structured formats. It extracts important metadata, measurements, and video frames, making them accessible for further analysis.
                            </p>
                            <p className="text-base font-semi md:text-sm text-roboto text-white mt-2">
                                With the extractor, you can filter the data by time, sensor type, or specific variables to focus on what matters most.
                            </p>
                            <p className="mt-4">
                                Discover more about how the extractor works on our <Link to="/extractor" className="text-yellow-400 underline">Extractor Page</Link>.
                            </p>
                        </div>
                    </div>

                    {/* Seção 3 - Data Analysis */}
                    <div className="flex flex-col items-center ">
                      
                        <div className="text-left md:ml-8 mb-8">
                            <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">3. Data Analysis</h3>
                            <p className="text-base font-semi md:text-sm text-roboto text-white">
                                Once the data has been extracted, you can utilize CarCara’s platform to perform detailed analysis. Use our powerful search tools and filters to explore data from different timeframes, sensors, and events.
                            </p>
                            <ul className="list-disc list-inside text-left mt-2">
                                <li>Search by sensor type: GPS, IMU, Radar</li>
                                <li>Filter by timeframes</li>
                                <li>Combine multiple filters for precise results</li>
                            </ul>
                            <p className="mt-4">
                                Check the full range of data types available in the <Link to="/dictionary" className="text-yellow-400 underline">Data Dictionary</Link>.
                            </p>
                        </div>
                        <img
                            src={analysisImg}
                            alt="Data Analysis Overview"
                            className="mb-4" // Adicione uma margem na parte inferior para espaçamento
                            style={{ width: "100%", height: "auto", maxWidth: "600px" }} // Ajuste a largura máxima para 600px
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HowTo;
