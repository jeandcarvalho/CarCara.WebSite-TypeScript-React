//import extractorImg from "../Components/img/extractor.png"; // Placeholder for extractor image
import Header from './Header';
import Footer from './Footer';
import extractorpic from "../Components/img/extractorpic.jpg";
import { Link } from 'react-router-dom';

const Extractor = () => {
    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    <div className="">
                        <h2 className="text-5xl font-bold mb-4 text-roboto text-left text-yellow-400 mt-4">CarCara Extractor</h2>

                       {/* Section for Software Download and Version */}
<div className="flex flex-col md:flex-row items-center mb-8">
    <img
        src={extractorpic}
        alt="CarCara Extractor Interface"
        className="mr-2 mt-1 mb-2 md:mb-0"
        style={{ width: "100%", height: "auto", maxWidth: "400px" }}
    />
    <div className="text-left md:ml-8">
        <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">Download CarCara Extractor</h3>
        <p className="text-base font-semi md:text-sm text-roboto text-white">
            The CarCara Extractor allows you to extract frames from video files and measurements from CSV datasets obtained from the CarCara site. You can select image intervals and sensor data to analyze and export them in an organized folder structure.
        </p>
        <ul className="list-disc list-inside text-left">
            <li>Current Version: 1.0 (Updated: October 14, 2024)</li>
            <li>Compatible with: Windows 7, 8, 10</li>
        </ul>
        <a 
            href="https://drive.google.com/uc?export=download&id=1zKKXaczXBnkOarrDVI9U_Uo4KQL3Of6b" 
            className="inline-block bg-yellow-400 text-black px-4 py-2 rounded mt-4 font-bold">
            Download Now
        </a>
        <p className="text-sm text-roboto text-white mt-2">
            * It may take a few seconds after clicking for Google Drive to verify the file before the download begins.
        </p>
    </div>
</div>

                        {/* Section for What the Extractor Does */}
<div className="text-left mb-8">
    <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">What the CarCara Extractor Does</h3>
    <p className="text-base font-semi md:text-sm text-roboto text-white">
        The CarCara Extractor allows you to:
    </p>
    <ul className="list-disc list-inside text-left mb-4">
        <li>Extract images from video files at intervals of 1 second, 5 seconds, or 10 seconds.</li>
        <li>Extract data from CSV files such as:
            <ul className="list-disc list-inside text-white pl-5">
                <li>GPS (location data)</li>
                <li>IMU (inertial sensor data)</li>
                <li>Speed and braking data</li>
                <li>Steering wheel movements</li>
                <li>RGB camera frames</li>
                <li>Fuel efficiency</li>
                <li>Battery voltage</li>
                <li>Engine and transmission data</li>
            </ul>
        </li>
    </ul>
    <p className="text-base font-semi md:text-sm text-roboto text-white">
        Once the extraction is complete, the data and images are saved in a folder in the same directory as the CSV or video file.
    </p>
    <p className="text-base font-semi md:text-sm text-roboto text-white">
        For more detailed information about the extracted data, visit the <Link to="/dictionary" className="text-yellow-400 underline">Data Dictionary</Link>.
    </p>
</div>
                        {/* Section for How to Start */}
                        <div className="text-left mb-8">
    <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">How to Start</h3>
    <p className="text-base font-semi md:text-sm text-roboto text-white">
        Follow these steps to get started with the CarCara Extractor:
    </p>
    <ol className="list-decimal list-inside text-left mb-4 pl-5">
        <li>Download the CarCara Extractor as a zipped folder from the link above.</li>
        <li>Extract the folder to your preferred location on your computer.</li>
        <li>Open the folder and run the <strong>CarCara Extractor.exe</strong> file.</li>
        <li>Load your video or CSV dataset file into the software.</li>
        <li>Select the data or image intervals you wish to extract.</li>
        <li>Click "Extract" to begin processing and save the output in a new folder.</li>
    </ol>
</div>

{/* Section for How to Use */}
<div className="text-left mb-8">
    <h3 className="text-2xl font-bold mb-2 text-roboto text-yellow-300">How to Use</h3>
    <p className="text-base font-semi md:text-sm text-roboto text-white mb-4">
        The CarCara Extractor interface is designed for ease of use. Follow these simple steps:
    </p>
    <ul className="list-none text-left space-y-2">
        <li>
            <span className="font-bold text-yellow-300">1. Load Video: </span> 
            Upload the video file you downloaded from the CarCara site to extract images at specific intervals.
        </li>
        <li>
            <span className="font-bold text-yellow-300">2. Load CSV: </span> 
            Upload the CSV dataset to extract sensor data, including GPS, IMU, speed, and more.
        </li>
        <li>
            <span className="font-bold text-yellow-300">3. Select Extraction Options: </span> 
            Choose the image interval for videos (1s, 5s, or 10s) or specify which sensor data groups you want from the CSV (e.g., GPS, IMU, speed, fuel efficiency).
        </li>
        <li>
            <span className="font-bold text-yellow-300">4. Click Extract: </span> 
            Once extraction is complete, a new folder will be created with all the images or data.
        </li>
    </ul>
</div>


                       
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Extractor;
