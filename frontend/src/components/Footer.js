import React from 'react';
import { Link } from 'react-router-dom';
import { GiGolfFlag } from 'react-icons/gi';
import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GiGolfFlag className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-lg text-white">GolfGives</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Combining the love of golf with the joy of giving. Play, win, and make a difference — every subscription matters.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h4>
            <div className="flex flex-col gap-3">
              {[['/', 'Home'], ['/charities', 'Charities'], ['/draws', 'Draws'], ['/subscribe', 'Subscribe']].map(([to, label]) => (
                <Link key={to} to={to} className="text-white/40 text-sm hover:text-white/70 transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Account</h4>
            <div className="flex flex-col gap-3">
              {[['/login', 'Sign In'], ['/register', 'Register'], ['/dashboard', 'Dashboard'], ['/profile', 'Profile']].map(([to, label]) => (
                <Link key={to} to={to} className="text-white/40 text-sm hover:text-white/70 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1A1A1A] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© {new Date().getFullYear()} GolfGives. All rights reserved.</p>
          <p className="text-white/25 text-sm flex items-center gap-1">
            Made with <FiHeart className="text-primary" size={12} /> for golfers who care
          </p>
        </div>
      </div>
    </footer>
  );
}
