import { useEffect, useState } from 'react';
import api from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import MapState from '../Classes/MapState';
import carcara from '../Components/img/carcara23.png';
import customStyles from '../Styles/Header.tsx';


interface FilesProps {
  id: string;
  TimeStemp: Date;
  Videoname: string;
  Bairro: string;
  Cidade: string;
  Estado: string;
  Link: string;
  Gps_y: number;
  Gps_X: number;
  Gps_Z: number;
}

const options = [
  { value: '/', label: 'Home' },
  { value: '/About', label: 'About' }
];

const State = () => {
  const { state } = useParams();
  const [filesdata, setFiles] = useState<FilesProps[]>([]);
  const [sortBy, setSortBy] = useState<'timeRecorded' | 'city'>('timeRecorded'); // Estado para controlar a opção selecionada

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const response = await api.get('/videofiles');
    setFiles(response.data);
  }

  function getCityData(stateclicked: string) {
    const filteredData = filesdata.filter((item) => item.Estado === stateclicked);
    const uniqueCities = [...new Set(filteredData.map((item) => item.Cidade))];
    return uniqueCities.sort(); // Ordenando alfabeticamente
  }

  function countDocumentsByCity(city: string): number {
    return filesdata.filter((file) => file.Cidade === city).length * 300;
  }

  const uniqueCities = state ? getCityData(state) : [];

  const handleChange = (newValue: unknown) => {
    if (newValue !== null && typeof newValue === 'object') {
      const selectedOption = newValue as { value: string; label: string };
      setSortBy(selectedOption.value as 'timeRecorded' | 'city');
    }
  };

  const handleChangeHome = (newValue: unknown) => {
    const selectedOption = newValue as { value: string; label: string; } | null;
    if (selectedOption !== null && 'value' in selectedOption) {
        // Alterar o estado do histórico do navegador para navegar para o URL da opção selecionada
        history.pushState(null, '', selectedOption.value);
        // Disparar o evento popstate para garantir que os manipuladores de eventos do histórico sejam chamados
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }
  };

  const sortedCities = [...uniqueCities].sort((a, b) => {
    if (sortBy === 'city') {
      return a.localeCompare(b); // Ordenar por ordem alfabética
    } else {
      return countDocumentsByCity(b) - countDocumentsByCity(a); // Ordenar pelo tempo gravado em ordem decrescente
    }
  });

  return (
    <body className="bg-zinc-950 h-screen">
      <header className="flex px-3">
        <img
          src={carcara}
          alt="Descrição da imagem"
          className="mr-2 mt-2"
          width="250"
          style={{ height: '40px' }}
        />
        <div className="flex items-center mt-2">
          <Select
            options={options}                 
            styles={customStyles}
            placeholder="Home"
            className="mr-5 font-bold"
            classNamePrefix='Select'
            onChange={handleChangeHome} 
          />
        </div>
      </header>

      <div className="bg-zinc-950 flex justify-center px-4 ">
        <main className="my-5 w-full md:max-w-2xl h-full">
            <div className="text-left">
              <h1 className="text-4xl font-medium mb-4 text-orange-100 text-left text-roboto">
                Changing of <br /> Acquired <span className="font-medium text-orange-300 text-roboto">Cities</span>
              </h1>
            </div>
            <MapState estadoSelecionado={state} />
            <div className='flex'>
              <div className='mt-5 mb-2 ml-1'>              
                <Select
                  styles={customStyles}
                  placeholder="Time recorded"
                  options={[
                       { value: 'timeRecorded', label: 'Time recorded' },
                       { value: 'city', label: 'City' }, ]}
                  defaultValue={{ value: 'timeRecorded', label: 'Order:' }}         
                  className="mr-5 font-bold text-white"
                  classNamePrefix="Select"
                  onChange={handleChange}
                />
              </div>
              <h2 className="text-2xl font-normal font-siz text-yellow-300 text-left mt-5 text-roboto">
                <p>
                  <span className="text-gray-400 font-normal">State:</span>
                  <span className="text-orange-300 font-semibold"> {state} </span>
                </p>             
              </h2>
           </div>         
           <section className="grid grid-cols-2 gap-4 w-full mt-3">
              {sortedCities.map((city) => (
                <Link to={`/city/${city}`} key={city}>
                  <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200 h-full">
                    <p>
                      <span className="font-medium text-neutral-300 text-xl text-roboto">City: </span>
                      <span className="font-medium text-orange-300 text-xl text-roboto">{city} </span>
                    </p>
                    <p>
                      <span className="font-medium text-neutral-300 text-roboto">Time recorded: </span>
                      <span className="font-medium text-green-200 text-roboto">
                        {' '}
                        {formatDuration(countDocumentsByCity(city))}{' '}
                      </span>
                    </p>
                  </article>
                </Link>
              ))}
           </section>
        </main>
     </div>
    </body>
  );
};

export default State;
