// Pages/Home.tsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import MapComponent from "../Maps/MapComponent";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { loadHomeCounter } from '../Hooks/CreateCount';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import rural from "../Components/img/rural.png";
import urbano from "../Components/img/urbano.png";
import molhado from "../Components/img/molhado.png";
import utfpr from "../Components/img/utfpr.png";
import yolo from "../Components/img/yolo.gif";
import cars from "../Components/img/cars.png";
import acq from "../Components/img/acq.gif";

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
    <div className="w-full max-w-5xl flex mt-3 mb-3  flex-col md:flex-row items-center md:items-start px-3 text-white">

        
    <div className="  md:w-1/2 ml-3  text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
            <div className="flex flex-col items-center md:items-start">
            <img
    src={utfpr}
    alt="Descrição da imagem"
    width="280"
    height="60"
    className="inline-block mt-5 mb-2"
  />

                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300 text-roboto mr-3">
                    CarCara-DAQ: A Multi-Sensor Dataset for Real-Time Automotive Data Acquisition
                </h1>
                <Link to="/Intermediary">
                    <button className=" bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 md:px-6 rounded-full transition duration-300 text-roboto mb-6">
                        Download Here
                    </button>
                </Link>
            </div>
        </div>
  
        <div className="md:w-2/3 mb-5 flex justify-center items-center mr-3">
    <img 
  className="w-full max-w-md md:max-w-lg h-[250px] md:h-[300px] object-cover rounded-lg"
  src={acq} 
  alt="Descrição do GIF"
/>
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


   {/* CarCara-DAQ Test Section */}
   <div className="bg-zinc-950 flex-grow flex justify-center px-4">


    
              <div className="w-full max-w-5xl mb-3 mt-3 flex flex-col md:flex-row items-center md:items-start px-3 text-white">


              <div className="md:w-1/2 ml-7 mr-3 text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
                      <div className="flex flex-col items-center md:items-start">               
                          <h1 className="text-3xl md:text-4xl font-bold mb-4  text-yellow-300 text-roboto mr-3">
                              CarCara-DAQ: Data Acquisition Test with Advanced Technologies
                          </h1>
                          <p className="text-base md:text-lg text-gray mb-4 max-w-lg">
                              This test combines real-time data acquisition with advanced algorithms for lane detection and object identification. 
                              The integration of these technologies enables a detailed analysis of the vehicle's surroundings, contributing to research 
                              in safety and automotive automation.
                          </p>   
                      </div>
                  </div> 

             
                  <div className="md:w-1/3 ml-3 flex justify-center items-center ">
                     <img 
                      className="w-full max-w-md md:max-w-lg h-[550px] md:h-[400px] object-cover mt-1 px-3 rounded-lg"
                      src={yolo} 
  
                      alt="Descrição do GIF"
/>
                  </div>      

                         
              </div>
          </div>

            {/* Sessão Examples */}
            <div className="bg-zinc-900 text-white py-3 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-5 text-yellow-300 text-roboto">Examples</h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Placeholder for the video thumbnails */}
            <div className="flex justify-center">
              <img src={urbano} alt="Example 1" className="rounded-lg shadow-lg h-46 md:h-96" />
               </div>
               <div className="flex justify-center">
                 <img src={rural} alt="Example 2" className="rounded-lg shadow-lg h-46 md:h-96" />
               </div>
               <div className="flex justify-center">
                 <img src={molhado} alt="Example 3" className="rounded-lg shadow-lg h-46 md:h-96" />
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
<div className="bg-zinc-900 text-white py-7 px-4">
    <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Announcements</h2>
        <ul className="text-lg space-y-4">
            <li>Website Updates: July 2024 - CarCara was officially launched, featuring the v3 datasets and dynamic filtering by classifications.</li>
            <li>Website Updates: February 2025 - New acquisitions v4 are now available, including complete 360-degree camera data and all associated measurements.</li>

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
            <div className="bg-zinc-950 text-white py-10 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-yellow-400 text-xs md:text-sm py-3">Visited States:
                        <span className="text-gray-300">
                            {" " + states.join(' • ')}
                        </span>
                    </p>
                    <MapComponent states={states} />
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Home;
