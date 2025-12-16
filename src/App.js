import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import EmployeeRegister from "./pages/EmployeeRegister";
import EmployeeList from "./pages/EmployeeList";
import SiteManagement from "./pages/SiteManagement";
import ServerStatus from "./pages/ServerStatus";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 정보 복원
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // 로그인 안됨 -> 로그인 페이지
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // 로그인 됨 -> 메인 앱
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar user={user} onLogout={handleLogout} />
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
