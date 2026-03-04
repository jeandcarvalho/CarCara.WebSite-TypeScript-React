import { useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { loadHomeCounter } from "../Hooks/CreateCount";

import logoscarcara from "../Components/img/LOGOSCARCARA2.jpg";
import cars from "../Components/img/cars.png";
import acq from "../Components/img/acq.gif";
import ai1 from "../Components/img/ai1.jpg";
import ai2 from "../Components/img/ai2.jpg";

import {
  HeroPanel,
  ExamplesPanel,
  CarsArchitecturePanel,
  ToolsPanel,
  AnnouncementsPanel,
  CollaboratorsPanel,
  MapPanel,
} from "../Components/HomePanels";

const Home: React.FC = () => {
  const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];

  useEffect(() => {
    const fetchData = async () => {
      await loadHomeCounter();
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />

      <HeroPanel acq={acq} />
      <ExamplesPanel ai1={ai1} ai2={ai2} />
      <CarsArchitecturePanel cars={cars} />
      <ToolsPanel />
      <AnnouncementsPanel />
      <CollaboratorsPanel logoscarcara={logoscarcara} />
      <MapPanel states={states} />

      <Footer />
    </div>
  );
};

export default Home;