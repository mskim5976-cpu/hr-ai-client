import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, Building2, Server } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: '대시보드' },
    { path: '/register', icon: UserPlus, label: '인사등록' },
    { path: '/employees', icon: Users, label: '인사현황' },
    { path: '/sites', icon: Building2, label: '파견관리' },
    { path: '/servers', icon: Server, label: '시스템관리' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="KCS Logo" className="sidebar-logo" />
        <div className="sidebar-title">IT 인력관리 시스템</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
