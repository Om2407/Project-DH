import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import { FiUsers, FiDollarSign, FiHeart, FiAward, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(r => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center pt-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { icon: <FiUsers />, label: 'Total Users', value: stats?.totalUsers || 0, sub: `${stats?.recentSignups || 0} new this week`, color: 'text-primary' },
    { icon: <FiTrendingUp />, label: 'Active Subscribers', value: stats?.activeSubscribers || 0, sub: 'Paying members', color: 'text-green-400' },
    { icon: <FiDollarSign />, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, sub: 'All time subscriptions', color: 'text-gold' },
    { icon: <FiHeart />, label: 'Charity Contributions', value: `₹${(stats?.totalCharityContributions || 0).toLocaleString()}`, sub: 'Total donated', color: 'text-red-400' },
    { icon: <GiTrophy />, label: 'Prize Pool Total', value: `₹${(stats?.totalPrizePool || 0).toLocaleString()}`, sub: 'Distributed in draws', color: 'text-gold' },
    { icon: <FiAward />, label: 'Total Winners', value: stats?.totalWinners || 0, sub: 'Across all draws', color: 'text-primary' },
  ];

  const quickLinks = [
    { to: '/admin/draws', label: 'Run Monthly Draw', desc: 'Simulate or publish draw', icon: <GiTrophy /> },
    { to: '/admin/users', label: 'Manage Users', desc: 'View and edit subscribers', icon: <FiUsers /> },
    { to: '/admin/winners', label: 'Verify Winners', desc: 'Review proof submissions', icon: <FiAward /> },
    { to: '/admin/charities', label: 'Manage Charities', desc: 'Add or edit charity listings', icon: <FiHeart /> },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-white/40">Platform overview and quick actions</p>
          </div>
          <span className="badge-active text-sm px-4 py-1.5">Admin Panel</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {statCards.map((s, i) => (
            <div key={i} className="card-dark">
              <div className={`text-xl mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/25 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <h2 className="font-display text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to}
              className="card-dark hover:border-primary/30 group transition-all flex flex-col">
              <div className="text-2xl text-primary mb-3 group-hover:scale-110 transition-transform">{l.icon}</div>
              <p className="text-white font-semibold mb-1">{l.label}</p>
              <p className="text-white/30 text-sm flex-1">{l.desc}</p>
              <div className="flex items-center gap-1 text-primary text-sm mt-4">
                Open <FiArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
