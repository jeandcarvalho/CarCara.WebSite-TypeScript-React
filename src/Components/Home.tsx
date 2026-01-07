// Pages/Home.tsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import MapComponent from "../Maps/MapComponent";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { loadHomeCounter } from '../Hooks/CreateCount';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";

import cars from "../Components/img/cars.png";
import acq from "../Components/img/acq.gif";
import ai1 from "../Components/img/ai1.jpg";
import ai2 from "../Components/img/ai2.jpg";

const Home: React.FC = () => {
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];
    useEffect(() => {
        const fetchData = async () => {
            await loadHomeCounter();
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-900">
            <Header />



           {/* Sessão CarCara-360DAQ */}
<div className="bg-zinc-950 flex-grow flex justify-center px-4">
  <div className="w-full max-w-5xl flex mt-3 mb-3 flex-col md:flex-row items-center md:items-start px-3 text-white">

    {/* Coluna esquerda */}
    <div className="md:w-1/2 ml-3 text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
      <div className="flex flex-col items-center md:items-start">

        {/* NOVO BLOCO (substitui o logo utfpr) */}
        <div className="mt-5 mb-4">
          <h2 className="text-sm uppercase tracking-widest text-zinc-400 mb-2">
            CarCara Platform
          </h2>

          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-yellow-300 text-roboto">
            AI-Driving for<br className="hidden md:block" />
            Smarter Mobility
          </h1>

          <p className="mt-4 text-zinc-300 text-base md:text-lg max-w-md text-roboto">
            A multimodal automotive data platform combining vision, vehicle telemetry,
            and contextual intelligence to support perception, reasoning, and driving
            assistance research.
          </p>
        </div>

        {/* Mini highlights (opcional, mas deixa mais “site de verdade”) */}
        <div className="flex flex-wrap gap-2 mt-2 mb-4 justify-center md:justify-start">
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs">
            Multimodal Driving Data
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs">
            Vision + Language
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs">
            Transformer-Based Perception
          </span>
        </div>

        {/* Botão melhor que "Start Here" */}
        <Link to="/fullfiles">
          <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-200 text-base md:text-lg font-bold py-2 px-6 rounded-full transition duration-300 text-roboto mb-6">
            Explore Driving Data
          </button>
        </Link>
      </div>
    </div>

    {/* Coluna direita (imagem/gif) */}
    <div className="md:w-2/3 mb-5 flex justify-center items-center mr-3 mt-5">
      <img
        className="w-full max-w-md md:max-w-lg h-[140px] md:h-[300px] object-cover rounded-lg"
        src={acq}
        alt="CarCara preview"
      />
    </div>

  </div>
</div>








            {/* Sessão Examples */}
            <div className="bg-zinc-900 text-white py-3 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Placeholder for the video thumbnails 
            
            import rural from "../Components/img/rural.png";
import urbano from "../Components/img/urbano.png";
import molhado from "../Components/img/molhado.png";
 <div className="flex justify-center">

              <img src={urbano} alt="Example 1" className="rounded-lg shadow-lg h-46 md:h-96 my-4" />
               </div>
               <div className="flex justify-center">
                 <img src={rural} alt="Example 2" className="rounded-lg shadow-lg h-46 md:h-96" />
               </div>
               <div className="flex justify-center">
                 <img src={molhado} alt="Example 3" className="rounded-lg shadow-lg h-46 md:h-96" />
               </div>*/}


         <div className="flex justify-center">
                 <img src={ai1} alt="Example 2" className="rounded-lg shadow-lg h-48 md:h-96 mt-3" />
               </div>

                 <div className="flex justify-center">
                 <img src={ai2} alt="Example 2" className="rounded-lg shadow-lg h-48 md:h-96" />
               </div>

             </div>

                </div>
            </div>



            
{/* Section - Architecture of the 3 Cars */}
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
                    This section provides an overview of the vehicles and data structures used in the Data Acquisition (DAQ) architecture. Learn more about the Renault CAPTUR, DAF CF 410, and Jeep Renegade, and explore their respective data formats.
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



            {/* Sessão Tools */}
<div className="bg-zinc-950 text-white py-7 px-4">
    <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Tools</h2>
        <p className="text-lg mb-6">
            We provide a Python tool to convert MF4 files to CSV for easy processing. The tool uses the <strong>asammdf</strong> library, which allows you to convert measurement files from the MF4 format into CSV format for further analysis. You can also adjust the time rate, which by default is set to 1 second, in the script.
        </p>
        <p className="text-lg mb-6">
            You can access the repository and download the tool from the link below:
        </p>
        <a
            href="https://github.com/jeandcarvalho/MF4-Converter"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 rounded-full transition duration-300 text-roboto"
        >
            Visit MF4-Converter Repository
        </a>
    </div>
</div>



{/* Sessão Announcements */}
<div className="bg-zinc-900 text-white py-6 px-4">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-yellow-300 text-roboto">
      Announcements
    </h2>

    <ul className="text-base md:text-sm space-y-3 leading-relaxed">
      <li>
        <b>July 2024</b> — CarCara was officially launched, featuring the v3 datasets and dynamic
        filtering by classifications.
      </li>

      <li>
        <b>October–December 2024</b> — Dataset enrichment phase: expanded semantic metadata,
        reverse geocoding, and road and environmental context integration.
      </li>

      <li>
        <b>February 2025</b> — New acquisitions v4 are now available, including complete 360-degree
        camera data and all associated measurements.
      </li>

      <li>
        <b>March 2025</b> — Improved website fluidity, new “Architecture” page covering the three
        instrumented vehicles, and a redesigned homepage.
      </li>

      <li>
        <b>June 2025</b> — Data normalization milestone: migration toward a unified 1 Hz
        structure across sensors and perception streams.
      </li>

      <li>
        <b>September 2025</b> — Backend and frontend adaptation to normalized collections:
        API restructuring, query optimization, and support for workflows over curated data.
      </li>

      <li>
        <b>November 2025</b> — User system introduced with per-account collections,
        enabling curated datasets and controlled AI experimentation within the platform.
      </li>

      <li>
        <b>December 2025</b> — AI analysis layer introduced, allowing curated
        collections to be processed and interpreted through language-model–based reasoning and reporting.
      </li>
    </ul>
  </div>
</div>



            {/* Sessão Collaborators */}
            <div className="bg-zinc-950 text-white pt-7 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Collaborators</h2>
                    <div className="flex justify-center space-x-6">
                        <img src={logoscarcara} alt="Collaborator 1" className="rounded-full shadow-lg" />
                
                    </div>
                </div>
            </div>

            {/* Sessão Mapa e Estados Visitados */}
            <div className="bg-zinc-950 text-white py-5 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-yellow-400 text-xs md:text-sm py-3">Visited States:
                        <span className="text-gray-300">
                            {" " + states.join(' • ')}
                        </span>
                    </p>
                    <MapComponent states={states} />
                </div>

                <div className="flex justify-center items-center mt-5">
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-3 px-5 rounded-full transition duration-300 text-roboto"
  >
    ↑ Back to Top
  </button>
</div>
            </div>
            

            <Footer />
        </div>
    );
}

export default Home;
