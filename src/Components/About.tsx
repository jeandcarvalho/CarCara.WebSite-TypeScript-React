import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import carcaraS from "../Components/img/carcara2.png";
import  customStyles   from '../Styles/Header.tsx'


const totalDistance = 2773; // em quilômetros
const totalHours = 35;
const totalGigabytes = 25;


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


const About = () => {
    return (
<body className="bg-zinc-950 h-screen ">
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
 <div className="flex justify-center  mt-3  ">
    <div className=" mr-7 ml-7 max-w-3xl px-2 text-center text-white">


       <img
           src={carcaraS}
           alt="Descrição da imagem"
           className="mr-2 mt-1"
           width="150"
           style={{ height: "150px" , display: "inline-block" }}
        />
        <h1   
           className="text-5xl font-bold mb-4 text-roboto  text-yellow-400">About us 
        </h1>
        
        <p className="text-2xl mb-3 font-bold text-roboto ">
            Welcome to <span className="italic text-yellow-300">CarCara</span>, a platform specializing in vehicle data acquisition with precise classifications, designed for testing detection and recognition algorithms.
       </p>

        <p className="text-base font-semi md:text-sm  text-roboto  text-yellow-100">Our website provides researchers with comprehensive data, including videos, measurements, and vehicle locations. Additionally, it facilitates data visualization and extraction for research in computer vision, map creation, and the calibration of sensors and radar systems. Join us in exploring the future of vehicle automation.</p>      
        <p className="text-gray-400 mt-5">Total Distance: {totalDistance} km</p>
        <p className="text-gray-400">Total Hours Recorded: {totalHours} hours</p>
        <p className="text-gray-400">Total Terabytes Used: {totalGigabytes} TB</p>

    </div>
</div>


      </body>
      )



}
export default About;