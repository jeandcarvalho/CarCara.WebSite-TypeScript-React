import Header from '../Components/Header';
import Footer from '../Components/Footer';
import captur from "../Components/img/captur.png";
import captur1 from "../Components/img/captur1.png";
import captur2 from "../Components/img/captur2.png";
import captur3 from "../Components/img/captur3.png";
import captur4 from "../Components/img/captur4.png";
import captur5 from "../Components/img/captur5.png";
import { useEffect } from 'react';
import jeep from "../Components/img/jeep.png";
import jeep1 from "../Components/img/jeep1.png";
import jeep2 from "../Components/img/jeep2.png";
import jeep3 from "../Components/img/jeep3.png";
import jeep4 from "../Components/img/jeep4.png";
import daf from "../Components/img/daf.png";
import daf1 from "../Components/img/daf1.png";
import daf2 from "../Components/img/daf2.png";
import daf3 from "../Components/img/daf3.png";
import daf4 from "../Components/img/daf4.png";
import dic from "../Components/img/dic.png";
import dic2 from "../Components/img/dic2.png";
import dic3 from "../Components/img/dic3.png";

const About = () => {
  useEffect(() => {
    // sempre sobe pro topo ao abrir a página
    window.scrollTo(0, 0);
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />


      {/* Index */}
      <div className="bg-zinc-900 text-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Título Principal */}
          <h2 className="text-5xl md:text-5xl font-bold mb-4 mt-2 text-yellow-300">DAQ Architecture</h2>

          {/* Introdução ao Sumário */}
          <p className="text-lg text-gray-300 mb-6">
            This section provides an overview of the vehicles and data structures used in the DAQ (Data Acquisition) architecture. Click on a topic below to learn more.
          </p>

          {/* Sumário */}
          <ul className="text-lg list-disc pl-6 text-left space-y-1">
            <li>
              <button type="button" onClick={() => scrollToId('introduction')} className="text-yellow-300 underline">
                Introduction
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('captur')} className="text-yellow-300 underline">
                Renault CAPTUR
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('daf')} className="text-yellow-300 underline">
                DAF CF 410
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('renegade')} className="text-yellow-300 underline">
                Jeep Renegade
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('dbc')} className="text-yellow-300 underline">
                Data Dictionary – DBC or DBF
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToId('a2l')} className="text-yellow-300 underline">
                Data Dictionary – A2L
              </button>
            </li>
          </ul>

          {/* Título para os veículos */}
          <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-6 text-yellow-300">Vehicles in DAQ Architecture</h3>

          {/* Imagens lado a lado */}
          <div className="flex flex-wrap sm:flex-nowrap justify-center mx-2 mb-2 gap-6 mt-4">
            {/* Renault Captur */}
            <div className="text-center">
              <button type="button" onClick={() => scrollToId('captur')}>
                <img
                  src={captur}
                  alt="Renault Captur"
                  className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                />
              </button>
              <p className="mt-2 text-yellow-300 text-lg font-semibold">Renault Captur</p>
            </div>

            {/* DAF CF 410 */}
            <div className="text-center">
              <button type="button" onClick={() => scrollToId('daf')}>
                <img
                  src={daf}
                  alt="DAF CF 410"
                  className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                />
              </button>
              <p className="mt-2 text-yellow-300 text-lg font-semibold">DAF CF 410</p>
            </div>

            {/* Jeep Renegade */}
            <div className="text-center">
              <button type="button" onClick={() => scrollToId('renegade')}>
                <img
                  src={jeep}
                  alt="Jeep Renegade"
                  className="w-32 h-32 md:w-60 md:h-60 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                />
              </button>
              <p className="mt-2 text-yellow-300 text-lg font-semibold">Jeep Renegade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-zinc-950 text-white py-5 px-4" id="introduction">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Introduction</h2>
          <img src={captur1} alt="Introduction" className="mx-auto block rounded-lg shadow-lg" />
        </div>
      </div>

      <div className="bg-zinc-900 text-white py-5 px-4" id="captur">
        <div className="max-w-5xl mx-auto text-center ">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Renault CAPTUR</h2>
          <img src={captur2} alt="Renault CAPTUR" className="mx-auto block rounded-lg shadow-lg" />
          <img src={captur3} alt="Renault CAPTUR" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={captur4} alt="Renault CAPTUR" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={captur5} alt="Renault CAPTUR" className="mx-auto block rounded-lg shadow-lg mt-3" />
        </div>
      </div>

      <div className="flex justify-center items-center mb-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-3 px-5 rounded-full transition duration-300 text-roboto"
        >
          ↑ Back to Top
        </button>
      </div>

      <div className="bg-zinc-950 text-white py-5 px-4" id="daf">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">DAF CF 410</h2>
          <img src={daf1} alt="DAF CF 410" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={daf2} alt="DAF CF 410" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={daf3} alt="DAF CF 410" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={daf4} alt="DAF CF 410" className="mx-auto block rounded-lg shadow-lg mt-3" />
        </div>

        <div className="flex justify-center items-center mt-5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-3 px-5 rounded-full transition duration-300 text-roboto"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 text-white py-5 px-4" id="renegade">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Jeep Renegade</h2>
          <img src={jeep1} alt="Jeep Renegade" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={jeep2} alt="Jeep Renegade" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={jeep3} alt="Jeep Renegade" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={jeep4} alt="Jeep Renegade" className="mx-auto block rounded-lg shadow-lg mt-3" />
        </div>
      </div>

      <div className="flex justify-center items-center mb-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-3 px-5 rounded-full transition duration-300 text-roboto"
        >
          ↑ Back to Top
        </button>
      </div>

      <div className="bg-zinc-950 text-white py-5 px-4" id="dbc">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Data Dictionary – DBC or DBF</h2>
          <img src={dic} alt="DBC/DBF" className="mx-auto block rounded-lg shadow-lg mt-3" />
          <img src={dic2} alt="DBC/DBF" className="mx-auto block rounded-lg shadow-lg mt-3" />
        </div>
      </div>

      <div className="bg-zinc-950 text-white py-5 px-4" id="a2l">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300">Data Dictionary – A2L</h2>
        </div>

        <img src={dic3} alt="A2L" className="mx-auto block rounded-lg shadow-lg mt-3" />

        <div className="flex justify-center items-center mt-5 ">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
