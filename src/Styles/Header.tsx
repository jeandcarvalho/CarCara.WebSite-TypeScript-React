// Arquivo customStyles.js

import { StylesConfig } from 'react-select';

const customStyles: StylesConfig = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#363636',
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#363636',
    color: 'white'
  }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    backgroundColor: isSelected ? '#4a4a4a' : 'transparent', // Usando 'transparent' quando não selecionado
    color: 'white', // Cor do texto do item
    '&:hover': {
      backgroundColor: isFocused ? 'yellow' : '#666666', // Cor de fundo quando o mouse está sobre o item
      color: 'black' // Cor do texto do item quando o mouse está sobre ele
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'lightgray', // Define a cor do texto para branco
    fontWeight: 'bold', // Mantém o texto em negrito
  }),
  
  // Adicione mais estilos conforme necessário
};

export default customStyles;
