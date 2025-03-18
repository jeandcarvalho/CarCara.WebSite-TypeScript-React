import useFetchFiles from '../Hooks/Counter';
import carcaraS from "../Components/img/carcara2.png";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import view360 from "../Components/img/tela 360.png";
import carprocess from "../Components/img/car process.png";
import carsensors from "../Components/img/car sensors.png";

const totalDistance = 2773; // em quilômetros
const totalHours = 35;
const totalGigabytes = 25;

const About = () => {
    const filesdata = useFetchFiles();

    const visitors = Array.isArray(filesdata) 
        ? filesdata.map(item => item.visitantes) 
        : [];



    return (
        <div className="min-h-screen flex flex-col bg-zinc-900">
            <Header />
        
                


                
            {/* Sessão About */}
            <div className="bg-zinc-900 text-white py-12 mt-5 px-4">
                <div className="max-w-5xl mx-auto text-center">            
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-roboto">About CarCara-DAQ</h2>
                    <div className="flex justify-center">
                <img src={view360} alt="Example 1" className="rounded-lg w-full shadow-lg mb-7 mt-3" />
                        </div>
                    <p className="text-lg mb-6">
                        CarCara-DAQ is a comprehensive dataset built for real-time automotive data acquisition, providing insights into vehicle behavior and environmental interactions. 
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



                    
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white mt-7">
                    <img
                        src={carcaraS}
                        alt="Descrição da imagem"
                        className="mr-2 mt-1"
                        width="70"
                        style={{ height: "70px", display: "inline-block" }}
                    />
                    <h1 className="text-5xl font-bold mb-4 text-roboto text-yellow-400">
                        About us
                    </h1>
                    <p className="text-2xl mb-3 font-bold text-roboto">
                        Welcome to <span className="italic text-yellow-300">CarCara</span>, a platform specializing in vehicle data acquisition with precise classifications.
                    </p>
                   
                    <p className="text-base font-semi md:text-sm text-roboto text-yellow-100">
                        Our website provides researchers with comprehensive data, including videos, measurements, and classifications. Additionally, it facilitates data visualization and extraction for research in computer vision, map creation, and the calibration of sensors and radar systems.
                    </p>
                    <p className="text-yellow-400 mt-3">Visitors: {visitors}</p>
                    <p className="text-gray-400 mt-1">Total Distance: {totalDistance} km</p>
                    <p className="text-gray-400">Total Hours Recorded: {totalHours} hours</p>
                    <p className="text-gray-400">Total Terabytes Used: {totalGigabytes} TB</p>
                </div>
           
            </div>








            </div>
            <Footer />
        </div>
    );
};

export default About;
