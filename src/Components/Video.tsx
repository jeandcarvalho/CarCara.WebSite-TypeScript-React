import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

interface VideoFilesProps {
  id   : string ;
  TimeStemp : Date;
  Videoname : string;
  Bairro :string;
  Cidade :string;
  Link :string;
}

const Video = () => {

  const { video } = useParams();






  const [filesdata, setFiles] = useState<VideoFilesProps[]>([]);
   
  
  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const response = await api.get("/videofiles");
    setFiles(response.data);
  }



  const fileWithLink = filesdata.find(file => file.Videoname === video);


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





  // Agora você pode acessar as propriedades desse elemento, se ele existir
  if (fileWithLink) {
    console.log("Elemento encontrado:", fileWithLink);

    console.log("link encontrado:", fileWithLink.Link);

    const modifiedLink = changeViewToPreview(fileWithLink?.Link);

    
  window.onload = function() {
    window.scrollTo(0, 0);
}

    return (
        <body> 
          
          <header className="bg-zinc-800 flex  px-3 ">
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
          <main className="my-5 w-full md:max-w-3xl h-screen">
          <div className="text-left">
          <h1 className="text-4xl font-medium mb-4 text-blue-100 text-left ">
       <span className='font-medium text-blue-300'> Video File</span>
          </h1>
        </div >
            <section className="grid grid-cols-1 gap-4 w-full">   
            <div className='justify-center'>
            <iframe className="flex w-full items-center justify-center" src={modifiedLink} width="640" height="432" allow="autoplay"></iframe>
            </div>
         
                    <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200">
                       <p>
                       <span className="font-medium text-neutral-400 text-xl">Video: </span>
                        <span className="font-medium text-blue-100 text-xl">{(fileWithLink.Videoname).substring(0, fileWithLink.Videoname.length - 4)} </span>          
                      </p>

                      
                      <p>
                        <span className="font-medium text-neutral-400 text-xl">District: </span>
                        <span className="font-medium text-blue-200 text-xl">{fileWithLink.Bairro} </span>
                        </p>    

                      <p>
                        <span className="font-medium text-neutral-400 text-xl">City: </span>
                        <span className="font-medium text-blue-400 text-xl">{fileWithLink.Cidade} </span>
                        </p>    

                    </article>
            </section>
          </main>
        </div>
        </div>
        </body>   
      )


  } else {
    console.log("Nenhum elemento encontrado com o link fornecido.");
  }

}
export default Video;