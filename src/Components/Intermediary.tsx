import { Link } from 'react-router-dom';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import acquisitionImageV3 from "../Components/img/acquisition_v3.png"; // Imagem de exemplo para v3
import acquisitionImageV4 from "../Components/img/acquisition_v4.png"; // Imagem de exemplo para v4

const IntermediaryPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />

            <div className="my-3 ml-3">
                <Link to="/">
                    <button className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto">
                        ← Overview
                    </button>
                </Link>
            </div>
            <div className="flex-grow flex justify-center px-4">
                
                <div className="text-center text-white w-full max-w-5xl px-3">
                    <h1 className="text-4xl md:text-5xl font-bold mb-5 text-yellow-300 text-roboto">
                        DAQ - Acquisitions
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* v4 Acquisition */}
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-5 md:space-y-0 bg-gradient-to-r from-gray-900 via-green-800 to-green-950 rounded-lg p-2 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <img src={acquisitionImageV4} alt="v4 Acquisition" className="w-full md:w-1/2 lg:w-2/5 rounded-lg" />
                            <div className="text-left space-y-4 mx-5 md:mx-2 md:w-1/2">
                                <h2 className="text-2xl font-bold text-yellow-300">V4 CAPTUR Acquisitions</h2>
                                <ul className="text-base text-roboto list-disc pl-6">
                                    <li>360° view with 6 cameras (3 front, 3 rear)</li>
                                    <li>Data collection in CSV, MF4, and BLF formats</li>
                                    <li>IMU, CAN, radar, and GPS sensors</li>
                                </ul>
                                <Link to={"/FullFiles"}>
                                    <button className="bg-yellow-300 mt-3 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-2 px-6 md:px-6 rounded-full transition duration-300 text-roboto">
                                        ↓ V4 CAPTUR Acquisitions
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* v3 Acquisition */}
                        <div className="flex flex-col md:flex-row mb-5 items-center justify-between space-y-5 md:space-y-0 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-950 rounded-lg p-2 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <img src={acquisitionImageV3} alt="v3 Acquisition" className="w-full md:w-1/2 lg:w-2/5 rounded-lg" />
                            <div className="text-left space-y-4 mx-5 md:mx-2 md:w-1/2">
                                <h2 className="text-2xl font-bold text-yellow-300">V3 CAPTUR Acquisitions</h2>
                                <ul className="text-base text-roboto list-disc pl-6">
                                    <li>Front camera only</li>
                                    <li>Vehicle measurements in CSV format</li>
                                </ul>
                                <Link to={"/Search"}>
                                    <button className="bg-yellow-300 mt-3  text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-2 px-6 md:px-6 rounded-full transition duration-300 text-roboto">
                                        ↓ V3 CAPTUR Acquisitions
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default IntermediaryPage;
