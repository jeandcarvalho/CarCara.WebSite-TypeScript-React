import carcaraS from "../Components/img/carcara2.png";
//import previewModelImg from "../Components/img/previewModel.png";
//import fullModelImg from "../Components/img/fullModel.png";
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const OurModels = () => {
    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header/>
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    
                    <div className="mt-8">
                        <h2 className="text-4xl font-bold mb-4 text-roboto text-left text-yellow-400">Our Models</h2>
                        <div className="flex flex-col md:flex-row items-center mb-8">
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
                                <ul className="list-disc list-inside text-left">
                                    <li>1 Frontal Central Axis Cam 1080p</li>
                                    <li>Geo Coordinates in 1ms</li>
                                </ul>
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
                                <ul className="list-disc list-inside text-left">
                                    <li>6 Cameras Axis 360º 1080p</li>
                                    <li>Stereo Cam zed 2k frontal central</li>
                                    <li>Geo Coordinates in 1ms</li>
                                    <li>Measurements Data in BLF (GPS, IMU, Radar, etc)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default OurModels;
