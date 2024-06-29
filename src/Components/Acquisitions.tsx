import { useEffect, useState } from 'react';
import  api  from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link } from "react-router-dom";
import loadgif from "../Components/img/gif.gif"
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import  customStyles   from '../Styles/Header.tsx'
import MapComponentAll from "../Classes/MapComponentAll"

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

const handleChange = (newValue: unknown) => {
  const selectedOption = newValue as { value: string; label: string; } | null;
  if (selectedOption !== null && 'value' in selectedOption) {
      // Alterar o estado do histórico do navegador para navegar para o URL da opção selecionada
      history.pushState(null, '', selectedOption.value);
      // Disparar o evento popstate para garantir que os manipuladores de eventos do histórico sejam chamados
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  }
};

export default function Acquisitions() {
  const [filesdata, setFiles] = useState<FilesProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    loadFiles();
  }, []);
  async function loadFiles() {
    try {
      const response = await api.get("/videofiles");
      setFiles(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setIsLoading(false);
    }
  }
  const uniqueStates = [...new Set(filesdata.map(item => item.Estado))];
  console.log(uniqueStates.length)
  function countDocumentsByState(state: string): number {
    const count = filesdata.reduce((acc, curr) => {
      if (curr.Estado === state) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return count * 300;
  }
  window.onload = function () {
    window.scrollTo(0, 0);
  }
  return (
  <body className='bg-zinc-950 min-h-screen'>
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
   <div className="flex justify-center px-4 ">
        <main className="my-5 w-full h-full md:max-w-2xl bg-zinc-950">
          <div>
            <h1 className="text-4xl font-medium mb-4 text-yellow-100 text-left">
            Changing of <br /> Acquired <span className='font-medium text-yellow-300'> States</span>
            </h1>
          </div>
          {isLoading ? (        
           <div className="w-full mt-11  flex justify-center items-center">
              <img src={loadgif} alt={loadgif} className='w-32 h-32 mt-11 mb-11'/>  
            </div>          
          ) : (
            <div className=''>
              <MapComponentAll />            
              <section className="grid grid-cols-2 gap-4 w-full mt-4">
                {uniqueStates.map((state, index) => {
                  return (
                    state !== "Not Found" ? (
                      <Link to={`/state/${state}`} key={state}>
                        <article key={index} className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200 h-full">
                          <p>
                            <span className="font-medium text-neutral-300">State: </span>
                            <span className="font-medium text-yellow-300">{state} </span>
                          </p>
                          <p>
                            <span className="font-medium text-neutral-300">Country: </span>
                            <span className="font-medium text-yellow-200">{'Brazil'} </span>
                          </p>
                          <p>
                            <span className="font-medium text-neutral-300">Time recorded: </span>
                            <span className="font-medium text-green-200 "> {formatDuration(countDocumentsByState(state))}  </span>
                          </p>
                        </article>
                      </Link>
                    ) : null
                  );
                })}
              </section>
              </div>
            )}
        </main>
   </div>   
 </body>
  )
}
