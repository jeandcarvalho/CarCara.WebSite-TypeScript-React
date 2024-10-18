import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const Dictionary = () => {
    useEffect(() => {
        window.scrollTo(0, 0); // Rola para o topo da página ao carregar
    }, []);

    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    <h2 className="text-5xl font-bold mb-4 text-roboto text-left text-yellow-400 mt-4">Data Dictionary</h2>

                    {/* Introdução */}
                    <p className="text-lg font-medium text-roboto text-white mb-6">
                        The Data Dictionary provides a comprehensive overview of the various data groups collected by the CarCara system. Each data group includes specific measurements and parameters crucial for analyzing vehicle performance and behavior. Below, you'll find the categories of data we collect, along with detailed descriptions and units of measurement for each parameter.
                    </p>

                    {/* Tabela do Dicionário de Dados */}
                    <table className="min-w-full divide-y divide-gray-600">
                        <tbody className="divide-y divide-gray-600">

                            {/* IMU Data */}
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">IMU Data</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">IMU Data</td>
                                <td><strong>timestamps</strong></td>
                                <td>Time stamp for each data sample.</td>
                                <td>ms</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_AccX</strong></td>
                                <td>Acceleration in the X-axis measured by the Aceinna sensor.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_AccY</strong></td>
                                <td>Acceleration in the Y-axis measured by the Aceinna sensor.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_AccZ</strong></td>
                                <td>Acceleration in the Z-axis measured by the Aceinna sensor.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>LongitudinalAccelerationProc</strong></td>
                                <td>Processed longitudinal acceleration.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>LongitudinalAccelerationExtended</strong></td>
                                <td>Extended longitudinal acceleration.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>TransversalAcceleration</strong></td>
                                <td>Measured transverse acceleration.</td>
                                <td>m/s²</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_Pitch_Angular_Rate</strong></td>
                                <td>Pitch angle rate measured by the Aceinna sensor.</td>
                                <td>°/s</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_Roll_Angular_Rate</strong></td>
                                <td>Roll angle rate measured by the Aceinna sensor.</td>
                                <td>°/s</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Aceinna_Yaw_Angular_Rate</strong></td>
                                <td>Yaw angle rate measured by the Aceinna sensor.</td>
                                <td>°/s</td>
                            </tr>
                            
                            {/* Separador entre grupos */}
                            <tr>
                                <td colSpan="4" className="h-4"></td>
                            </tr>

                            {/* Battery Voltage Data */}
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Battery Voltage Data</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Battery Voltage Data</td>
                                <td><strong>timestamps</strong></td>
                                <td>Time stamp for each data sample.</td>
                                <td>ms</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>BatteryVoltage_V2</strong></td>
                                <td>Battery voltage measured in version 2.</td>
                                <td>V</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>BatteryVoltage</strong></td>
                                <td>Measured battery voltage.</td>
                                <td>V</td>
                            </tr>

                            {/* Separador entre grupos */}
                            <tr>
                                <td colSpan="4" className="h-4"></td>
                            </tr>

                            {/* Steering Wheel Data */}
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Steering Wheel Data</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Steering Wheel Data</td>
                                <td><strong>timestamps</strong></td>
                                <td>Time stamp for each data sample.</td>
                                <td>ms</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>SteeringWheelAngle</strong></td>
                                <td>Measured steering wheel angle.</td>
                                <td>°</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>SteeringWheelAngle_Offset</strong></td>
                                <td>Offset of the steering wheel angle.</td>
                                <td>°</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>SteeringWheelRotationSpeed</strong></td>
                                <td>Steering wheel rotation speed.</td>
                                <td>°/s</td>
                            </tr>

                            {/* Separador entre grupos */}
                            <tr>
                                <td colSpan="4" className="h-4"></td>
                            </tr>

                            {/* Fuel Efficiency Data */}
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Fuel Efficiency Data</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Fuel Efficiency Data</td>
                                <td><strong>timestamps</strong></td>
                                <td>Time stamp for each data sample.</td>
                                <td>ms</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>FuelTemperature</strong></td>
                                <td>Measured fuel temperature.</td>
                                <td>°C</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>FuelAutonomyInKm</strong></td>
                                <td>Fuel autonomy in kilometers.</td>
                                <td>km</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>FuelLevelDisplayed</strong></td>
                                <td>Displayed fuel level.</td>
                                <td>%</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>FuelConsumption</strong></td>
                                <td>Measured fuel consumption.</td>
                                <td>l/100km</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>NominalFuelConsumption</strong></td>
                                <td>Nominal fuel consumption.</td>
                                <td>l/100km</td>
                            </tr>

                            {/* Separador entre grupos */}
                            <tr>
                                <td colSpan="4" className="h-4"></td>
                            </tr>

                            {/* Speed and Braking Data */}
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-xl font-bold text-roboto text-yellow-400">Speed and Braking Data</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Speed and Braking Data</td>
                                <td><strong>timestamps</strong></td>
                                <td>Time stamp for each data sample.</td>
                                <td>ms</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Speed</strong></td>
                                <td>Measured speed of the vehicle.</td>
                                <td>km/h</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>BrakePressure</strong></td>
                                <td>Measured brake pressure.</td>
                                <td>bar</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><strong>Acceleration</strong></td>
                                <td>Overall acceleration.</td>
                                <td>m/s²</td>
                            </tr>
                            {/* Additional Data Groups can be added here */}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dictionary;
