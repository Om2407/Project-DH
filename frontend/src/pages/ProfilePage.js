import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, charitiesAPI, subscriptionsAPI } from '../api';
import toast from 'react-hot-toast';
import { FiSave, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser, isSubscribed } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [charity, setCharity] = useState({ selectedCharity: user?.selectedCharity?._id || user?.selectedCharity || '', charityContributionPercent: user?.charityContributionPercent || 10 });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [charities, setCharities] = useState([]);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    charitiesAPI.getAll().then(r => setCharities(r.data.charities)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving('profile');
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(''); }
  };

  const saveCharity = async (e) => {
    e.preventDefault();
    if (charity.charityContributionPercent < 10) { toast.error('Minimum 10%'); return; }
    setSaving('charity');
    try {
      const res = await authAPI.updateProfile(charity);
      updateUser(res.data.user);
      toast.success('Charity settings updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(''); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirm) { toast.error('Passwords do not match'); return; }
    if (password.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving('password');
    try {
      await authAPI.changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
      toast.success('Password changed');
      setPassword({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(''); }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Cancel your subscription? You will keep access until your current period ends.')) return;
    try {
      await subscriptionsAPI.cancel();
      const res = await authAPI.me();
      updateUser(res.data.user);
      toast.success('Subscription cancelled. Access continues until end date.');
    } catch { toast.error('Failed to cancel'); }
  };

  const Section = ({ title, children }) => (
    <div className="card-dark mb-6">
      <h2 className="font-display text-xl font-bold text-white mb-6">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Profile */}
        <Section title="Personal Info">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-sm mb-2 block">Full Name</label>
              <input type="text" className="input-dark" value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">Phone</label>
              <input type="tel" className="input-dark" value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">Email</label>
              <input type="email" className="input-dark opacity-50" value={user?.email} disabled />
              <p className="text-white/20 text-xs mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving === 'profile'} className="btn-primary flex items-center gap-2 text-sm py-2 px-5 w-fit">
              {saving === 'profile' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={14} />}
              Save Profile
            </button>
          </form>
        </Section>

        {/* Charity */}
        <Section title="Charity Settings">
          <form onSubmit={saveCharity} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-sm mb-2 block">Selected Charity</label>
              <select className="input-dark" value={charity.selectedCharity}
                onChange={e => setCharity({ ...charity, selectedCharity: e.target.value })}>
                <option value="">Select a charity</option>
                {charities.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">
                Contribution Percentage: <span className="text-primary font-bold">{charity.charityContributionPercent}%</span>
              </label>
              <input type="range" min="10" max="100" step="5"
                className="w-full accent-primary h-2"
                value={charity.charityContributionPercent}
                onChange={e => setCharity({ ...charity, charityContributionPercent: Number(e.target.value) })} />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>10% (min)</span><span>100%</span>
              </div>
            </div>
            <button type="submit" disabled={saving === 'charity'} className="btn-primary flex items-center gap-2 text-sm py-2 px-5 w-fit">
              <FiHeart size={14} /> Save Charity Settings
            </button>
          </form>
        </Section>

        {/* Password */}
        <Section title="Change Password">
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-white/50 text-sm mb-2 block">{f.label}</label>
                <input type="password" className="input-dark" value={password[f.key]}
                  onChange={e => setPassword({ ...password, [f.key]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" disabled={saving === 'password'} className="btn-primary flex items-center gap-2 text-sm py-2 px-5 w-fit">
              <FiLock size={14} /> Change Password
            </button>
          </form>
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Status</p>
              <p className={`font-semibold capitalize ${isSubscribed ? 'text-primary' : 'text-white/30'}`}>
                {user?.subscription?.status || 'Inactive'}
              </p>
              {user?.subscription?.endDate && (
                <p className="text-white/30 text-xs mt-1">
                  {isSubscribed ? 'Expires' : 'Expired'}: {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {isSubscribed && (
              <button onClick={cancelSubscription}
                className="flex items-center gap-2 text-sm text-red-400 border border-red-400/20 px-4 py-2 rounded-lg hover:bg-red-400/5 transition-all">
                <FiAlertCircle size={14} /> Cancel Subscription
              </button>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
