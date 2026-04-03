import React, { useEffect, useState } from 'react';
import { winnersAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiDollarSign, FiEye, FiFilter } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '' });
  const [actionId, setActionId] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');

  const fetchWinners = () => {
    setLoading(true);
    winnersAPI.getAll(filters)
      .then(r => setWinners(r.data.winners))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWinners(); }, [filters]);

  const verify = async (id, status) => {
    setActionId(id);
    try {
      await winnersAPI.verify(id, { status, adminNote: note });
      toast.success(`Winner ${status}`);
      setNoteModal(null);
      setNote('');
      fetchWinners();
    } catch { toast.error('Action failed'); }
    finally { setActionId(null); }
  };

  const markPaid = async (id) => {
    if (!window.confirm('Mark this winner as paid?')) return;
    setActionId(id);
    try {
      await winnersAPI.markPaid(id);
      toast.success('Marked as paid');
      fetchWinners();
    } catch { toast.error('Failed'); }
    finally { setActionId(null); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Winners</h1>
            <p className="text-white/40">Verify proof submissions and manage payouts</p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select className="input-dark w-auto text-sm py-2"
              value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Verification</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="input-dark w-auto text-sm py-2"
              value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}>
              <option value="">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : winners.length === 0 ? (
          <div className="card-dark text-center py-20">
            <GiTrophy className="text-gold/30 text-5xl mx-auto mb-4" />
            <p className="text-white/30">No winners found</p>
          </div>
        ) : (
          <div className="card-dark p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Draw</th>
                    <th>Match</th>
                    <th>Prize</th>
                    <th>Verification</th>
                    <th>Payment</th>
                    <th>Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map(w => (
                    <tr key={w._id}>
                      <td>
                        <div>
                          <p className="text-white font-medium text-sm">{w.user?.name}</p>
                          <p className="text-white/30 text-xs">{w.user?.email}</p>
                          {w.user?.phone && <p className="text-white/20 text-xs">{w.user.phone}</p>}
                        </div>
                      </td>
                      <td className="text-white/50 text-sm">
                        {w.draw ? `${MONTHS[w.draw.month - 1]} ${w.draw.year}` : '—'}
                      </td>
                      <td>
                        <span className={`text-sm font-medium capitalize ${
                          w.matchType === 'five_match' ? 'text-gold' :
                          w.matchType === 'four_match' ? 'text-primary' : 'text-white/60'
                        }`}>
                          {w.matchType?.replace('_', ' ')}
                        </span>
                        <p className="text-white/25 text-xs font-mono">
                          {w.matchedNumbers?.join(', ')}
                        </p>
                      </td>
                      <td className="text-gold font-bold">₹{w.prizeAmount?.toLocaleString()}</td>
                      <td><span className={`badge-${w.verificationStatus}`}>{w.verificationStatus}</span></td>
                      <td><span className={`badge-${w.paymentStatus}`}>{w.paymentStatus}</span></td>
                      <td>
                        {w.proofScreenshot ? (
                          <a href={w.proofScreenshot} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light text-sm flex items-center gap-1">
                            <FiEye size={14} /> View
                          </a>
                        ) : (
                          <span className="text-white/20 text-xs">Not uploaded</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {w.verificationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => { setNoteModal({ id: w._id, action: 'approved' }); }}
                                className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                title="Approve">
                                <FiCheck size={15} />
                              </button>
                              <button
                                onClick={() => { setNoteModal({ id: w._id, action: 'rejected' }); }}
                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Reject">
                                <FiX size={15} />
                              </button>
                            </>
                          )}
                          {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                            <button
                              onClick={() => markPaid(w._id)}
                              disabled={actionId === w._id}
                              className="p-1.5 text-gold hover:bg-gold/10 rounded-lg transition-all flex items-center gap-1 text-xs"
                              title="Mark Paid">
                              <FiDollarSign size={14} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note/Confirm Modal */}
        {noteModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
            <div className="card-dark w-full max-w-sm">
              <h3 className="font-display text-lg font-bold text-white mb-2">
                {noteModal.action === 'approved' ? '✅ Approve Winner' : '❌ Reject Winner'}
              </h3>
              <p className="text-white/40 text-sm mb-4">Add an optional note for the winner.</p>
              <textarea rows={3} className="input-dark resize-none mb-4" placeholder="Optional note..."
                value={note} onChange={e => setNote(e.target.value)} />
              <div className="flex gap-3">
                <button
                  onClick={() => verify(noteModal.id, noteModal.action)}
                  disabled={actionId !== null}
                  className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
                    noteModal.action === 'approved' ? 'btn-primary' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  }`}>
                  {actionId ? '...' : noteModal.action === 'approved' ? 'Approve' : 'Reject'}
                </button>
                <button onClick={() => { setNoteModal(null); setNote(''); }}
                  className="px-4 text-white/40 hover:text-white text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
