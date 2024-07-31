import { useEffect, useState } from 'react';
import  api  from '../Services/api.ts';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import  customStyles   from '../Styles/Header.tsx'
import loadgif from "../Components/img/gif.gif"
import MapVideo from '../Classes/MapVideo';

// <MapCity cidadeSelecionada={city} />

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
  id: string;
  VideoFile: string;
  Link: string;
  Date: string;
  District: string;
  City: string;
  State: string;
  Gps_y: string;
  Gps_x: string;
  Area: string;
  RoadType: string;
  Traffic: string;
  Misc: string;
  Weather: string;
  Period: string;
}

function changeViewToPreview(link: string): string {
  // Verifica se o link contém "/view"
  if (link.includes("/view")) {
      // Substitui "/view" por "/preview"
      const modifiedLink = link.replace("/view", "/preview");
      return modifiedLink;
  } else {
      // Se "/view" não estiver presente, retorna o link original
      return link;
  }
}

const City = () => {
  async function loadFiles() {
    const response = await api.get("/videofiless?page=1&pageSize=300&searchString="+city);
    setFiles(response.data);
    setIsLoading(false);
  }

  const { city } = useParams();
   
  const [filesdata, setFiles] = useState<VideoFilesProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    loadFiles();
  }, []);





  if (city !== undefined) {
    window.onload = function() {
      window.scrollTo(0, 0);
  }
 
  const filtros = city.replace(/_/g, " ");
  const parts = filtros.split('!');
 
 const partss = parts.filter(part => part.trim() !== "");

 const result = partss.join(' - ');


 const formatString = (input: string): string => {
  return input.split(',').map(part => part.trim()).join(', ');
};

  


    return (
      <body className='bg-zinc-950 h-screen'>
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
       <div className="bg-zinc-950 flex justify-center px-4  ">
        <main className="my-5 w-full md:max-w-2xl h-full">
         <div className="text-left">
            <h1 className="text-4xl font-medium mb-4 text-orange-100 text-left">
               <span className='font-medium text-yellow-300'> Video Files</span>
            </h1>  
            
          
           
            <h2 className="text-2xl  mb-3 mt-3 w-1/2 text-orange-300 text-left">
             <p>
                <span className='text-zinc-500 font-normal'>
                   Filters: 
                </span>
                <span className='text-zinc-400 font-semibold ml-2'>
                 {result} 
                 </span>
             </p>        
           </h2>


           
         </div>

         {isLoading ? (        
           <div className="w-full mt-11  flex justify-center items-center">
              <img src={loadgif} alt={loadgif} className='w-32 h-32 mt-11 mb-11'/>  
            </div>          
          ) : (
         <section className="grid grid-cols-2 gap-4 w-full">   
          {filesdata.map((Files) => {      
            return (Files.City !== "Not Found" && Files.District !== "Not Found" && (
              <Link to={`/video/${Files.VideoFile}`} key={Files.VideoFile}>
                <article key={Files.id} className="bg-zinc-800 rounded p-3 relative hover:scale-105 duration-200  h-full">
                  <p>
                  <img
  className="flex w-full items-center justify-center"
  src={`https://drive.google.com/thumbnail?id=${Files.Link?.match(/[-\w]{25,}/)?.[0] || ''}`}
  width="240"
  height="172"
  alt="Video Thumbnail"
/>




     
                  

                     <span className="font-medium text-yellow-200 text-xl">{Files.City}{' - '}{Files.State} </span>
                     <br />
                     <span className='font-medium text-zinc-400 text-xl'>{formatString(Files.RoadType)+' Road'}</span>
                     <br />
                     <span className='font-medium text-blue-200 text-xl mt-1'>{Files.Weather+' '}</span>
                     <span className={`font-medium text-blue-200 text-xl`}>{Files.Period} </span>
                
                    
                  
                  </p>
                </article>       
              </Link>));})}
          </section>
          )}
        </main>   
       </div>
      </body>     
    )
  } else {
    // Lidar com o caso em que city é undefined
  }
}
export default City;