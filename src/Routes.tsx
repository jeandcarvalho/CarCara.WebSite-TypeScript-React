// router.tsx
import { createHashRouter } from "react-router-dom";
import Home from "./Components/Home";
import App from "./App";
import About from "./Components/About";
import FullFiles from "./Components/FullFiles";
import FullVideo from "./Components/FullVideo";
import Search from "./Components/Search/Search";
import View from "./Components/View/View";
import Auth from "./Components/Auth";
import MyAccount from "./Components/MyAccount";
import Acquisition from "./Components/Acquisition/Acquisition";
import CollectionDetails from "./Components/CollectionDetails";
import LLMResult from "./Components/LLMResult";
import TestHandler from "./Components/TestHandler";


export const Routes = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "fullfiles", element: <FullFiles /> },
      { path: "fullvideo/:video", element: <FullVideo /> },
      { path: "search", element: <Search /> },
      { path: "view", element: <View /> },
      { path: "auth", element: <Auth /> },
      { path: "account", element: <MyAccount /> },
      { path: "/acquisition/:acqId", element: <Acquisition /> },
      { path: "/collections/:collectionId", element: <CollectionDetails /> },


      { path: "/collections/:collectionId/llm-tests", element: <LLMResult /> },
   
      { path: "/collections/:collectionId/llm-tests/handler", element:<TestHandler /> }


    ],
  },
]);
