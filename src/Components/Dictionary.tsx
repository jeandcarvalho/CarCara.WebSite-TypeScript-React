import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

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
                   
                        
                        {/* GPS Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">GPS Data:</strong> This category provides information about the vehicle's position in terms of latitude, longitude, and altitude. Each data point is timestamped for synchronization with other measurements. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />gps_x: -24.436697<br />gps_y: -49.84732<br />gps_z: 1076.8</pre>
                        </p>

                        {/* IMU Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">IMU Data:</strong> The Inertial Measurement Unit (IMU) records acceleration and angular velocities, which are essential for understanding the vehicle's dynamics. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />Aceinna_AccX: 0.14<br />Aceinna_AccY: 0.47<br />Aceinna_AccZ: 9.99<br />LongitudinalAccelerationProc: 0.5<br />LongitudinalAcceleration: 127<br />TransversalAcceleration: 0.064<br />Pitch_Angular_Rate: -0.890625<br />Roll_Angular_Rate: -0.140625<br />Yaw_Angular_Rate: -2.0703125</pre>
                        </p>

                        {/* Battery Voltage Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">Battery Voltage Data:</strong> This data captures the voltage of the vehicle's battery, which is critical for monitoring the electrical system's health. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />BatteryVoltage_V2: 14.22<br />BatteryVoltage: 227</pre>
                        </p>

                        {/* Steering Wheel Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">Steering Wheel Data:</strong> This category contains data related to the angle and rotation speed of the steering wheel, reflecting driver input. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />SteeringWheelAngle: 9.7<br />SteeringWheelAngle_Offset: -1.1<br />SteeringWheelRotationSpeed: -7.3</pre>
                        </p>

                        {/* Fuel Efficiency Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">Fuel Efficiency Data:</strong> Data about fuel consumption and autonomy, which helps analyze the vehicle's efficiency. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />FuelTemperature: 0<br />FuelAutonomyInKm: 1023<br />FuelLevelDisplayed: 46<br />FuelConsumption: 4400.0<br />NominalFuelConsumption: 4400.0</pre>
                        </p>

                        {/* Speed and Braking Data */}
                        <p className="mb-4">
                            <strong className="text-yellow-400">Speed and Braking Data:</strong> This group measures the vehicle's speed, wheel speeds, and braking pressure. Example:
                            <pre className="bg-gray-800 p-2 rounded">timestamps: 2024-01-29 14:35:07<br />VehicleSpeed: 74.89<br />WheelSpeed_F_L: 591.7647<br />WheelSpeed_F_R: 593.4327<br />WheelSpeed_R_L: 589.4295<br />WheelSpeed_R_R: 590.8473<br />FourWheelReferenceSpeed: 655.35<br />DisplayedSpeed: 65535<br />BrakingPressure: 0.0<br />MastervacPressure: 0.0<br />BrakingPressure_Fast: 0.0</pre>
                        </p>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dictionary;
