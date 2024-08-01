
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import customStyles from '../Styles/Header.tsx';

const options = [
  { value: '/', label: 'Home' },
  { value: '/Search', label: 'Acquisitions' },
  { value: '/About', label: 'About' },
  { value: '/OurModels', label: 'Our Models' },
];

const handleChange = (newValue: unknown) => {
  const selectedOption = newValue as { value: string; label: string; } | null;
  if (selectedOption !== null && 'value' in selectedOption) {
    history.pushState(null, '', selectedOption.value);
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  }
};

const Header: React.FC = () => (
  <header className="flex px-3">
    <img
      src={carcara}
      alt="Descrição da imagem"
      className="mr-2 mt-2"
      width="250"
      style={{ height: "40px" }}
    />
    <div className="flex items-center">
      <Select
        options={options}
        styles={customStyles}
        placeholder="Home"
        className="mr-5 font-bold p-2"
        classNamePrefix='Select'
        onChange={handleChange}
      />
    </div>
  </header>
);

export default Header;
