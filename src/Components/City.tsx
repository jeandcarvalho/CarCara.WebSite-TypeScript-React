import { useEffect, useState } from 'react';
import { api } from '../Services/api';

import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";


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

    let aux = 0;

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
        <main className="my-5 w-full md:max-w-lg h-full">
        <div className="text-left">
        <h1 className="text-4xl font-medium mb-4 text-blue-100 text-left mt-5">
     <span className='font-medium text-blue-300'> Video Files</span>
        </h1>
        <h2 className="text-3xl font-normal mb-4  text-orange-300 text-left">
           City: {city} 
        </h2>
      </div>
          <section className="grid grid-cols-1 gap-4 w-full">
          
            {filteredFilesData.map((Files) => {
               aux++;
             
              return (
                Files.Cidade !== "Not Found" && Files.Bairro != "Not Found"  && (

                 
                  <Link to={`/video/${Files.Videoname}`} key={Files.Videoname}>
                  <article key={Files.id} className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200">
                     <p>
                     <span className="font-medium text-neutral-300 text-xl">Video: </span>
                      <span className="font-medium text-blue-300 text-xl">{aux} </span>

                      <span className="font-medium text-neutral-300 text-xl">District: </span>
                      <span className="font-medium text-blue-300 text-xl">{Files.Bairro} </span>
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