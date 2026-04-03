import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { charitiesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiHeart, FiCalendar, FiGlobe } from 'react-icons/fi';
import { format } from 'date-fns';

export default function CharityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { initiateDonation } = useRazorpay();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmt, setDonationAmt] = useState('');
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    charitiesAPI.getById(id)
      .then(r => setCharity(r.data.charity))
      .catch(() => toast.error('Charity not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectCharity = async () => {
    if (!user) { navigate('/login'); return; }
    setSelecting(true);
    try {
      const res = await authAPI.updateProfile({ selectedCharity: id });
      updateUser(res.data.user);
      toast.success(`Now supporting ${charity.name}!`);
    } catch { toast.error('Failed to select charity'); }
    finally { setSelecting(false); }
  };

  const isSelected = user?.selectedCharity?._id === id || user?.selectedCharity === id;

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center pt-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!charity) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm">
          <FiArrowLeft /> Back to Charities
        </button>

        {/* Header */}
        <div className="card-dark mb-6 flex flex-col md:flex-row gap-6">
          {charity.logo && (
            <img src={charity.logo} alt={charity.name} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs text-white/30 uppercase tracking-wider capitalize bg-white/5 px-3 py-1 rounded-full mb-2 inline-block">
                  {charity.category}
                </span>
                <h1 className="font-display text-3xl font-bold text-white">{charity.name}</h1>
              </div>
              <div className="flex gap-3 flex-wrap">
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white border border-white/10 px-3 py-2 rounded-lg transition-all">
                    <FiGlobe size={14} /> Website
                  </a>
                )}
                <button onClick={handleSelectCharity} disabled={isSelected || selecting}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all ${
                    isSelected ? 'bg-primary/20 text-primary border border-primary/30 cursor-default' : 'btn-primary'
                  }`}>
                  <FiHeart size={14} />
                  {isSelected ? 'Your Charity' : selecting ? 'Selecting...' : 'Support This Charity'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/30">
              <span className="flex items-center gap-1"><FiHeart size={12} className="text-primary" /> {charity.subscriberCount || 0} supporters</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card-dark mb-6">
          <h2 className="font-display text-xl font-bold text-white mb-4">About</h2>
          <p className="text-white/60 leading-relaxed">{charity.description}</p>
        </div>

        {/* Images */}
        {charity.images?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {charity.images.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-xl object-cover w-full h-40" />
            ))}
          </div>
        )}

        {/* Events */}
        {charity.upcomingEvents?.length > 0 && (
          <div className="card-dark mb-6">
            <h2 className="font-display text-xl font-bold text-white mb-6">Upcoming Events</h2>
            <div className="flex flex-col gap-4">
              {charity.upcomingEvents.map((evt, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{evt.title}</p>
                    <p className="text-white/40 text-sm">{evt.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-white/30">
                      {evt.date && <span>{format(new Date(evt.date), 'dd MMM yyyy')}</span>}
                      {evt.location && <span>📍 {evt.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donation */}
        {user && (
          <div className="card-dark border-gold/20">
            <h2 className="font-display text-xl font-bold text-white mb-2">Make a Donation</h2>
            <p className="text-white/40 text-sm mb-6">Support {charity.name} directly — independent of your subscription.</p>
            <div className="flex gap-4 flex-wrap mb-4">
              {[100, 500, 1000, 2000].map(amt => (
                <button key={amt} onClick={() => setDonationAmt(String(amt))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    donationAmt === String(amt) ? 'bg-gold/20 border-gold text-gold' : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}>
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <input type="number" placeholder="Custom amount (₹)" className="input-dark flex-1" min="1"
                value={donationAmt} onChange={e => setDonationAmt(e.target.value)} />
              <button onClick={() => initiateDonation(Number(donationAmt), id, charity.name)}
                disabled={!donationAmt || Number(donationAmt) < 1}
                className="btn-gold px-6 flex-shrink-0">
                Donate ₹{donationAmt || '0'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
