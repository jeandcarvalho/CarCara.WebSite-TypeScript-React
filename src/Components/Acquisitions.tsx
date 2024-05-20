import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link } from "react-router-dom";
import loadgif from "../Components/img/gif.gif"
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";

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

const handleChange = selectedOption => {
  // Navegar para o link selecionado
  window.location.href = selectedOption.value;
};
const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: 'zinc', // Altere para a cor desejada para a caixa da combobox
      color: 'white', // Altere para a cor desejada para a fonte da combobox
  }),
  menu: (provided, state) => ({
    ...provided,
    backgroundColor: 'black', // Altere para a cor desejada para a caixa quando o menu é aberto
   
}),
option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'gold ' : null, // Altere para a cor desejada quando a opção é focada
    color: 'gray', // Altere para a cor desejada para a fonte da opção
}),
 
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
    <body className='bg-zinc-950 h-screen'>
        <header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-7 mt-1"
                    width="270"
                    style={{ height: "40px" }}
                />
                <div className="flex items-center mt-1">
                    <Select
                        options={options}
                        onChange={handleChange}
                        placeholder="Home"
                        className="mr-5 font-bold"
                        styles={customStyles} 
                    />
                 
                </div>
            </header>
      <div className="flex justify-center px-4 ">
        <main className="my-5 w-full md:max-w-2xl bg-zinc-950">
          <div>
            <h1 className="text-4xl font-medium mb-4 text-yellow-100 text-left mt-5">
            Changing of <br /> Acquired <span className='font-medium text-yellow-300'> States</span>
            </h1>
          </div>
          {isLoading ? (
            <div className="w-full mt-11  flex justify-center items-center">
              <img src={loadgif} alt={loadgif} className='w-32 h-32 mt-11'/>
          
        
            </div>
          ) : (
              <section className="grid grid-cols-2 gap-4 w-full">
                {uniqueStates.map((state, index) => {
                  return (
                    state !== "Not Found" ? (
                      <Link to={`/state/${state}`} key={state}>
                        <article key={index} className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200">
                          <p>
                            <span className="font-medium text-neutral-300 text-xl">State: </span>
                            <span className="font-medium text-yellow-300 text-xl">{state} </span>
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
            )}
        </main>
      </div>
    </body>
  )
}
