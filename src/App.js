import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import EmployeeRegister from "./pages/EmployeeRegister";
import EmployeeList from "./pages/EmployeeList";
import SiteManagement from "./pages/SiteManagement";
import ServerStatus from "./pages/ServerStatus";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<EmployeeRegister />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/sites" element={<SiteManagement />} />
            <Route path="/servers" element={<ServerStatus />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
