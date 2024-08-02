import { Link } from 'react-router-dom';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import MapComponent from "../Classes/MapComponent";
import api from '../Services/api';
import { useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

interface FilesProps {
    id: string;
    visitantes: number;
}

const Video: React.FC = () => {
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];
    
    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        try {
            await api.post<FilesProps[]>("/homecounter");
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header/>
            <div className="flex-grow flex justify-center mt-7">
                <div className="text-center text-white w-full px-3">
                    <h1 className="text-5xl font-bold mb-4 text-yellow-300 text-roboto">Vehicle Acquisitions</h1>
                    <p className="text-lg mb-5 text-roboto">Empower your vision with data</p>
                      <Link to={"/Search"}>
                         <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg font-bold py-1 px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions</p>
                      </Link>
                    <p className="text-yellow-300 text-sm py-3">Visited States:
                      <span className="text-gray-300">
                         {" " + states.join(' • ')}
                      </span>
                    </p>
                    <MapComponent states={states} />
                    <div className="text-center mb-2">
                    <p className='text-sm font-semibold text-zinc-400 mt-2 mb-2'> Partners</p>
                    <img
                        src={logoscarcara}
                        alt="Descrição da imagem"
                        className="w-full max-w-[580px] h-auto"
                        style={{ maxHeight: "150px", display:'inline-block' }}
                    />
                    </div>       
                </div>
            </div>      
            <Footer/>
        </div>
    );
}
export default Video;