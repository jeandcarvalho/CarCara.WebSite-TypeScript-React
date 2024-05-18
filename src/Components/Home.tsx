
import { Link } from "react-router-dom";

const Video = () => {
    return (
<body className="bg-zinc-900  h-screen">
<header className="bg-zinc-900 flex  px-3 ">
     <h1 className="text-4xl font-semibold italic mt-1  mr-7 text-yellow-400 text-left"> CarCara</h1>
      <Link to={"/"}> 
        <p className="text-xl font-semibold  ml-11 mr-5 mb-4 mt-3 text-neutral-400      rounded relative hover:scale-110 duration-200">Home</p>
      </Link>
      <Link to={"/About"}> 
        <p className="text-xl font-semibold  ml-5  mb-11 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">About</p>
      </Link> 
 </header>
    <div className="flex items-center justify-center mt-11" > 
     <div className="text-center text-white mb-11 mt-11">
        <h1 className="text-5xl font-bold mb-4 mt-11 text-yellow-300 text-roboto">Vehicle Acquisitions</h1>
        <p className="text-lg mb-8 text-roboto">Empower your vision with data</p>

        <Link to={"/Acquisitions"}> 
        <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg ml-3 mr-3 font-bold py-2 px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions  </p>
        </Link> 




      
     </div>
    </div>
    
      </body>
      )



}
export default Video;