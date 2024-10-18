import React from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead
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
  const navigate = useNavigate(); // Use useNavigate to get the navigate function

  const handleChange = (newValue: unknown) => {
    const selectedOption = newValue as { value: string; label: string; } | null;
    if (selectedOption !== null && 'value' in selectedOption) {
      navigate(selectedOption.value); // Use navigate to change routes
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }
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
          options={options}
          styles={customStyles}
          placeholder="Home"
          className="w-full md:w-auto mr-5 font-bold p-2"
          classNamePrefix='Select'
          isSearchable={false}
          onChange={handleChange}
        />
      </div>
    </header>
  );
};

export default Header;
