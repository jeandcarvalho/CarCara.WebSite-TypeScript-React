
import { Link } from "react-router-dom";

const About = () => {
    return (
<body className="bg-zinc-900 ">
<header className="bg-zinc-800 flex  px-3 ">
<h1 className="text-4xl font-semibold italic mt-1  mr-7 text-yellow-400 text-left"> CarCara</h1>
      <Link to={"/"}> 
        <p className="text-xl font-semibold  ml-11 mr-5 mb-4 mt-3 text-neutral-400      rounded relative hover:scale-110 duration-200">Home</p>
      </Link>
      <Link to={"/About"}> 
        <p className="text-xl font-semibold  ml-5  mb-4 mt-3 text-neutral-400 rounded relative hover:scale-110 duration-200">About</p>
      </Link> 
 </header>
 <div className="flex items-center justify-center h-screen">
    <div className="max-w-3xl px-2 text-center text-white mb-11">
        <h1 className="text-5xl font-bold mb-4 text-roboto text-yellow-400">About us</h1>
        
        <p className="text-xl mb-4 font-bold text-roboto ">
    Welcome to <span className="italic text-yellow-300">Carcara</span>, a platform specializing in vehicle data acquisition with precise classifications, designed for testing detection and recognition algorithms.
</p>

        <p className="text-base md:text-sm mb-8 text-roboto mt-4 text-yellow-100">Our website provides researchers with comprehensive data, including videos, measurements, and vehicle locations. Additionally, it facilitates data visualization and extraction for research in computer vision, map creation, and the calibration of sensors and radar systems. Join us in exploring the future of vehicle automation.</p>



    </div>
</div>




    
      </body>
      )



}
export default About;