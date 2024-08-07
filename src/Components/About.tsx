import carcaraS from "../Components/img/carcara2.png";
import api from '../Services/api';
import { useEffect, useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

interface FilesProps {
    'unique id': string;
    visitantes: number;
}

const totalDistance = 2773; // em quilômetros
const totalHours = 35;
const totalGigabytes = 25;

const About = () => {
    const [filesdata, setFiles] = useState<FilesProps[]>([]);
    
    useEffect(() => {
        loadFiles();
    }, []);
    
    async function loadFiles() {
        try {
            const response = await api.get<FilesProps[]>("/counter");
            setFiles(response.data);
            console.log(response);
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }
    
    const visitors = Array.isArray(filesdata) ? filesdata.map(item => item.visitantes) : [];
    console.log(visitors);
    
    const handleButtonClick = () => {
        // Redirecionar para a página de modelos
        history.pushState(null, '', '/OurModels');
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    };

    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header/>
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white">
                    <img
                        src={carcaraS}
                        alt="Descrição da imagem"
                        className="mr-2 mt-1"
                        width="70"
                        style={{ height: "70px", display: "inline-block" }}
                    />
                    <h1 className="text-5xl font-bold mb-4 text-roboto text-yellow-400">About us</h1>
                    <p className="text-2xl mb-3 font-bold text-roboto">
                        Welcome to <span className="italic text-yellow-300">CarCara</span>, a platform specializing in vehicle data acquisition with precise classifications, designed for testing detection and recognition algorithms.
                    </p>
                    <button
                        onClick={handleButtonClick}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
                    >
                        Learn about our models
                    </button>
                    <p className="text-base font-semi md:text-sm text-roboto text-yellow-100">
                        Our website provides researchers with comprehensive data, including videos, measurements, and vehicle locations. Additionally, it facilitates data visualization and extraction for research in computer vision, map creation, and the calibration of sensors and radar systems. Join us in exploring the future of vehicle automation.
                    </p>
                    <p className="text-yellow-400 mt-3">Visitors: {visitors}</p>
                    <p className="text-gray-400 mt-1">Total Distance: {totalDistance} km</p>
                    <p className="text-gray-400">Total Hours Recorded: {totalHours} hours</p>
                    <p className="text-gray-400">Total Terabytes Used: {totalGigabytes} TB</p>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default About;
