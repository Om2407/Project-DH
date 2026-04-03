import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { charitiesAPI, drawsAPI } from '../api';
import { FiArrowRight, FiHeart, FiTrendingUp, FiAward, FiCheck } from 'react-icons/fi';
import { GiGolfFlag, GiTrophy } from 'react-icons/gi';

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    charitiesAPI.getFeatured().then(r => setFeaturedCharities(r.data.charities)).catch(() => {});
    drawsAPI.getLatest().then(r => setLatestDraw(r.data.draw)).catch(() => {});
  }, []);

  const steps = [
    { icon: <GiGolfFlag className="text-2xl" />, title: 'Subscribe', desc: 'Choose monthly or yearly. A portion goes to your chosen charity, rest builds the prize pool.' },
    { icon: <FiTrendingUp className="text-2xl" />, title: 'Enter Scores', desc: 'Log your last 5 Stableford scores. These are your lottery numbers for the monthly draw.' },
    { icon: <GiTrophy className="text-2xl" />, title: 'Win Prizes', desc: 'Match 3, 4, or all 5 drawn numbers. Jackpot rolls over if unclaimed!' },
    { icon: <FiHeart className="text-2xl" />, title: 'Give Back', desc: 'Every subscription automatically supports the charity you care about most.' },
  ];

  const plans = [
    {
      name: 'Monthly',
      price: '₹499',
      period: '/month',
      features: ['5-score rolling entry', 'Monthly prize draw', 'Charity contribution (min 10%)', 'Winner verification', 'Score dashboard'],
      cta: 'Start Monthly',
      plan: 'monthly'
    },
    {
      name: 'Yearly',
      price: '₹4,999',
      period: '/year',
      badge: 'Save 17%',
      features: ['Everything in Monthly', '12 monthly draws', 'Priority support', 'Jackpot eligibility all year', 'Contribution history'],
      cta: 'Start Yearly',
      plan: 'yearly',
      featured: true
    }
  ];

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* BG */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-fade-up">
              <FiHeart className="text-primary text-sm" />
              <span className="text-sm text-primary font-medium">Golf · Give · Win</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Play Golf.<br />
              <span className="text-gradient">Change Lives.</span><br />
              Win Prizes.
            </h1>
            <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
              The subscription platform where your golf scores enter you into monthly prize draws — and every subscription funds a charity you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/register" className="btn-gold text-base px-8 py-4 text-center rounded-xl font-bold flex items-center justify-center gap-2">
                Start Your Journey <FiArrowRight />
              </Link>
              <Link to="/charities" className="border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-base px-8 py-4 text-center rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                Explore Charities
              </Link>
            </div>
          </div>

          {/* Floating score cards */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 mr-8">
            {[32, 28, 35, 24, 30].map((score, i) => (
              <div key={i} className="glass rounded-xl px-5 py-3 flex items-center gap-3 animate-float"
                style={{ animationDelay: `${i * 0.3}s` }}>
                <div className="score-ball w-10 h-10 text-sm">{score}</div>
                <div>
                  <p className="text-white/30 text-xs">Score {i + 1}</p>
                  <p className="text-white text-sm font-medium">Stableford</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">The Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">How GolfGives Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="card-dark relative group hover:border-primary/30 transition-all duration-300">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center font-mono">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                  {step.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card-dark border-animated overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { label: '5-Number Match', percent: '40%', desc: 'Top Jackpot — rolls over if unclaimed', color: 'text-gold' },
                { label: '4-Number Match', percent: '35%', desc: 'Second tier prize pool', color: 'text-primary' },
                { label: '3-Number Match', percent: '25%', desc: 'Entry level prize', color: 'text-white/70' },
              ].map((tier, i) => (
                <div key={i} className="py-4">
                  <p className={`font-display text-5xl font-black ${tier.color} mb-2`}>{tier.percent}</p>
                  <p className="text-white font-semibold mb-1">{tier.label}</p>
                  <p className="text-white/30 text-sm">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {featuredCharities.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Making An Impact</p>
                <h2 className="font-display text-4xl font-bold text-white">Featured Charities</h2>
              </div>
              <Link to="/charities" className="text-white/40 hover:text-white text-sm flex items-center gap-2 transition-colors">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCharities.map(charity => (
                <Link key={charity._id} to={`/charities/${charity._id}`}
                  className="card-dark hover:border-primary/30 transition-all group">
                  {charity.logo && (
                    <img src={charity.logo} alt={charity.name}
                      className="w-12 h-12 rounded-xl object-cover mb-4" />
                  )}
                  <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors">{charity.name}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{charity.shortDescription || charity.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary text-sm">
                    <FiHeart size={14} /> <span>{charity.subscriberCount || 0} supporters</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Draw Numbers */}
      {latestDraw && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="card-dark text-center">
              <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Latest Draw</p>
              <h3 className="font-display text-2xl font-bold text-white mb-6">
                {new Date(2000, latestDraw.month - 1).toLocaleString('default', { month: 'long' })} {latestDraw.year}
              </h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {latestDraw.drawnNumbers?.map((n, i) => (
                  <div key={i} className="draw-ball">{n}</div>
                ))}
              </div>
              <Link to="/draws" className="inline-flex items-center gap-2 mt-6 text-gold hover:text-gold-light text-sm font-medium transition-colors">
                See full results <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">Choose Your Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map(plan => (
              <div key={plan.name} className={`card-dark relative ${plan.featured ? 'border-primary/40 glow-green' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/40 mb-1">{plan.period}</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                      <FiCheck className="text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.featured ? 'btn-primary' : 'border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
