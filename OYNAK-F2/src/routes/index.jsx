import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Clients from "../pages/Clients";
import Expenses from "../pages/Expenses";
import Sotuvlar from "../pages/Sotuvlar";
import Kassa from "../pages/Kassa";
import AllClients from "../pages/Clients"; // ✅ YANGI
import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../layout/Layout";

const AppRoutes = () => {
  const token = localStorage.getItem("token");

  let role = null;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    role = user?.role || null;
  } catch {
    role = null;
  }

  return (
    <Routes>
      {/* 🔐 Login sahifasi */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* ✅ Kassa sahifasi */}
      <Route
        path="/kassa"
        element={
          <PrivateRoute role={["user", "kassir"]}>
            <Kassa />
          </PrivateRoute>
        }
      />

      {/* ✅ Admin panel uchun layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="clients" element={<Clients />} />
        <Route path="sotuvlar" element={<Sotuvlar />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="all-clients" element={<AllClients />} /> {/* ✅ YANGI */}
      </Route>

      {/* ❌ 404 sahifa */}
      <Route
        path="*"
        element={<p style={{ textAlign: "center" }}>404 – Sahifa topilmadi</p>}
      />
    </Routes>
  );
};

export default AppRoutes;
