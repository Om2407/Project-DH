import React, { useEffect, useState } from 'react';
import { winnersAPI } from '../api';
import toast from 'react-hot-toast';
import { FiUpload, FiAward } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function WinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    winnersAPI.getMy()
      .then(r => setWinners(r.data.winners))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (winnerId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('proof', file);
    setUploading(winnerId);
    try {
      await winnersAPI.uploadProof(winnerId, fd);
      toast.success('Proof uploaded! Awaiting admin review.');
      const res = await winnersAPI.getMy();
      setWinners(res.data.winners);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(null); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-1">My Winnings</h1>
          <p className="text-white/40">Your prize history and verification status</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : winners.length === 0 ? (
          <div className="card-dark text-center py-20">
            <GiTrophy className="text-gold text-5xl mx-auto mb-4" />
            <p className="text-white/50 font-medium mb-2">No winnings yet</p>
            <p className="text-white/30 text-sm">Keep entering your scores each month!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {winners.map(w => (
              <div key={w._id} className="card-dark">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <FiAward className="text-gold" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-semibold capitalize">{w.matchType.replace('_', ' ')}</p>
                      <p className="text-white/40 text-sm">
                        {w.draw ? `${MONTHS[w.draw.month - 1]} ${w.draw.year}` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-bold text-xl">₹{w.prizeAmount?.toLocaleString()}</p>
                    <span className={`badge-${w.paymentStatus}`}>{w.paymentStatus}</span>
                  </div>
                </div>

                {/* Matched numbers */}
                {w.matchedNumbers?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Matched Numbers</p>
                    <div className="flex gap-2">
                      {w.matchedNumbers.map((n, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm font-mono">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <p className="text-white/50 text-sm">Verification</p>
                    <span className={`badge-${w.verificationStatus}`}>{w.verificationStatus}</span>
                    {w.adminNote && <p className="text-white/30 text-xs mt-1">Note: {w.adminNote}</p>}
                  </div>

                  {/* Upload proof button */}
                  {w.verificationStatus === 'pending' && !w.proofScreenshot && (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={e => handleUpload(w._id, e.target.files[0])} />
                      <div className={`flex items-center gap-2 btn-primary text-sm py-2 px-4 rounded-lg ${uploading === w._id ? 'opacity-50' : ''}`}>
                        {uploading === w._id
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <FiUpload size={14} />}
                        Upload Proof
                      </div>
                    </label>
                  )}
                  {w.proofScreenshot && w.verificationStatus === 'pending' && (
                    <span className="text-white/30 text-xs">Proof submitted ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
