import Select from 'react-select';
import carcara from "../Components/img/carcara23.png";
import carcaraS from "../Components/img/carcara2.png";
//import previewModelImg from "../Components/img/previewModel.png";
//import fullModelImg from "../Components/img/fullModel.png";
import customStyles from '../Styles/Header.tsx';



const options = [
  { value: '/', label: 'Home' },
  { value: '/About', label: 'About' }
];

const handleChange = (newValue: unknown) => {
    const selectedOption = newValue as { value: string; label: string; } | null;
    if (selectedOption !== null && 'value' in selectedOption) {
        history.pushState(null, '', selectedOption.value);
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }
};

const OurModels = () => {
    return (
        <body className="bg-zinc-950 min-h-screen">
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
            <div className="flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    <img
                        src={carcaraS}
                        alt="Descrição da imagem"
                        className="mr-2 mt-1"
                        width="150"
                        style={{ height: "150px", display: "inline-block" }}
                    />
           
                    <div className="mt-8">
                        <h2 className="text-4xl font-bold mb-4 text-roboto text-left text-yellow-400">Our Models</h2>
                        <div className="flex flex-col md:flex-row items-center  mb-8">
                            <img
                               // src={ }
                           //     alt="Preview Model Description"
                           //     className="mr-2 mt-1 mb-2 md:mb-0"
                           //     style={{ width: "100%", height: "auto", maxWidth: "400px" }}
                            />
                            <div className="text-left md:ml-8">
                                <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">Preview Model</h3>
                                <p className="text-base font-semi md:text-sm text-roboto text-white">
                                    The Preview Model, available on our website, includes front camera videos along with measurement data, providing an efficient overview for initial analysis and testing.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                            <img
                               // src={}
                           //     alt="Full Model Description"
                           //     className="mr-2 mt-1 mb-2 md:mb-0"
                           //     style={{ width: "100%", height: "auto", maxWidth: "400px" }}
                            />
                            <div className="text-left md:ml-8">
                                <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300 mt-4 md:mt-0">Complete Acquisition Model</h3>
                                <p className="text-base font-semi md:text-sm text-roboto text-white">
                                    The Complete Acquisition Model offers a comprehensive dataset with 6 cameras (3 front and 3 rear), capturing 360° views, plus a 180° stereo ZED camera and detailed measurement data. This extensive dataset supports advanced research and development in vehicle automation. Available soon upon request.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
};

export default OurModels;
