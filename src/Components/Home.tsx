// Pages/Home.tsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import MapComponent from "../Maps/MapComponent";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { loadHomeCounter } from '../Classes/apiService';

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
            <Header/>
            <div className="flex-grow flex justify-center mt-7 px-4"> {/* Adicionei padding lateral */}
                <div className="text-center text-white w-full max-w-5xl px-3"> {/* Defini um max-width */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-300 text-roboto">Vehicle Acquisitions</h1> {/* Alterei o tamanho da fonte no mobile */}
                    <p className="text-base md:text-lg mb-5 text-roboto">Empower your vision with data</p> {/* Fonte ajustada */}
                    <Link to={"/Intermediary"}>
                        <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 md:px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions</p> {/* Tamanho de botão ajustado */}
                    </Link>

                    <p className="text-yellow-300 text-xs md:text-sm py-3">Visited States:
                        <span className="text-gray-300">
                            {" " + states.join(' • ')}
                        </span>
                    </p>

                    <MapComponent states={states} />
                    <div className="text-center mb-2">
                        <p className='text-xs md:text-sm font-semibold text-zinc-400 mt-2 mb-2'>Partners</p>
                        <img
                            src={logoscarcara}
                            alt="Descrição da imagem"
                            className="w-full max-w-[300px] md:max-w-[580px] h-auto"  // Ajustei o max-width da imagem para mobile
                            style={{ maxHeight: "150px", display: 'inline-block' }}
                        />
                    </div>
                </div>
            </div>      
            <Footer/>
        </div>
    );
}

export default Home;
