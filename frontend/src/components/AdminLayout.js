import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiUsers, FiHeart, FiAward, FiLogOut, FiArrowLeft
} from 'react-icons/fi';
import { GiTrophy, GiGolfFlag } from 'react-icons/gi';

const navItems = [
  { to: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/draws', icon: <GiTrophy />, label: 'Draws' },
  { to: '/admin/charities', icon: <FiHeart />, label: 'Charities' },
  { to: '/admin/winners', icon: <FiAward />, label: 'Winners' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0A0A0A] border-r border-[#1A1A1A] fixed left-0 top-16 bottom-0 flex flex-col">
        <div className="p-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <GiGolfFlag className="text-white text-sm" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">GolfGives</p>
              <p className="text-white/30 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map(item => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/admin';
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to;

            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1A1A1A]">
          <Link to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all mb-1">
            <FiArrowLeft /> User View
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56">
        {children}
      </main>
    </div>
  );
}
