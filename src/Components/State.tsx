import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import  customStyles   from '../Styles/Header.tsx'


const options = [
  { value: '/', label: 'Home' },
  { value: '/About', label: 'About' }
];
const handleChange = (newValue: unknown) => {
  const selectedOption = newValue as { value: string; label: string; } | null;
  if (selectedOption !== null && 'value' in selectedOption) {
      // Navegar para o link selecionado
      window.location.href = selectedOption.value;
  }
};

interface FilesProps {
  id   : string ;
  TimeStemp : Date;
  Videoname : string;
  Bairro :string;
  Cidade :string;
  Estado :string;
  Link :string;
  Gps_y :number;
  Gps_X :number;
  Gps_Z :number;
}


const State = () => {

  const { state } = useParams();
   
  const [filesdata, setFiles] = useState<FilesProps[]>([]);
 
  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const response = await api.get("/videofiles");
    setFiles(response.data);
  }

  function getCityData(stateclicked: string) {

     const filteredData = filesdata.filter((item) => item.Estado === stateclicked);
     const cidadesFiltradas = filteredData.map((item) => item.Cidade);
     const cidadesFiltradasSemDuplicatas = cidadesFiltradas.filter((cidade, index, array) => {
      return array.indexOf(cidade) === index;
  });
  const cidadesFiltradasOrdenadas = cidadesFiltradasSemDuplicatas.sort((a, b) => {
    return a.localeCompare(b);
});


     console.log(cidadesFiltradasOrdenadas);
     return cidadesFiltradasOrdenadas;
   
  }


  
  function countDocumentsByCity(city: string): number {
    return filesdata.filter(file => file.Cidade === city).length*300;
   
  }





  
  const uniqueCities = state ? getCityData(state) : [];

  

  window.onload = function() {
    window.scrollTo(0, 0);
}

  return (
    <body className="bg-zinc-950  h-screen">
  
  
  <header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-2 mt-1"
                    width="260"
                    style={{ height: "40px" }}
                />
                <div className="flex items-center mt-1">
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
    <div className="bg-zinc-900  ">

   

    <div className="bg-zinc-950 flex justify-center px-4  ">
      <main className="my-5 w-full md:max-w-2xl h-full">
      <div className="text-left">
      <h1 className="text-4xl font-medium mb-4 text-orange-100 text-left mt-5 text-roboto">
      Changing of <br /> Acquired <span className='font-medium text-orange-300 text-roboto' > Cities</span>
      </h1>
      <h2 className="text-3xl font-normal font-siz mb-4  text-yellow-300 text-left text-roboto">
         State: {state} 
      </h2>
    </div>
        <section className="grid grid-cols-2 gap-4 w-full ">
          {uniqueCities.map((cities) => {
            return (
              cities !== "Not Found" && (
                <Link to={`/city/${cities}`} key={cities}>
                <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200 h-full">
                   <p>
                    <span className="font-medium text-neutral-300 text-xl text-roboto">City: </span>
                    <span className="font-medium text-orange-300 text-xl text-roboto">{cities} </span>
                  </p>

                  <p>
                    <span className="font-medium text-neutral-300 text-roboto">Time recorded: </span>
                    <span className="font-medium text-green-200 text-roboto"> {formatDuration(countDocumentsByCity(cities)) }  </span>
                   
                  </p>
                </article>
                </Link>
              ) 
            );
          })}
        </section>
      </main>
    </div>
    </div>
    </body>
      
  )
}

export default State;