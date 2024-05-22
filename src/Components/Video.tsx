import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import { useParams } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import day from "../Components/img/day.png"
import night from "../Components/img/night.png"
import  customStyles   from '../Styles/Header.tsx'
import { json2csv } from "json-2-csv";

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
      // Alterar o estado do histórico do navegador para navegar para o URL da opção selecionada
      history.pushState(null, '', selectedOption.value);
      // Disparar o evento popstate para garantir que os manipuladores de eventos do histórico sejam chamados
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
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


 


  function extrairIdGoogleDrive(link: string | undefined): string | null {
    if (link && link.includes("/file/d/")) {
        const startIdx = link.indexOf("/file/d/") + "/file/d/".length;
        const endIdx = link.indexOf("/view", startIdx);
        const id = link.substring(startIdx, endIdx);
        return id;
    } else if (link && link.includes("id=")) {
        const startIdx = link.indexOf("id=") + "id=".length;
        const id = link.substring(startIdx);
        return id;
    } else {
        return null;
    }
}


function downloadVideo(fileId: string, fileName: string) {
  if (!fileId || !fileName) {
      console.error("Invalid file ID or file name");
      return;
  }

  const url: string = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const link: HTMLAnchorElement = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function downloadCSV() {
  if (filesdata.length === 0) {
    console.error("No data to download");
    return;
  }
  if (video !== undefined) {
  const novaConstante: string = video.slice(0, -4);
  const csvData = json2csv(filesdata);
  const blob = new Blob([csvData], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", novaConstante + ".csv");
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  }

 
  
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

    const idfile = extrairIdGoogleDrive(fileWithLink.Link);


    
    

    
  window.onload = function() {
    window.scrollTo(0, 0);
    
}

interface DownloadButtonProps {
  fileId: string | null;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileId, fileName }) => {
  const handleClick = () => {
      if (fileId !== null) {
          downloadVideo(fileId, fileName);
      } else {
          console.error("File ID is null");
      }
  };

  return (
      <button className='text-white' onClick={handleClick}>Download Video</button>
  );
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
       
            <section className="grid grid-cols-1 gap-4 w-full">   

                    <article className="bg-zinc-800 rounded p-2 relative">
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
          <p className=''>
            



                      <span className="font-medium text-neutral-400 text-xl ">District: </span>
                        <span className="font-medium text-lime-200 text-xl mr-5">{fileWithLink.Bairro} - {fileWithLink.Cidade} </span>
                     
              <span className="font-medium text-neutral-400 text-xl">Period: </span>
              <span className={`font-medium text-xl ${periodColorClass}`}>{period}</span>
      
              <img
                  src={period === 'Day' ? day : night}
                  alt="Descrição da imagem"
                  className="ml-1 mb-1"
                  width={period === 'Day' ? "27" : "17"}
                  style={{ height: "25px" , display: "inline-block"}}
              />
          </p>
      );
    })()}
    

                    </article>
                    <iframe className="flex w-full items-center justify-center" src={modifiedLink} width="640" height="432" allow="autoplay"></iframe>
                    
                    <section className="grid grid-cols-3 gap-4 w-full ">


                    <article className="bg-zinc-800 rounded p-2 relative w-full text-center">
                   
                   <DownloadButton fileId={idfile} fileName="nome_do_arquivo.mp4" />
 
                   </article>

                



                    <article className="bg-zinc-800 rounded p-2 relative text-center w-full ">
                    
                    <button className='text-white' onClick={downloadCSV}>Download Measurements</button>
    
                    </article>

                   


                   
                    </section>

                    
                    


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