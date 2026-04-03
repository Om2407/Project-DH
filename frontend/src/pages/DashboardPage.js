import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiAward, FiHeart, FiCalendar, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, isSubscribed } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
            Good to see you, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/40">Here's your GolfGives overview</p>
        </div>

        {/* Subscription Alert */}
        {!isSubscribed && (
          <div className="mb-8 card-dark border-gold/30 bg-gold/5 flex items-center gap-4">
            <FiAlertCircle className="text-gold text-2xl flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold">No active subscription</p>
              <p className="text-white/50 text-sm">Subscribe to enter monthly draws and track your scores.</p>
            </div>
            <Link to="/subscribe" className="btn-gold text-sm px-5 py-2 flex-shrink-0">Subscribe Now</Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: <FiCalendar className="text-primary" />,
              label: 'Subscription',
              value: user?.subscription?.status || 'Inactive',
              sub: user?.subscription?.endDate
                ? `Expires ${format(new Date(user.subscription.endDate), 'MMM dd, yyyy')}`
                : user?.subscription?.plan || '—',
              color: isSubscribed ? 'text-primary' : 'text-white/30'
            },
            {
              icon: <FiTrendingUp className="text-gold" />,
              label: 'Scores Entered',
              value: data?.scores?.length || 0,
              sub: 'of 5 max',
              color: 'text-gold'
            },
            {
              icon: <GiTrophy className="text-gold" />,
              label: 'Total Won',
              value: `₹${(user?.totalWon || 0).toLocaleString()}`,
              sub: user?.paymentStatus === 'paid' ? 'Paid out' : user?.paymentStatus === 'pending' ? 'Payment pending' : 'No wins yet',
              color: 'text-gold'
            },
            {
              icon: <FiHeart className="text-primary" />,
              label: 'Charity',
              value: data?.user?.selectedCharity?.name || 'Not selected',
              sub: `${user?.charityContributionPercent || 10}% contribution`,
              color: 'text-primary'
            }
          ].map((stat, i) => (
            <div key={i} className="card-dark">
              <div className="flex items-center gap-2 mb-3">{stat.icon}<span className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</span></div>
              <p className={`text-xl font-bold capitalize ${stat.color}`}>{stat.value}</p>
              <p className="text-white/30 text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Scores */}
          <div className="card-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">My Scores</h2>
              <Link to="/scores" className="text-primary text-sm flex items-center gap-1 hover:text-primary-light transition-colors">
                Manage <FiArrowRight size={14} />
              </Link>
            </div>
            {!isSubscribed ? (
              <p className="text-white/30 text-sm text-center py-8">Subscribe to track your scores</p>
            ) : data?.scores?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm mb-4">No scores yet</p>
                <Link to="/scores" className="btn-primary text-sm px-5 py-2">Add First Score</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.scores.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="score-ball">{s.score}</div>
                    <div>
                      <p className="text-white text-sm font-medium">Stableford Score</p>
                      <p className="text-white/30 text-xs">{format(new Date(s.date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                        i === 0 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30'
                      }`}>{i === 0 ? 'Latest' : `#${i + 1}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Draw + Winners */}
          <div className="flex flex-col gap-6">
            {/* Latest Draw */}
            <div className="card-dark">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Latest Draw</h2>
                <Link to="/draws" className="text-primary text-sm flex items-center gap-1 hover:text-primary-light transition-colors">
                  All draws <FiArrowRight size={14} />
                </Link>
              </div>
              {data?.latestDraw ? (
                <>
                  <p className="text-white/40 text-sm mb-4">
                    {monthNames[data.latestDraw.month - 1]} {data.latestDraw.year}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {data.latestDraw.drawnNumbers?.map((n, i) => (
                      <div key={i} className="draw-ball">{n}</div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-white/30 text-sm text-center py-4">No draws published yet</p>
              )}
            </div>

            {/* My Winnings */}
            <div className="card-dark">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">My Winnings</h2>
                <Link to="/winners" className="text-primary text-sm flex items-center gap-1 hover:text-primary-light transition-colors">
                  View all <FiArrowRight size={14} />
                </Link>
              </div>
              {data?.winners?.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No wins yet. Good luck in the next draw! 🍀</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.winners.slice(0, 3).map(w => (
                    <div key={w._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <div>
                        <p className="text-white text-sm font-medium capitalize">
                          {w.matchType.replace('_', ' ')}
                        </p>
                        <p className="text-white/30 text-xs">
                          {monthNames[w.draw?.month - 1]} {w.draw?.year}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold">₹{w.prizeAmount?.toLocaleString()}</p>
                        <span className={`badge-${w.paymentStatus}`}>{w.paymentStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
