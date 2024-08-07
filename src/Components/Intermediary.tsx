import { Link } from 'react-router-dom';
import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import Header from './Header';
import Footer from './Footer';

const IntermediaryPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header/>
            <div className="flex-grow flex justify-center mt-7">
                <div className="text-center text-white w-full px-3">
                    <h1 className="text-5xl font-bold mb-7 text-yellow-300 text-roboto">Vehicle Acquisitions</h1>
                    <p className="text-lg mb-5 text-roboto">Choose your next action</p>
                    <div className="flex flex-col space-y-7">
                        <Link to={"/Search"}>
                            <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg font-bold py-4 px-8 rounded-full transition duration-300 text-roboto">Search Acquisitions</button>
                        </Link>
                        <Link to={"/Query/!!!!!"}>
                            <button className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg font-bold py-4 px-8 rounded-full transition duration-300 text-roboto">View All Acquisitions</button>
                        </Link>
                    </div>
                    <div className="text-center mt-11 item-center flex justify-center">
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

export default IntermediaryPage;
