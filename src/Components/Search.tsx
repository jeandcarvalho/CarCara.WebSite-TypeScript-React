import { useEffect, useState } from 'react';
import  api  from '../Services/api.ts';
import loadgif from "../Components/img/gif.gif"
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';


interface FilesProps {
  id: string;
  VideoFile: string;
  Link: string;
  Date: string;
  District: string;
  City: string;
  State: string;
  Gps_y: string;
  Gps_x: string;
  Area: string;
  RoadType: string;
  Traffic: string;
  Misc: string;
  Weather: string;
  Period: string;
}

export default function Acquisitions() {
  const [filesdata, setFiles] = useState<FilesProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTraffic, setSelectedTraffic] = useState<string[]>([]);
  const [selectedRoadType, setSelectedRoadType] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>([]);
  const [selectedOthers, setSelectedOthers] = useState<string[]>([]);


 
  const handleCheckboxAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedAreas((prev) => [...prev, value]);
    } else {
      setSelectedAreas((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleCheckboxTrafficChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedTraffic((prev) => [...prev, value]);
    } else {
      setSelectedTraffic((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleCheckboxRoadTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedRoadType((prev) => [...prev, value]);
    } else {
      setSelectedRoadType((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleCheckboxWeatherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedWeather((prev) => [...prev, value]);
    } else {
      setSelectedWeather((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleCheckboxPeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedPeriod((prev) => [...prev, value]);
    } else {
      setSelectedPeriod((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleCheckboxOthersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedOthers((prev) => [...prev, value]);
    } else {
      setSelectedOthers((prev) => prev.filter((area) => area !== value));
    }
  };

  const areasString = selectedAreas.join('-');
  const trafficString = selectedTraffic.join('-');
  const roadTypeString = selectedRoadType.join('-');
  const weatherString = selectedWeather.join('-');
  const PeriodString = selectedPeriod.join('-');
  const OthersString = selectedOthers.join('-');
  const areas = areasString.replace(/\s+/g, '_');
  const traffic = trafficString.replace(/\s+/g, '_');
  const roadType = roadTypeString.replace(/\s+/g, '_');
  const weather = weatherString.replace(/\s+/g, '_');
  const period = PeriodString.replace(/\s+/g, '_');
  const others = OthersString.replace(/\s+/g, '_');

  const searchString = areas+"!"+traffic+"!"+roadType+"!"+weather+"!"+period+"!"+others+"!";
  console.log(searchString)

  useEffect(() => {
    loadFiles();
  }, [searchString]);
  async function loadFiles() {
    try {
      const response = await api.get("/videofiless?page=1&pageSize=300&searchString="+ searchString);
      setFiles(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setIsLoading(false);
    }
  }

  const uniqueAreas = [...new Set(filesdata.map(item => item.Date))];
  console.log(uniqueAreas)
  window.onload = function () {
  window.scrollTo(0, 0);
  }

  const totalMinutes = uniqueAreas.length*5;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  return (
    <div className='min-h-screen flex flex-col bg-zinc-950'>
       <Header/>

       <div className="my-3 ml-3">
                                          <Link to="/Intermediary">
                                              <button className="bg-gray-700 text-white hover:bg-gray-600 text-base md:text-lg font-bold py-1 px-3 rounded-full transition duration-300 text-roboto">
                                                  ← Acquisitions
                                              </button>
                                          </Link>
                                      </div>
       <div className="flex-grow flex justify-center">
        <main className="my-4 mx-3 w-full max-w-6xl ">
          <h2 className="text-4xl font-medium mb-4 text-yellow-100 text-left">
             Search Acquisitions<span className='font-medium text-yellow-300'></span>
          </h2>
          {isLoading ? (        
           <div className="w-full mt-11  flex justify-center items-center">
              <img src={loadgif} alt={loadgif} className='w-32 h-32 mt-11 mb-11'/>  
            </div>          
          ) : (
            <section className="grid grid-cols-2 gap-4 w-full md:grid-cols-4">
              <form className='text-white text-base'>
              <article className="bg-gray-900 rounded p-2 mr-1 ml-1 relative h-full">
              <p className='justify-center items-center text-2xl font-semibold  text-yellow-300 '>
                  Traffic
                </p>
                <div className='mt-2'>
          <input type="checkbox" id="choice11" name="Free Flow" value="Free Flow"  onChange={handleCheckboxTrafficChange}/>
          <label  htmlFor="choice11"> Free Flow</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice12" name="Moderate" value="Moderate"  onChange={handleCheckboxTrafficChange}/>
          <label htmlFor="choice12"> Moderate</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice13" name="Heavy" value="Heavy"  onChange={handleCheckboxTrafficChange}/>
          <label htmlFor="choice13"> Heavy</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice14" name="Congested" value="Congested"  onChange={handleCheckboxTrafficChange}/>
          <label htmlFor="choice14"> Congested</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice15" name="Stop-and-Go" value="Stop-and-Go"  onChange={handleCheckboxTrafficChange}/>
          <label htmlFor="choice15"> Stop-and-Go</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice16" name="Slow Moving" value="Slow Moving"  onChange={handleCheckboxTrafficChange}/>
          <label htmlFor="choice16"> Slow Moving</label>
        </div>
        <p className='justify-center items-center  font-semibold  text-yellow-300  text-2xl mt-2'>
                  Road Type
                </p>
        <div className='mt-2'>
          <input type="checkbox" id="choice17" name="Highway" value="Highway"  onChange={handleCheckboxRoadTypeChange}/>
          <label  htmlFor="choice17"> Highway</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice18" name="Urban" value="Urban"  onChange={handleCheckboxRoadTypeChange}/>
          <label htmlFor="choice18"> Urban</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice19" name="Rural" value="Rural"  onChange={handleCheckboxRoadTypeChange}/>
          <label htmlFor="choice19"> Rural</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice20" name="Local" value="Local"  onChange={handleCheckboxRoadTypeChange}/>
          <label htmlFor="choice20"> Local</label>
        </div>
        </article>
        </form>
        <form className='text-white text-xl'>
              <article className="bg-sky-950 rounded p-2 relative h-full ml-1 mr-1">
                <p className='justify-center items-center  font-semibold  text-yellow-300  text-2xl mb-3'>
                  Weather
                </p>
        <div className='mt-2'>
          <input type="checkbox" id="choice21" name="Rainy" value="Rainy"  onChange={handleCheckboxWeatherChange}/>
          <label  htmlFor="choice21"> Rainy</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice22" name="Sunny" value="Sunny" onChange={handleCheckboxWeatherChange}/>
          <label htmlFor="choice22"> Sunny</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice23" name="Cloudy" value="Cloudy"  onChange={handleCheckboxWeatherChange}/>
          <label htmlFor="choice23"> Cloudy</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice24" name="Partly Cloudy" value="Partly Cloudy"  onChange={handleCheckboxWeatherChange}/>
          <label htmlFor="choice24"> Partly Cloudy</label>
        </div>
        <p className='justify-center items-center text-2xl mt-5  font-semibold  text-yellow-300 '>
                  Period
                </p>
        <div className='mt-2'>
          <input type="checkbox" id="choice25" name="Day" value="Day"  onChange={handleCheckboxPeriodChange}/>
          <label htmlFor="choice25"> Day</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice26" name="Night" value="Night" onChange={handleCheckboxPeriodChange} />
          <label htmlFor="choice26"> Night</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice27" name="Dawn" value="Dawn" onChange={handleCheckboxPeriodChange} />
          <label  htmlFor="choice27"> Dawn</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice28" name="Dusk" value="Dusk" onChange={handleCheckboxPeriodChange} />
          <label htmlFor="choice28"> Dusk</label>
        </div>
        </article>
        </form>
        <form className='text-white text-lg'>
         <article className="bg-teal-950 rounded p-2 relative h-full ml-1 mr-1">
             <p className='justify-center items-center text-2xl  font-semibold  text-yellow-300 '>
               Areas
             </p>
             <div className='mt-2'>
          <input type="checkbox" id="choice1" name="Metropoly" value="Metropoly"  onChange={handleCheckboxAreaChange}/>
          <label  htmlFor="choice1"> Metropoly</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice2" name="Central" value="Central" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice2"> Central</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice3" name="Smalltown" value="Smalltown" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice3"> Smalltown</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice4" name="Agricultural" value="Agricultural" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice4"> Agricultural</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice5" name="Forestry" value="Forestry" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice5"> Forestry</label>
        </div>
        
        <div className='mt-2'>
          <input type="checkbox" id="choice6" name="Industrial" value="Industrial" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice6"> Industrial</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice7" name="Areas Costeras" value="Areas Costeras" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice7"> Coastal Areas</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice8" name="Areas Fluviais" value="Areas Fluviais" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice8"> Riverside Areas</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice9" name="Commercial" value="Commercial" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice9"> Commercial</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice10" name="Residential" value="Residential" onChange={handleCheckboxAreaChange} />
          <label htmlFor="choice10"> Residential</label>
        </div>
        </article>
        </form>
      <article className="bg-zinc-900 rounded p-1 relative h-full mr-1 ml-1"> 
      <form className='text-white text-lg'>
                <article className="bg-zinc-900 rounded p-2 relative h-full ">
                <p className='justify-center items-center text-2xl font-semibold  text-yellow-300 '>
                  Others
                </p>
                <div className='mt-2'>
          <input type="checkbox" id="choice31" name="Fog" value="Fog"  onChange={handleCheckboxOthersChange} />
          <label  htmlFor="choice31"> Fog</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice32" name="Dense Fog" value="Dense Fog" onChange={handleCheckboxOthersChange} />
          <label htmlFor="choice32"> Dense Fog</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice33" name="Poor Road" value="Poor Road" onChange={handleCheckboxOthersChange} />
          <label htmlFor="choice33"> Poor Road</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice34" name="Wet Road" value="Wet Road" onChange={handleCheckboxOthersChange} />
          <label htmlFor="choice34"> Wet Road</label>
        </div>
        <div className='mt-2'>
          <input type="checkbox" id="choice35" name="Poorly Marked" value="Poorly Marked" onChange={handleCheckboxOthersChange} />
          <label htmlFor="choice35"> Poorly Marked</label>
        </div>
        </article>
        </form>
        <form className='text-white text-lg  border-2 border-yellow-400 rounded-md'>
              <article className="bg-zinc-700 rounded p-2 relative h-full ">
                <p className='justify-center items-center flex text-xl text-zinc-100 '>
                Available Data:
                </p>

                <p className='justify-center items-center flex text-2xl mt-2 text-yellow-400 font-bold'>
                {(timeFormatted)}
                </p>
                <Link to={`/Query/${searchString}`} key={searchString}>
                        <p className=" bg-yellow-400 text-zinc-900 mx-3 my-3  hover:bg-yellow-100 text-xl text-center   font-bold py-2 px-2 rounded-full transition duration-300 text-roboto">Search</p>
                    </Link>
              </article>
       </form>
       </article>
       </section>
        )}
     </main>
     </div>
     <Footer/>
     </div>
  )
}
