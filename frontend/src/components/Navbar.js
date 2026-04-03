import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { GiGolfFlag } from 'react-icons/gi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Charities', to: '/charities' },
    { label: 'Draws', to: '/draws' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#252525]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GiGolfFlag className="text-white text-lg" />
          </div>
          <span className="font-display font-bold text-lg text-white">GolfGives</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-gold hover:text-gold-light transition-colors">Admin</Link>
              )}
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2 hover:bg-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80">{user.name?.split(' ')[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-[#161616] border border-[#252525] rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link to="/profile" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      <FiSettings size={14} /> Profile Settings
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors">
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu btn */}
        <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#161616] border-b border-[#252525] px-6 py-4 flex flex-col gap-4">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="text-white/70 text-sm py-1">{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="text-white text-sm py-1">Dashboard</Link>
              {isAdmin && <Link to="/admin" className="text-gold text-sm py-1">Admin Panel</Link>}
              <Link to="/profile" className="text-white/70 text-sm py-1">Profile</Link>
              <button onClick={handleLogout} className="text-red-400 text-sm py-1 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/70 text-sm py-1">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm text-center py-2">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
