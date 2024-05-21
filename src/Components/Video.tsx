import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import { useParams } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import  customStyles   from '../Styles/Header.tsx'

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
                        tabIndex={-1}
                    />
                </div>
            </header>
        <div className="bg-zinc-950">
    
       
    
        <div className="bg-zinc-950 flex justify-center px-4  ">
          <main className="my-5 w-full md:max-w-3xl">
          <div className="text-left">
          <h1 className="text-4xl font-medium mb-4 text-blue-100 text-left ">
       <span className='font-medium text-lime-300'> Video File</span>
          </h1>
        </div >
            <section className="grid grid-cols-1 gap-4 w-full">   
            <div className='justify-center'>
            <iframe className="flex w-full items-center justify-center" src={modifiedLink} width="640" height="432" allow="autoplay"></iframe>
            </div>
         
                    <article className="bg-zinc-800 rounded p-2 relative hover:scale-105 duration-200">
                    
                      <p>
                        <span className="font-medium text-neutral-400 text-xl">City: </span>
                        <span className="font-medium text-lime-200 text-xl">{fileWithLink.Cidade} </span>
                        </p>   

                          <p>
                        <span className="font-medium text-neutral-400 text-xl">District: </span>
                        <span className="font-medium text-lime-200 text-xl">{fileWithLink.Bairro} </span>
                        </p>     

                        {/* Adicionando o período */}
    {(() => {
        const timestamp = new Date(fileWithLink.TimeStemp);
        const hours = timestamp.getHours();
        let period;
        let periodColorClass;
        if (hours >= 18 && timestamp.getMinutes() >= 30) {
            period = 'Night';
            periodColorClass = 'text-blue-400 italic';
        } else {
            period = 'Day';
            periodColorClass = 'text-yellow-400 italic';
        }

        return (
            <p>
                <span className="font-medium text-neutral-400 text-xl">Period: </span>
                <span className={`font-medium text-xl ${periodColorClass}`}>{period}</span>
            </p>
        );
    })()}

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