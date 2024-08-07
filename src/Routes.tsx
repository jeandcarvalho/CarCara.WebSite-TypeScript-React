import { createBrowserRouter } from "react-router-dom";
import Home from "./Components/Home";
import App from "./App";
import Video from "./Components/Video";
import About from "./Components/About";
import Search from "./Components/Search";
import Query from "./Components/Query";
import OurModels from "./Components/OurModels";
import Intermediary from "./Components/Intermediary";


export const Routes = createBrowserRouter ([
   {
    path: "/",
    element: <App />,
    children: [
        {path: "", element: <Home/>},
        {path: "About", element: <About/> },
        {path: "Video/:video", element: <Video/> },
        {path: "Search", element: <Search/> },
        {path: "Query/:city", element: <Query/> },
        {path: "OurModels", element: <OurModels/>},
        {path: "Intermediary", element: <Intermediary/> },
    ]
   }  
])
   
   


