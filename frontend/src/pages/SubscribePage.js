import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { authAPI } from '../api';
import { FiCheck, FiZap } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

export default function SubscribePage() {
  const { user, updateUser, isSubscribed } = useAuth();
  const { initiateSubscription } = useRazorpay();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹499',
      period: 'per month',
      priceNum: 499,
      features: [
        '5-score Stableford entry',
        'Monthly prize draw entry',
        '10%+ charity contribution',
        'Score management dashboard',
        'Winner verification access',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '₹4,999',
      period: 'per year',
      priceNum: 4999,
      savings: 'Save ₹989',
      features: [
        'Everything in Monthly',
        '12 prize draws included',
        'Jackpot eligibility all year',
        'Full contributions history',
        'Priority customer support',
      ],
      featured: true,
    },
  ];

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    await initiateSubscription(planId, async () => {
      // Refresh user data after successful payment
      const res = await authAPI.me();
      updateUser(res.data.user);
      navigate('/dashboard');
    });
    setLoading(null);
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-6">
        <div className="card-dark max-w-md w-full text-center">
          <GiTrophy className="text-gold text-5xl mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">You're Subscribed!</h2>
          <p className="text-white/50 mb-2">
            Plan: <span className="text-white capitalize">{user?.subscription?.plan}</span>
          </p>
          <p className="text-white/50 mb-6">
            Expires: <span className="text-white">{new Date(user?.subscription?.endDate).toLocaleDateString()}</span>
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Subscription</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-white/40 max-w-md mx-auto">
            Select a plan to enter monthly draws, manage scores, and support your favourite charity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div key={plan.id}
              className={`card-dark flex flex-col relative ${plan.featured ? 'border-primary/40 glow-green' : ''}`}>
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark text-xs font-black px-4 py-1 rounded-full">
                  {plan.savings}
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <FiZap className={plan.featured ? 'text-gold' : 'text-primary'} />
                <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-white/40 ml-2 text-sm">{plan.period}</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <FiCheck className="text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  plan.featured ? 'btn-primary' : 'btn-gold'
                }`}>
                {loading === plan.id
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : `Subscribe ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 card-dark text-center">
          <p className="text-white/40 text-sm">
            🔒 Secure payment via Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Instant activation
          </p>
        </div>
      </div>
    </div>
  );
}
