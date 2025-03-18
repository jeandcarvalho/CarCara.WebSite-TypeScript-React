import Header from '../Components/Header';
import Footer from '../Components/Footer';
import captur from "../Components/img/captur.png";
import jeep from "../Components/img/jeep.png";
import daf from "../Components/img/daf.png";

const About = () => {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-900">
            <Header />
{/* Index */}
<div className="bg-zinc-900 text-white py-12 px-4">
    <div className="max-w-5xl mx-auto text-center">
        {/* Título Principal */}
        <h2 className="text-5xl md:text-5xl font-bold mb-4 text-yellow-300">DAQ Architecture</h2>
        
        {/* Introdução ao Sumário */}
        <p className="text-lg text-gray-300 mb-6">
            This section provides an overview of the vehicles and data structures used in the DAQ (Data Acquisition) architecture. Click on a topic below to learn more.
        </p>

        {/* Sumário */}
        <ul className="text-lg list-disc pl-6 text-left">
            <li><a href="#introduction" className="text-yellow-300">Introduction</a></li>
            <li><a href="#captur" className="text-yellow-300">Renault CAPTUR</a></li>
            <li><a href="#daf" className="text-yellow-300">DAF CF 410</a></li>
            <li><a href="#renegade" className="text-yellow-300">Jeep Renegade</a></li>
            <li><a href="#dbc" className="text-yellow-300">Data Dictionary – DBC or DBF</a></li>
            <li><a href="#a2l" className="text-yellow-300">Data Dictionary – A2L</a></li>
        </ul>

        {/* Título para os veículos */}
        <h3 className="text-2xl md:text-3xl font-bold mt-7 mb-6 text-yellow-300">Vehicles in DAQ Architecture</h3>

        {/* Imagens lado a lado */}
        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 mt-4">
            {/* Renault Captur */}
            <div className="text-center">
                <img src={captur} alt="Renault Captur" className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg" />
                <p className="mt-2 text-yellow-300 text-lg font-semibold">Renault Captur</p>
            </div>

            {/* DAF CF 410 */}
            <div className="text-center">
                <img src={daf} alt="DAF CF 410" className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg" />
                <p className="mt-2 text-yellow-300 text-lg font-semibold">DAF CF 410</p>
            </div>

            {/* Jeep Renegade */}
            <div className="text-center">
                <img src={jeep} alt="Jeep Renegade" className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg" />
                <p className="mt-2 text-yellow-300 text-lg font-semibold">Jeep Renegade</p>
            </div>
        </div>
    </div>
</div>



            {/* Sections */}
            <div className="bg-zinc-950 text-white py-12 px-4" id="introduction">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Introduction</h2>
                </div>
            </div>

            <div className="bg-zinc-900 text-white py-12 px-4" id="captur">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Renault CAPTUR</h2>
                </div>
            </div>

            <div className="bg-zinc-950 text-white py-12 px-4" id="daf">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">DAF CF 410</h2>
                </div>
            </div>

            <div className="bg-zinc-900 text-white py-12 px-4" id="renegade">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Jeep Renegade</h2>
                </div>
            </div>

            <div className="bg-zinc-950 text-white py-12 px-4" id="dbc">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Data Dictionary – DBC or DBF</h2>
                </div>
            </div>

            <div className="bg-zinc-900 text-white py-12 px-4" id="a2l">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Data Dictionary – A2L</h2>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;
