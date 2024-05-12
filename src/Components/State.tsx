import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link } from "react-router-dom";

import { useParams } from "react-router-dom";


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
    <body>
  
  
  <header className="bg-zinc-900 flex  px-3 ">
  <h1 className="text-4xl font-semibold italic mt-1  mr-7 text-yellow-400 text-left"> CarCara</h1>
      <Link to={"/"}> 
        <p className="text-xl font-semibold  ml-11 mr-5 mb-4 mt-3 text-neutral-400      rounded relative hover:scale-110 duration-200">Home</p>
      </Link>
      <Link to={"/About"}> 
        <p className="text-xl font-semibold  ml-5  mb-4 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">About</p>
      </Link> 
 </header>
    <div className="bg-zinc-900 h-screen ">

   

    <div className="bg-zinc-900 flex justify-center px-4  ">
      <main className="my-5 w-full md:max-w-2xl h-full">
      <div className="text-left">
      <h1 className="text-4xl font-medium mb-4 text-orange-100 text-left mt-5 text-roboto">
  Change of <br /> Acquired <span className='font-medium text-orange-300 text-roboto' > Cities</span>
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
                    <span className="font-medium text-gray-100 text-roboto"> {formatDuration(countDocumentsByCity(cities)) }  </span>
                   
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