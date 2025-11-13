// router.tsx
import {
  createHashRouter,   // ⬅️ troque aqui
  // createBrowserRouter (remova)
} from "react-router-dom";
import Home from "./Components/Home";
import App from "./App";
import About from "./Components/About";
import FullFiles from "./Components/FullFiles";
import FullVideo from "./Components/FullVideo";
import Search from "./Components/Search";
import View from "./Components/View";

export const Routes = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },           // melhor que path:""
      { path: "about", element: <About /> },
      { path: "fullfiles", element: <FullFiles /> },
      { path: "fullvideo/:video", element: <FullVideo /> },
      { path: "search", element: <Search /> },
      { path: "View", element: <View/> },
    ],
  },
]);
