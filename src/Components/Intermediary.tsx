// Pages/Intermediary.tsx
import { Link } from 'react-router-dom';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import search from "../Components/img/search.png";
import viewall from "../Components/img/viewall.png";
import acquisitionImageV3 from "../Components/img/acquisition_v3.png"; // Imagem de exemplo para v3
import acquisitionImageV4 from "../Components/img/acquisition_v4.png"; // Imagem de exemplo para v4

const IntermediaryPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />
            <div className="flex-grow flex justify-center mt-5 px-4"> {/* Adicionei padding lateral */}
                <div className="text-center text-white w-full max-w-5xl px-3"> {/* Defini um max-width */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-5 text-yellow-300 text-roboto">DAQ - Acquisitions</h1> {/* Alterei o tamanho da fonte no mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8"> {/* Ajustei para grid, 2 colunas no desktop */}
                        {/* v4 Acquisition */}
<div className="flex flex-col md:flex-row items-center justify-between space-y-5 md:space-y-0">
    <img src={acquisitionImageV4} alt="v4 Acquisition" className="w-full md:w-1/2 rounded-lg" />
    <div className="text-left space-y-4 mx-5">
        <h2 className="text-2xl font-bold text-yellow-300">v4 Acquisitions</h2>
        
        {/* v4 Acquisition Topics */}
        <div className="space-y-3">
            <p className="text-base text-roboto">
            The v4 acquisition offers a 360° view with 6 cameras (3 front, 3 rear) and collects data in CSV, MF4, and BLF formats from IMU, CAN, radar, and GPS sensors.
            </p>
              {/* Action Button */}
        <Link to={"/FullFiles"}>
            <button className="bg-yellow-300 mt-3 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-2 px-6 md:px-6 rounded-full transition duration-300 text-roboto flex items-center justify-center">
                <img src={viewall} alt="View All Icon" className="mr-2 h-6 w-6" />
                v4 Acquisitions
            </button>
        </Link>

         
        </div>

      
    </div>
</div>













                        {/* Aquisição V3 */}
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-5 md:space-y-0">
                            <img src={acquisitionImageV3} alt="Aquisição v3" className="w-full md:w-1/2 rounded-lg" />
                            <div className="text-left space-y-4 mx-5">
                                <h2 className="text-2xl font-bold text-yellow-300">v3 Acquisitions</h2>
                                <p className="text-base text-roboto">
                                    The v3 acquisition includes only a front camera and vehicle measurements in CSV format.
                                </p>
                                <Link to={"/Search"}>
                                    <button className="bg-yellow-300 mt-3 mb-7 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-2 px-6 md:px-6 rounded-full transition duration-300 text-roboto flex items-center justify-center">
                                        <img src={search} alt="Ícone de Busca" className="mr-2 h-6 w-6" />
                                        v3 Acquisitions
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
