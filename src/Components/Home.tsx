// Pages/Home.tsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
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
            <div className="flex-grow flex justify-center mt-7 px-4"> {/* Added lateral padding */}
                <div className="text-center text-white w-full max-w-5xl px-3"> {/* Set max-width */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-300 text-roboto">Vehicle Acquisitions</h1> {/* Changed font size on mobile */}
                    <p className="text-base md:text-lg mb-5 text-roboto">Empower your vision with data</p> {/* Adjusted font */}
                    
                    <Link to={"/Intermediary"}>
                        <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-base md:text-lg font-bold py-2 px-4 md:px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions</p> {/* Adjusted button size */}
                    </Link>

                    {/* Question about how the system works */}
                    <p className="text-yellow-100 text-base md:text-lg mt-4">
                        Want to know how the system works?  <br />
                        <Link to="/HowTo">
                            <span className="text-yellow-200 cursor-pointer underline">Click here.</span> {/* Darker yellow for less brightness */}
                        </Link>
                    </p>

                    <p className="text-yellow-400 text-xs md:text-sm py-3">Visited States:
                        <span className="text-gray-300">
                            {" " + states.join(' • ')}
                        </span>
                    </p>

                    <div className='mb-4 relative z-0'>
                        <MapComponent states={states} />
                    </div>
                </div>
            </div>      
            <Footer/>
        </div>
    );
}

export default Home;
