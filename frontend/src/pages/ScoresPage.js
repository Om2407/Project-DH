import React, { useEffect, useState } from 'react';
import { scoresAPI } from '../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newScore, setNewScore] = useState({ score: '', date: new Date().toISOString().split('T')[0] });
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = () => {
    scoresAPI.getMy()
      .then(r => setScores(r.data.scores))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load scores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newScore.score || !newScore.date) return;
    setSubmitting(true);
    try {
      const res = await scoresAPI.add(newScore);
      setScores(res.data.scores);
      setNewScore({ score: '', date: new Date().toISOString().split('T')[0] });
      setAdding(false);
      toast.success('Score added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add score');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (id) => {
    setSubmitting(true);
    try {
      const res = await scoresAPI.update(id, editVal);
      setScores(res.data.scores);
      setEditId(null);
      toast.success('Score updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      const res = await scoresAPI.delete(id);
      setScores(res.data.scores);
      toast.success('Score deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">My Scores</h1>
            <p className="text-white/40 text-sm">Up to 5 Stableford scores · Newest always kept</p>
          </div>
          {scores.length < 5 && !adding && (
            <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
              <FiPlus /> Add Score
            </button>
          )}
        </div>

        {/* Score count indicator */}
        <div className="card-dark mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Scores used</span>
                <span className="font-mono">{scores.length}/5</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                  style={{ width: `${(scores.length / 5) * 100}%` }} />
              </div>
            </div>
            {scores.length === 5 && (
              <p className="text-white/30 text-xs text-right">Adding new score removes oldest</p>
            )}
          </div>
        </div>

        {/* Add Form */}
        {adding && (
          <form onSubmit={handleAdd} className="card-dark mb-6 border-primary/30">
            <h3 className="text-white font-semibold mb-4">Add New Score</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white/40 text-xs mb-2 block uppercase tracking-wider">Stableford Score (1-45)</label>
                <input type="number" min="1" max="45" placeholder="e.g. 32" className="input-dark font-mono text-lg"
                  value={newScore.score} onChange={e => setNewScore({ ...newScore, score: e.target.value })} required />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-2 block uppercase tracking-wider">Date Played</label>
                <input type="date" className="input-dark" max={new Date().toISOString().split('T')[0]}
                  value={newScore.date} onChange={e => setNewScore({ ...newScore, date: e.target.value })} required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Save</>}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="text-white/40 hover:text-white text-sm flex items-center gap-2 px-4">
                <FiX /> Cancel
              </button>
            </div>
          </form>
        )}

        {/* Scores List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <div className="card-dark text-center py-16">
            <p className="text-white/30 text-4xl mb-4">⛳</p>
            <p className="text-white/50 font-medium mb-2">No scores yet</p>
            <p className="text-white/30 text-sm mb-6">Add your Stableford scores to enter draws</p>
            <button onClick={() => setAdding(true)} className="btn-primary text-sm px-5 py-2">Add First Score</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {scores.map((s, i) => (
              <div key={s._id || i} className={`card-dark flex items-center gap-4 ${i === 0 ? 'border-primary/30' : ''}`}>
                <div className="score-ball">{editId === s._id ? editVal.score || s.score : s.score}</div>

                {editId === s._id ? (
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Score</label>
                      <input type="number" min="1" max="45" className="input-dark py-2 font-mono"
                        value={editVal.score} onChange={e => setEditVal({ ...editVal, score: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Date</label>
                      <input type="date" className="input-dark py-2"
                        value={editVal.date?.split('T')[0]} onChange={e => setEditVal({ ...editVal, date: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-white font-medium">Stableford Score</p>
                    <p className="text-white/40 text-sm">{format(new Date(s.date), 'dd MMM yyyy')}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {i === 0 && editId !== s._id && (
                    <span className="badge-active">Latest</span>
                  )}
                  {editId === s._id ? (
                    <>
                      <button onClick={() => handleEdit(s._id)} disabled={submitting} className="text-primary hover:text-primary-light transition-colors">
                        <FiCheck size={18} />
                      </button>
                      <button onClick={() => setEditId(null)} className="text-white/30 hover:text-white transition-colors">
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(s._id); setEditVal({ score: s.score, date: s.date }); }}
                        className="text-white/30 hover:text-white transition-colors">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="text-white/30 hover:text-red-400 transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </>
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
