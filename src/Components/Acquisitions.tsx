import { useEffect, useState } from 'react';
import { api } from '../Services/api';
import formatDuration from '../Classes/DateTimeFormat';
import { Link } from "react-router-dom";
import loadgif from "../Components/img/gif.gif"

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
    <body className='bg-zinc-900 h-screen'>
      <header className="bg-zinc-900 flex  px-3 ">
        <h1 className="text-4xl font-semibold italic mt-1  mr-7 text-yellow-400 text-left"> CarCara</h1>
        <Link to={"/"}>
          <p className="text-xl font-semibold  ml-11 mr-5 mb-4 mt-3 text-neutral-400      rounded relative hover:scale-110 duration-200">Home</p>
        </Link>
        <Link to={"/About"}>
          <p className="text-xl font-semibold  ml-5  mb-4 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">About</p>
        </Link>
      </header>
      <div className="flex justify-center px-4 ">
        <main className="my-5 w-full md:max-w-2xl bg-zinc-900">
          <div>
            <h1 className="text-4xl font-medium mb-4 text-yellow-100 text-left mt-5">
              Change of <br /> Acquired <span className='font-medium text-yellow-300'> States</span>
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
