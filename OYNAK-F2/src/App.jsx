import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import Login from "./pages/Login";

const App = () => {
  const token = localStorage.getItem("token");

  return <BrowserRouter>{token ? <AppRoutes /> : <Login />}</BrowserRouter>;
};

export default App;
