import { Link } from "react-router-dom";

import  MapComponent  from "../Classes/MapComponent"

const Video = () => {
    // Dados estáticos dos estados percorridos e outras informações
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];
    const totalDistance = 2773; // em quilômetros
    const totalHours = 40;
    const totalGigabytes = 25;

    return (
        <body className="bg-zinc-900 h-screen">
            <header className="flex px-3">
                <h1 className="text-4xl font-semibold italic mt-1 mr-7 text-yellow-400 text-left">CarCara</h1>
                <Link to={"/"}>
                    <p className="text-xl font-semibold ml-11 mr-5 mb-4 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">Home</p>
                </Link>
                <Link to={"/About"}>
                    <p className="text-xl font-semibold ml-5 mb-11 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">About</p>
                </Link>
            </header>
            <div className="flex items-center justify-center ">
                <div className="text-center text-white mb-11 ml-7 mr-7">
                    <h1 className="text-5xl font-bold mb-4 mt-11 text-yellow-300 text-roboto">Vehicle Acquisitions</h1>
                    <p className="text-lg mb-8 text-roboto">Empower your vision with data</p>

                    <Link to={"/Acquisitions"}>
                        <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg  font-bold py-2 px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions</p>
                    </Link>
                       
                </div>
            </div>


            <div className="  text-center ml-11 mr-11">
                <div>
                <MapComponent states={states} />

                </div>


           
            

             <p className="text-yellow-300 mt-3">States visited: 
             <span className="text-gray-300">
             { " " + states.join(', ')}
             </span>
             </p>
            


            </div>

            
        </body>
    )
}

export default Video;
