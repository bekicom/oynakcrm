import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Clients from "../pages/Clients";
import Expenses from "../pages/Expenses";
import Sotuvlar from "../pages/Sotuvlar";
import Kassa from "../pages/Kassa";
import AllClients from "../pages/Clients";
import AdminLayout from "../layout/Layout";

const AppRoutes = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {user === "admin" && (
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/sotuvlar" element={<Sotuvlar />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/all-clients" element={<AllClients />} />
        </Route>
      )}

      {user !== "admin" && <Route path="*" element={<Kassa />} />}
      {!token && <Route path="*" element={<Navigate to="/login" replace />} />}
    </Routes>
  );
};

export default AppRoutes;
