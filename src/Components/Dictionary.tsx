import Header from './Header';
import Footer from './Footer';

const Dictionary = () => {
    return (
        <div className="bg-zinc-950 min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center mt-3">
                <div className="mr-7 ml-7 max-w-3xl px-2 text-center text-white py-3">
                    <h2 className="text-5xl font-bold mb-4 text-roboto text-left text-yellow-400 mt-4">Data Dictionary</h2>

                    {/* IMU Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">IMU Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>Aceinna_AccX:</strong> Acceleration in the X-axis measured by the Aceinna sensor.</li>
                            <li><strong>Aceinna_AccY:</strong> Acceleration in the Y-axis measured by the Aceinna sensor.</li>
                            <li><strong>Aceinna_AccZ:</strong> Acceleration in the Z-axis measured by the Aceinna sensor.</li>
                            <li><strong>LongitudinalAccelerationProc:</strong> Processed longitudinal acceleration.</li>
                            <li><strong>LongitudinalAccelerationExtended:</strong> Extended longitudinal acceleration.</li>
                            <li><strong>TransversalAcceleration:</strong> Measured transverse acceleration.</li>
                            <li><strong>Aceinna_Pitch_Angular_Rate:</strong> Pitch angle rate measured by the Aceinna sensor.</li>
                            <li><strong>Aceinna_Roll_Angular_Rate:</strong> Roll angle rate measured by the Aceinna sensor.</li>
                            <li><strong>Aceinna_Yaw_Angular_Rate:</strong> Yaw angle rate measured by the Aceinna sensor.</li>
                        </ul>
                    </div>

                    {/* Battery Voltage Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">Battery Voltage Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>BatteryVoltage_V2:</strong> Battery voltage measured in version 2.</li>
                            <li><strong>BatteryVoltage:</strong> Measured battery voltage.</li>
                        </ul>
                    </div>

                    {/* Steering Wheel Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">Steering Wheel Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>SteeringWheelAngle:</strong> Measured steering wheel angle.</li>
                            <li><strong>SteeringWheelAngle_Offset:</strong> Offset of the steering wheel angle.</li>
                            <li><strong>SteeringWheelRotationSpeed:</strong> Steering wheel rotation speed.</li>
                        </ul>
                    </div>

                    {/* Fuel Efficiency Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">Fuel Efficiency Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>FuelTemperature:</strong> Measured fuel temperature.</li>
                            <li><strong>FuelAutonomyInKm:</strong> Fuel autonomy in kilometers.</li>
                            <li><strong>FuelLevelDisplayed:</strong> Displayed fuel level.</li>
                            <li><strong>FuelConsumption:</strong> Measured fuel consumption.</li>
                            <li><strong>NominalFuelConsumption:</strong> Nominal fuel consumption.</li>
                        </ul>
                    </div>

                    {/* Speed and Braking Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">Speed and Braking Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>VehicleSpeed:</strong> Measured vehicle speed.</li>
                            <li><strong>WheelSpeed_F_L:</strong> Speed of the front left wheel.</li>
                            <li><strong>WheelSpeed_F_R:</strong> Speed of the front right wheel.</li>
                            <li><strong>WheelSpeed_R_L:</strong> Speed of the rear left wheel.</li>
                            <li><strong>WheelSpeed_R_R:</strong> Speed of the rear right wheel.</li>
                            <li><strong>FourWheelReferenceSpeed:</strong> Reference speed for all four wheels.</li>
                            <li><strong>DisplayedSpeed:</strong> Displayed speed on the dashboard.</li>
                            <li><strong>BrakingPressure:</strong> Measured braking pressure.</li>
                            <li><strong>MastervacPressure:</strong> Measured master vacuum pressure.</li>
                            <li><strong>BrakingPressure_Fast:</strong> Measured fast braking pressure.</li>
                        </ul>
                    </div>

                    {/* Engine and Transmission Data Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-2 text-roboto text-yellow-300">Engine and Transmission Data</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>timestamps:</strong> Time stamp for each data sample.</li>
                            <li><strong>EngineTorque_WithoutTMReq:</strong> Engine torque without transmission requirements.</li>
                            <li><strong>MaximumInstantTorque:</strong> Maximum instantaneous engine torque.</li>
                            <li><strong>MinimumInstantTorque:</strong> Minimum instantaneous engine torque.</li>
                            <li><strong>EngineRPM:</strong> Engine rotation speed in RPM.</li>
                            <li><strong>MeanEffectiveTorque:</strong> Mean effective engine torque.</li>
                            <li><strong>RequestedTorqueAfterProc:</strong> Requested torque after processing.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dictionary;
