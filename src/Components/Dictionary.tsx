import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import gpsData from "../Components/img/gps.jpg"; // Image of GPS data
import imuData from "../Components/img/imu.jpg";
import steeringWheel from "../Components/img/steering.jpg";
import fuelEfficiency from "../Components/img/fuel.jpg";
import speedBraking from "../Components/img/speed.jpg";
import baterry from "../Components/img/voltage.jpg";

const Dictionary = () => {
    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page on load
    }, []);

    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="w-full max-w-5xl px-3 mx-4 text-center text-white py-3">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-roboto text-yellow-400 mt-4">Data Dictionary</h2>
                    {/* Introduction */}
                    <p className="text-base md:text-lg font-medium text-roboto text-white mb-3">
                        The Data Dictionary offers an overview of the data groups collected by the CarCara system, detailing the specific measurements and parameters essential for analyzing vehicle performance and behavior.
                        <br />
                        <h3 className="text-xl md:text-2xl font-bold mb-4 text-roboto text-left text-yellow-400 mt-4">Data Synchronization</h3>
                        All examples in the dictionary correspond to the same acquisition moment recorded by the instrumented vehicle, which users can identify through the timestamps provided.
                    </p>
                    <div className="mt-8 p-4 md:p-6 bg-zinc-900 rounded-lg shadow-lg text-base md:text-lg font-medium text-roboto text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400 underline">Detailed Descriptions of Data Categories</h3>
                        <p className="mb-4">
                            <strong className="text-yellow-400">GPS Data:</strong> This category includes data obtained from the Global Positioning System, providing information about the vehicle's location in terms of latitude, longitude, and altitude. Each GPS data point is timestamped to correlate with other data points collected at that specific time.
                        </p>
                        <p className="mb-4">
                            <strong className="text-yellow-400">IMU Data:</strong> The Inertial Measurement Unit (IMU) data captures information related to acceleration and angular rates in three-dimensional space. It is crucial for analyzing vehicle dynamics and behavior during different driving conditions.
                        </p>
                        <p className="mb-4">
                            <strong className="text-yellow-400">Battery Voltage Data:</strong> This category tracks the voltage levels of the vehicle's battery system, essential for monitoring the electrical system's health and performance.
                        </p>
                        <p className="mb-4">
                            <strong className="text-yellow-400">Steering Wheel Data:</strong> Steering wheel angle measurements are included in this category, providing insight into the driver's input and the vehicle's handling characteristics.
                        </p>
                        <p className="mb-4">
                            <strong className="text-yellow-400">Fuel Efficiency Data:</strong> This data category measures the vehicle's fuel consumption efficiency, allowing for performance evaluations and comparisons against industry standards.
                        </p>
                        <p className="mb-4">
                            <strong className="text-yellow-400">Speed and Braking Data:</strong> This category captures the vehicle's speed and braking states, which are critical for understanding performance metrics and safety evaluations.
                        </p>
                    </div>
                    {/* Data Dictionary Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                       
                            <tbody className="divide-y divide-gray-600">
                                {/* GPS Data */}
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">GPS Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={gpsData} alt="GPS Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                                </tr>
                                {/* IMU Data */}
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">IMU Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={imuData} alt="IMU Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                                </tr>
                                {/* Steering Wheel Data */}
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Steering Wheel Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={steeringWheel} alt="Steering Wheel Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                                </tr>
                                {/* Fuel Efficiency Data */}
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Fuel Efficiency Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={fuelEfficiency} alt="Fuel Efficiency Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                               </tr>                         
                                {/* Speed and Braking Data */}
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Speed and Braking Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={speedBraking} alt="Speed and Braking Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                                </tr>

                                 {/* Voltage Data */}
                                 <tr>
                                    <td colSpan={4} className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Battery Voltage Data</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2">
                                        <img src={baterry} alt="Speed and Braking Data" className="w-full h-auto mb-4 rounded" />
                                    </td>
                                </tr>                              
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default Dictionary;
