
import { Link } from "react-router-dom";
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";

const totalDistance = 2773; // em quilômetros
const totalHours = 40;
const totalGigabytes = 25;


const options = [
  { value: '/', label: 'Home' },
  { value: '/About', label: 'About' }
];

const handleChange = selectedOption => {
  // Navegar para o link selecionado
  window.location.href = selectedOption.value;
};
const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: 'zinc', // Altere para a cor desejada para a caixa da combobox
      color: 'white', // Altere para a cor desejada para a fonte da combobox
  }),
  menu: (provided, state) => ({
      ...provided,
      backgroundColor: 'black', // Altere para a cor desejada para a caixa quando o menu é aberto
     
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'gold ' : null, // Altere para a cor desejada quando a opção é focada
      color: 'gray', // Altere para a cor desejada para a fonte da opção
  }),
 
};


const About = () => {
    return (
<body className="bg-zinc-950 h-screen ">
<header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-7 mt-1"
                    width="270"
                    style={{ height: "40px" }}
                />
                <div className="flex items-center mt-1">
                    <Select
                        options={options}
                        onChange={handleChange}
                        placeholder="Home"
                        className="mr-5 font-bold"
                        styles={customStyles} 
                    />
                 
                </div>
            </header>
 <div className="flex items-center justify-center mt-11  mr-7 ml-7">
    <div className="max-w-3xl px-2 text-center text-white mb-11">
        <h1 className="text-5xl font-bold mb-4 text-roboto  text-yellow-400">About us</h1>
        
        <p className="text-xl mb-4 font-bold text-roboto ">
    Welcome to <span className="italic text-yellow-300">CarCara</span>, a platform specializing in vehicle data acquisition with precise classifications, designed for testing detection and recognition algorithms.
</p>

        <p className="text-base md:text-sm mb-8 text-roboto mt-11 text-yellow-100">Our website provides researchers with comprehensive data, including videos, measurements, and vehicle locations. Additionally, it facilitates data visualization and extraction for research in computer vision, map creation, and the calibration of sensors and radar systems. Join us in exploring the future of vehicle automation.</p>


       
                <p className="text-gray-400 mt-11">Total Distance: {totalDistance} km</p>
                <p className="text-gray-400">Total Hours Recorded: {totalHours} hours</p>
                <p className="text-gray-400">Total Terabytes Used: {totalGigabytes} TB</p>

    </div>
</div>


      </body>
      )



}
export default About;