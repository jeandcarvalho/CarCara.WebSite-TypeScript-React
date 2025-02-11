// Pages/Home.tsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import MapComponent from "../Maps/MapComponent";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { loadHomeCounter } from '../Hooks/CreateCount';
import view360 from "../Components/img/tela 360.png";
import carprocess from "../Components/img/car process.png";
import carsensors from "../Components/img/car sensors.png";
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import rural from "../Components/img/rural.png";
import urbano from "../Components/img/urbano.png";
import molhado from "../Components/img/molhado.png";

const Home: React.FC = () => {
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];
    useEffect(() => {
        const fetchData = async () => {
            await loadHomeCounter();
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />
          
          {/* Sessão CarCara-360DAQ */}
<div className="flex-grow flex justify-center mt-7 px-4">
    <div className="w-full max-w-5xl flex flex-col md:flex-row items-center md:items-start px-3 text-white">
        <div className="md:w-1/2 text-center md:text-left flex justify-center md:justify-start md:items-center h-full">
            <div className="flex flex-col items-center md:items-start">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 text-yellow-300 text-roboto">
                    CarCara-360DAQ: A Multi-Sensor Dataset for Real-Time Automotive Data Acquisition
                </h1>
                <Link to="/Intermediary">
                    <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 md:px-6 rounded-full transition duration-300 text-roboto mb-6">
                        Download Dataset
                    </button>
                </Link>
            </div>
        </div>
        <div className="md:w-1/2 flex justify-center items-center">
            <iframe
                className="w-full max-w-md md:max-w-lg h-[300px] md:h-[505px]" // Definindo a altura para mobile e desktop
                src="https://drive.google.com/file/d/1YP9Tu6hxK7wCV1Eu1log8akPNlhTEAo6/preview?usp=sharing&vq=hd1080"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
            ></iframe>
        </div>
    </div>
</div>


            {/* Sessão About */}
            <div className="bg-zinc-900 text-white py-12 mt-11 px-4">
                <div className="max-w-5xl mx-auto text-center">            
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">About CarCara-360DAQ</h2>
                    <div className="flex justify-center">
                <img src={view360} alt="Example 1" className="rounded-lg w-2/3 shadow-lg mb-7 mt-3" />
                        </div>
                    <p className="text-lg mb-6">
                        CarCara-360DAQ is a comprehensive dataset built for real-time automotive data acquisition, providing insights into vehicle behavior and environmental interactions. 
                        With data from multi-sensor setups, including cameras, radar, IMU, and GPS, our platform enables advanced analysis and research in automotive technologies.
                    </p>
                </div>
            </div>

            {/* Sessão Data Acquisition System Architecture */}
            <div className="bg-zinc-950 text-white py-12 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Data Acquisition System Architecture - DAQ – CAPTUR</h2>
                    <p className="text-lg mb-6">
                        Our instrumented vehicle is equipped with five sensors strategically positioned to capture essential data during trips. The acquisition and processing flow follows an optimized pipeline to ensure accuracy and reliability.
                    </p>
                    <div className="flex justify-center">
                <img src={carsensors} alt="Example 1" className="rounded-lg w-full shadow-lg mb-7 mt-3" />
                        </div>
                    <ul className="list-disc pl-6 text-left space-y-2">
                        <li><strong>Onboard Computer</strong> – Responsible for system control and operator interface.</li>
                        <li><strong>Smart Logger</strong> – Collects, synchronizes, and stores raw sensor data.</li>
                        <li><strong>Dataset DBA</strong> – Structured database where records are stored for further analysis.</li>
                        <li><strong>Concentrator</strong> – Module that manages communication between sensors and the Smart Logger.</li>
                        <li><strong>Sensors</strong> – Radar, CAN, 6 cameras, IMU, and GPS.</li>
                    </ul>
                    <p className="text-lg mt-4">
                        Each stage of the flow undergoes a calibration and configuration process to ensure that the collected data is accurate and usable. The system setup is designed for easy adaptation to different test scenarios, allowing for adjustments as needed.
                    </p>
                </div>
            </div>

            {/* Sessão Data Storage and Processing */}
            <div className="bg-zinc-950 text-white pb-12 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Data Storage and Processing – DAQ Captur</h2>
                    <p className="text-lg mb-6">
                        The vehicle’s data acquisition system follows a structured flow for efficient storage and processing, ensuring that sensor data is organized and accessible for analysis.
                    </p>
                    <div className="flex justify-center">
                <img src={carprocess} alt="Example 1" className="rounded-lg w-full shadow-lg mb-7 mt-3" />
                        </div>
                    <ul className="list-disc pl-6 text-left space-y-2">
                        <li><strong>DAQ Sensors</strong> – The vehicle is equipped with multiple real-time data acquisition sensors:</li>
                        <li>6 Cameras – Strategically positioned to capture a complete view of the environment.</li>
                        <li>Radar, CAN, IMU, and GPS – Capture variables such as obstacle detection, vehicle internal data, acceleration, and geographic position.</li>
                        <li><strong>Smart Logger</strong> – Centralizes and stores collected data, with a 4 to 8 TB capacity for continuous recording.</li>
                        <li><strong>DAQ Management</strong> – Interface displayed on the onboard computer monitor, allowing real-time management of data acquisition.</li>
                        <li><strong>DAQ Record</strong> – Sensor recordings are saved in storage and also sent to the Lab Database for DAQ Dataset GSA.</li>
                    </ul>
                </div>
            </div>

            {/* Sessão Examples */}
            <div className="bg-zinc-900 text-white py-12 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Examples</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Placeholder for the video thumbnails */}
                        <div className="flex justify-center">
                       
                                <img src={urbano} alt="Example 1" className="rounded-lg shadow-lg h-36" />
                          
                        </div>
                        <div className="flex justify-center">
  
        <img src={rural} alt="Example 2" className="rounded-lg shadow-lg h-36" />

</div>

                        <div className="flex justify-center">
                      
                                <img src={molhado} alt="Example 3" className="rounded-lg shadow-lg h-36" />
                        
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Sessão Tools */}
<div className="bg-zinc-950 text-white py-12 px-4">
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
<div className="bg-zinc-900 text-white py-12 px-4">
    <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">Announcements</h2>
        <ul className="text-lg space-y-4">
            <li>Website Updates: July 2024 - CarCara was officially launched, featuring the v3 datasets and dynamic filtering by classifications.</li>
            <li>Website Updates: February 2025 - New acquisitions v4 are now available, including complete 360-degree camera data and all associated measurements.</li>

        </ul>
    </div>
</div>


            {/* Sessão Collaborators */}
            <div className="bg-zinc-950 text-white pt-12 px-4">
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
