import { Link } from 'react-router-dom';
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import logoscarcara from "../Components/img/LOGOSCARCARA.jpg";
import MapComponent from "../Classes/MapComponent";
import customStyles from '../Styles/Header.tsx';
import api from '../Services/api';
import { useEffect } from 'react';

interface FilesProps {
    id: string;
    visitantes: number;
}

const Video: React.FC = () => {
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];

    const options = [
        { value: '/', label: 'Home' },
        { value: '/About', label: 'About' },
        // Adicione outras rotas aqui, se necessário
    ];

    const handleChange = (newValue: unknown) => {
        const selectedOption = newValue as { value: string; label: string; } | null;
        if (selectedOption !== null && 'value' in selectedOption) {
            history.pushState(null, '', selectedOption.value);
            window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        }
    };

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
            <header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-2 mt-2"
                    width="250"
                    style={{ height: "40px" }}
                />
                <div className="flex items-center mt-2">
                    <Select
                        options={options}
                        styles={customStyles}
                        placeholder="Home"
                        className="mr-5 font-bold"
                        classNamePrefix='Select'
                        onChange={handleChange}
                    />
                </div>
            </header>
            <div className="flex-grow flex justify-center mt-2">
                <div className="text-center text-white ml-7 mr-7">
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


                
                </div>
            </div>
            <div className="text-center mb-2">
                <p className='text-sm font-semibold text-zinc-400 mt-5'> Partners</p>
                <img
                    src={logoscarcara}
                    alt="Descrição da imagem"
                    className="mr-2"
                    width="450"
                    style={{ height: "175px", display: 'inline-block'}}
                />
            </div>
            <footer className="bg-zinc-900 text-white py-4">
                <div className="container mx-auto text-center">
                    <p className="text-sm px-2">&copy; 2024 GSA. All rights reserved.</p>
                  
                </div>
            </footer>
        </div>
    );
}

export default Video;
/*

  <nav className="mt-2">
                        <a href="#home" className="text-zinc-400 hover:text-white mx-2">Home</a>
                        <a href="#about" className="text-zinc-400 hover:text-white mx-2">Sobre</a>
                        <a href="#services" className="text-zinc-400 hover:text-white mx-2">Serviços</a>
                        <a href="#contact" className="text-zinc-400 hover:text-white mx-2">Contato</a>
                    </nav>
*/