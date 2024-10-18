import React, { useRef } from 'react';
import Select, { Props as SelectProps, SelectInstance } from 'react-select';
import { useNavigate } from 'react-router-dom';
import carcara from "../Components/img/carcara23.png";
import customStyles from '../Styles/Header.tsx';

const options = [
  { value: '/', label: 'Home' },
  { value: '/HowTo', label: 'How to Use' },  
  { value: '/Intermediary', label: 'Acquisitions' },
  { value: '/Extractor', label: 'Extract' },
  { value: '/Dictionary', label: 'Dictionary' },
  { value: '/OurModels', label: 'Our Models' },
  { value: '/About', label: 'About' },  
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const selectRef = useRef<SelectInstance<SelectProps, false>>(null); // Use SelectInstance as type

  const handleChange = (newValue: unknown) => {
    const selectedOption = newValue as { value: string; label: string; } | null;
    if (selectedOption !== null && 'value' in selectedOption) {
      navigate(selectedOption.value);
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }
  };

  const handleMenuOpen = () => {
    selectRef.current?.blur(); // Desfoca o seletor ao abrir o menu
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-3 bg-black shadow-md">
      <img
        src={carcara}
        alt="Descrição da imagem"
        className="mr-2 mb-2 md:mb-2"
        width="250"
        style={{ height: "40px" }}
      />
      <div className="flex items-center w-full md:w-auto">
        <Select
          ref={selectRef}
          options={options}
          styles={customStyles}
          placeholder="Home"
          className="w-full md:w-auto mr-5 font-bold p-2"
          classNamePrefix='Select'
          onChange={handleChange}
          onMenuOpen={handleMenuOpen} // Chamado para desfocar a entrada quando o menu abre
        />
      </div>
    </header>
  );
};

export default Header;
