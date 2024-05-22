import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import  customStyles   from '../Styles/Header.tsx'
import day from "../Components/img/day.png"
import night from "../Components/img/night.png"


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

interface VideoFilesProps {
  id   : string ;
  TimeStemp : Date;
  Videoname : string;
  Bairro :string;
  Cidade :string;
  Link :string;
}

const City = () => {
  async function loadFiles() {
    const response = await api.get("/videofiles");
    setFiles(response.data);
  }


  const { city } = useParams();
   
  const [filesdata, setFiles] = useState<VideoFilesProps[]>([]);


 

  useEffect(() => {
    loadFiles();
  }, []);


  if (city !== undefined) {
    const filteredFilesData = filesdata.filter(item => item.Cidade.includes(city));

    filteredFilesData.sort((a, b) => a.Bairro.localeCompare(b.Bairro));

   

    window.onload = function() {
      window.scrollTo(0, 0);
  }
    return (
      <body className='bg-zinc-950 h-screen'>
    
    
    <header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-2 mt-2"
                    width="260"
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
      <div className="bg-zinc-950">
  
     
  
      <div className="bg-zinc-950 flex justify-center px-4  ">
        <main className="my-5 w-full md:max-w-lg h-full">
        <div className="text-left">
        <h1 className="text-4xl font-medium mb-4 text-orange-100 text-left mt-5">
     <span className='font-medium text-lime-300'> Video Files</span>
        </h1>
        <h2 className="text-3xl font-normal mb-4  text-orange-300 text-left">
           City: {city} 
        </h2>
      </div>
          <section className="grid grid-cols-1 gap-4 w-full">
          
          {filteredFilesData.map((Files) => {

  const timeStamp = new Date(Files.TimeStemp);
  const period = timeStamp.getHours() >= 18 ? "Night" : "Day";
  const periodColorClass = period === "Night" ? "text-blue-400 italic" : "text-yellow-400 italic";

  return (
    Files.Cidade !== "Not Found" && Files.Bairro !== "Not Found" && (
      <Link to={`/video/${Files.Videoname}`} key={Files.Videoname}>
        <article key={Files.id} className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200">
          <p>
           
          
            <span className="font-medium text-neutral-300 text-xl">District: </span>
            <span className="font-medium text-lime-100 text-xl">{Files.Bairro} </span>
            <br />
            <span className="font-medium text-neutral-300 text-xl">Period: </span>
            <span className={`font-medium ${periodColorClass} text-xl`}>{period} </span>
            <img
                  src={period === 'Day' ? day : night}
                  alt="Descrição da imagem"
                  className=" mb-1"
                  width={period === 'Day' ? "26" : "16"}
                  style={{ height: "25px" , display: "inline-block"}}
              />
    
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
  } else {
    // Lidar com o caso em que city é undefined
  }











  

  
}
export default City;