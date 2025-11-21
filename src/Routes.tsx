// router.tsx
import {
  createHashRouter,
} from "react-router-dom";
import Home from "./Components/Home";
import App from "./App";
import About from "./Components/About";
import FullFiles from "./Components/FullFiles";
import FullVideo from "./Components/FullVideo";
import Search from "./Components/Search/Search";
import View from "./Components/View/View";
import Auth from "./Components/Auth";  // ⬅️ novo
import MyAccount from "./Components/MyAccount";  // ⬅️ novo
import Acquisition from "./Components/Acquisition";  // ⬅️ novo

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
      { path: "auth", element: <Auth /> }, // ⬅️ NOVO LOGIN/CADASTRO
      { path: "account", element: <MyAccount /> }, // ⬅️ NOVO LOGIN/CADASTRO
     { path: "/acquisition/:acqId", element: <Acquisition /> },

    ],
  },
]);
