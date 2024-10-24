import Header from '../Components/Header';
import Footer from '../Components/Footer';
import frontCameraImg from '../Components/img/frontCamera.png'; // Certifique-se de que a imagem está no caminho correto
import { Link } from 'react-router-dom';

const OurModels = () => {
    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    <div className="">
                        <h2 className="text-5xl font-bold mb-4 text-roboto text-left text-yellow-400 mt-4">Our Models</h2>                      
                        <div className="flex flex-col md:flex-row items-center mb-8">
                            <img
                                src={frontCameraImg} // A imagem da câmera frontal
                                alt="Preview Model Description"
                                className="mr-2 mt-1 mb-2 md:mb-0"
                                style={{ width: "100%", height: "auto", maxWidth: "400px" }}
                            />
                            <div className="text-left md:ml-8">
                                <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">Preview Model</h3>
                                <p className="text-base font-semi md:text-sm text-roboto text-white">
                                    The Preview Model, available on our website, includes front camera videos along with measurement data, providing an efficient overview for initial analysis and testing. 
                                    Recent updates now include new data types from the extractor, enhancing the information available for analysis.
                                </p>
                                <ul className="list-disc list-inside text-left">
                                    <li>1 Frontal Central Axis Cam 1080p</li>
                                    <li>Measurements</li>
                                    <li>New Data Types: GPS, IMU, Radar, and more.</li>
                                </ul>
                                <p className="mt-4">
                                    For a complete overview of the available data types, please refer to our <Link to="/dictionary" className="text-yellow-400 underline">Data Dictionary</Link>.
                                </p>
                            </div>
                        </div>
                        {/* Seção "Em Breve" */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="text-left md:ml-8">
                                <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">Coming Soon</h3>
                                <p className="text-base font-semi md:text-sm text-roboto text-white">
                                    Stay tuned for our Complete Acquisition Model, which will offer a comprehensive dataset with 6 cameras (3 front and 3 rear), capturing 360° views, plus a 180° stereo ZED camera and detailed measurement data. This extensive dataset supports advanced research and development in vehicle automation. Available soon upon request.
                                </p>
                                <ul className="list-disc list-inside text-left">
                                    <li>6 Cameras Axis 360º 1080p</li>
                                    <li>Stereo Cam ZED 2k frontal central</li>
                                    <li>Measurements in 1ms</li>
                                    <li>Measurements Data in BLF (GPS, IMU, Radar, etc)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default OurModels;
