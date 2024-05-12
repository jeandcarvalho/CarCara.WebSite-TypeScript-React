import { createBrowserRouter } from "react-router-dom";
import Home from "./Components/Home";
import State from "./Components/State";
import City from "./Components/City";
import App from "./App";
import Video from "./Components/Video";
import Acquisitions from "./Components/Acquisitions";
import About from "./Components/About";


export const Routes = createBrowserRouter ([
   {
    path: "/",
    element: <App />,
    children: [
        {path: "", element: <Home/>},
        {path: "Acquisitions", element: <Acquisitions/>},
        {path: "About", element: <About/> },
        {path: "State/:state", element: <State/> }, // Adicionamos "/:state" para capturar o parâmetro
        {path: "City/:city", element: <City/> },
        {path: "Video/:video", element: <Video/> }
    ]
   }

    

    
])
   
   


