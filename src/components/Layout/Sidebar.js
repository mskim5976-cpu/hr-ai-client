import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, Building2, Server, LogOut, User, FileText } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: '대시보드' },
    { path: '/register', icon: UserPlus, label: '인사등록' },
    { path: '/employees', icon: Users, label: '인사현황' },
    { path: '/sites', icon: Building2, label: '파견관리' },
    { path: '/ai-report', icon: FileText, label: 'AI보고서' },
    { path: '/servers', icon: Server, label: '시스템관리' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/kcs-logo2.png" alt="KCS Logo" className="sidebar-logo" />
        <div className="sidebar-title">IT인사시스템</div>
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

      <div className="sidebar-footer">
        <div className="user-info">
          <User size={18} />
          <span>{user?.name || user?.username || '사용자'}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
