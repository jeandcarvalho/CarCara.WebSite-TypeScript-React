// Pages/Intermediary.tsx
import { Link } from 'react-router-dom';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import search from "../Components/img/search.png";
import viewall from "../Components/img/viewall.png";

const IntermediaryPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />
            <div className="flex-grow flex justify-center mt-5 px-4"> {/* Adicionei padding lateral */}
                <div className="text-center text-white w-full max-w-5xl px-3"> {/* Defini um max-width */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 text-yellow-300 text-roboto">Vehicle Acquisitions</h1> {/* Alterei o tamanho da fonte no mobile */}
                    <p className="text-base md:text-lg mb-5 text-roboto">Choose your next action</p> {/* Fonte ajustada */}
                    <div className="flex flex-col items-center space-y-5 md:space-y-7"> {/* Alinhamento centralizado */}
                        <Link to={"/Search"}>
                            <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-3 px-6 md:px-6 rounded-full transition duration-300 text-roboto flex items-center justify-center"> {/* Flex para alinhar ícone e texto */}
                                <img src={search} alt="Ícone de Busca" className="mr-2 h-6 w-6" />
                                Search
                            </button>
                        </Link>
                        <Link to={"/Query/!!!!!"}>
                            <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-3 md:py-3 px-6 md:px-6 rounded-full transition duration-300 text-roboto flex items-center justify-center"> {/* Flex para alinhar ícone e texto */}
                                <img src={viewall} alt="Ícone de Visualizar Todos" className="mr-2  h-6 w-6" />
                                All Acquisitions
                            </button>
                        </Link>         
                    </div>
                    <div>
                    <p className='mt-7'>
                    Partners:
                    </p>
                    <div className="text-center mt-3 flex justify-center">                                      
                        <img
                            src={logoscarcara}
                            alt="Descrição da imagem"
                            className="w-full max-w-[500px] md:max-w-[700px] h-auto"  // Ajustei o max-width da imagem para mobile
                            style={{ maxHeight: "300px", display: 'inline-block' }}
                        />
                    </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default IntermediaryPage;
