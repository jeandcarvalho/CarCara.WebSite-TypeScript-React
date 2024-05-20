import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import MapComponent from "../Classes/MapComponent";
import { OptionTypeBase } from 'react-select';

const Video = () => {
    // Dados estáticos dos estados percorridos e outras informações
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];

    const options = [
        { value: '/', label: 'Home' },
        { value: '/About', label: 'About' }
    ];

    const handleChange = (selectedOption: OptionTypeBase) => {
        // Navegar para o link selecionado
        window.location.href = selectedOption.value;
    };

    interface Style {
        backgroundColor?: string | null;
        color?: string;
      }

    interface CustomStyles {
        control: (provided: Style) => Style;
        menu: (provided: Style) => Style;
        option: (provided: Style, state: { isFocused: boolean }) => Style;
      }

    const customStyles : CustomStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'zinc', // Altere para a cor desejada para a caixa da combobox
            color: 'white', // Altere para a cor desejada para a fonte da combobox
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'black', // Altere para a cor desejada para a caixa quando o menu é aberto
           
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'gold ' : null, // Altere para a cor desejada quando a opção é focada
            color: 'gray', // Altere para a cor desejada para a fonte da opção
        }),
       
    };


    return (
        <body className="bg-zinc-950 h-screen">
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
            <div className="flex items-center justify-center mt-11">
                <div className="text-center text-white mb-5 ml-7 mr-7">
                    <h1 className="text-5xl font-bold mb-4 text-yellow-300 text-roboto">Vehicle Acquisitions</h1>
                    <p className="text-lg mb-8 text-roboto">Empower your vision with data</p>

                    <Link to={"/Acquisitions"}>
                        <p className="bg-yellow-300 text-zinc-900 hover:bg-yellow-100 text-lg  font-bold py-1 px-6 rounded-full transition duration-300 text-roboto">Explore Acquisitions</p>
                    </Link>
                </div>
            </div>

            <div className="  text-center ">
                <div>
                    <MapComponent states={states} />
                </div>

                <p className="text-yellow-300 mt-5">Visited States:
                    <br />
                    <span className="text-gray-300">
                        {" " + states.join(', ')}
                    </span>
                </p>
            </div>
        </body>
    )
}

export default Video;
