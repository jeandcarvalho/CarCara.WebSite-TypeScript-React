import { Link } from 'react-router-dom';
import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import MapComponent from "../Classes/MapComponent";
import  customStyles   from '../Styles/Header.tsx'



const Video: React.FC = () => {
    // Dados estáticos dos estados percorridos e outras informações
    const states = ["São Paulo", "Espírito Santo", "Minas Gerais", "Rio de Janeiro", "Paraná"];

    const options = [
        
        { value: '/', label: 'Home' },
        { value: '/About', label: 'About' },
        // Adicione outras rotas aqui, se necessário
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

    
      
    return (
        <div className="bg-zinc-950 h-screen">
            <header className="flex px-3">
                <img
                    src={carcara}
                    alt="Descrição da imagem"
                    className="mr-2 mt-1"
                    width="260"
                    style={{ height: "40px" }}
                />
                <div className="flex items-center mt-1">
                
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
        </div>
    )
}

export default Video;
