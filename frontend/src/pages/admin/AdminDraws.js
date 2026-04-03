import React, { useEffect, useState } from 'react';
import { drawsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPlay, FiZap, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [drawType, setDrawType] = useState('random');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingDraws, setLoadingDraws] = useState(true);

  const fetchDraws = () => {
    drawsAPI.getAll()
      .then(r => setDraws(r.data.draws))
      .finally(() => setLoadingDraws(false));
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setSimulation(null);
    try {
      const res = await drawsAPI.simulate({ drawType });
      setSimulation(res.data.simulation);
      toast.success('Simulation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed');
    } finally { setLoading(false); }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish this draw? This will create winner records and notify users. This cannot be undone.')) return;
    setPublishing(true);
    try {
      const res = await drawsAPI.publish({ drawType });
      toast.success(`Draw published! ${res.data.summary.fiveMatchWinners + res.data.summary.fourMatchWinners + res.data.summary.threeMatchWinners} winners found.`);
      setSimulation(null);
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    } finally { setPublishing(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Draw Management</h1>
          <p className="text-white/40">Simulate, review and publish monthly draws</p>
        </div>

        {/* Controls */}
        <div className="card-dark mb-8 border-primary/20">
          <h2 className="font-display text-xl font-bold text-white mb-6">Run Draw</h2>

          <div className="mb-6">
            <p className="text-white/40 text-sm mb-3 uppercase tracking-wider text-xs">Draw Type</p>
            <div className="flex gap-3">
              {[
                { id: 'random', label: 'Random', desc: 'Standard lottery — all numbers equally likely' },
                { id: 'algorithmic', label: 'Algorithmic', desc: 'Weighted by score frequency — rare scores prioritised' },
              ].map(t => (
                <button key={t.id} onClick={() => setDrawType(t.id)}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                    drawType === t.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}>
                  <p className="text-white font-semibold text-sm mb-1">{t.label}</p>
                  <p className="text-white/30 text-xs">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={handleSimulate} disabled={loading}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiPlay size={14} />}
              Run Simulation
            </button>
            {simulation && (
              <button onClick={handlePublish} disabled={publishing}
                className="btn-gold flex items-center gap-2 text-sm py-2.5 px-6">
                {publishing
                  ? <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  : <FiZap size={14} />}
                Publish Draw
              </button>
            )}
          </div>
        </div>

        {/* Simulation Results */}
        {simulation && (
          <div className="card-dark mb-8 border-gold/20">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <FiRefreshCw className="text-gold" /> Simulation Results
                <span className="text-sm text-white/30 font-normal ml-2">(Not published yet)</span>
              </h2>
              <p className="text-white/40 text-sm">Prize Pool: <span className="text-gold font-bold">₹{simulation.prizePool?.toLocaleString()}</span></p>
            </div>

            {/* Drawn Numbers */}
            <div className="mb-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Drawn Numbers</p>
              <div className="flex gap-3 flex-wrap">
                {simulation.drawnNumbers?.map((n, i) => (
                  <div key={i} className="draw-ball">{n}</div>
                ))}
              </div>
            </div>

            {/* Winner counts */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: '5-Match Winners', count: simulation.fiveMatchWinners?.length || 0, color: 'text-gold' },
                { label: '4-Match Winners', count: simulation.fourMatchWinners?.length || 0, color: 'text-primary' },
                { label: '3-Match Winners', count: simulation.threeMatchWinners?.length || 0, color: 'text-white/60' },
              ].map((t, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-white/[0.02]">
                  <p className={`text-2xl font-bold ${t.color}`}>{t.count}</p>
                  <p className="text-white/30 text-xs mt-1">{t.label}</p>
                </div>
              ))}
            </div>

            {/* Winner list */}
            {simulation.winners?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Winners</p>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {simulation.winners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                      <div>
                        <p className="text-white text-sm font-medium">{w.name}</p>
                        <p className="text-white/30 text-xs">{w.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs">Scores: {w.scores.join(', ')}</p>
                        <p className="text-primary text-sm font-medium">Matched: {w.matched.join(', ')} ({w.matchCount} matches)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {simulation.winners?.length === 0 && (
              <p className="text-white/30 text-center text-sm py-4">No winners in this simulation</p>
            )}
          </div>
        )}

        {/* Published Draws History */}
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-4">Published Draws</h2>
          {loadingDraws ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : draws.length === 0 ? (
            <div className="card-dark text-center py-12">
              <GiTrophy className="text-gold/30 text-4xl mx-auto mb-3" />
              <p className="text-white/30">No draws published yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {draws.map((draw, i) => (
                <div key={draw._id} className={`card-dark ${i === 0 ? 'border-gold/20' : ''}`}>
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        {MONTHS[draw.month - 1]} {draw.year}
                      </h3>
                      <p className="text-white/30 text-xs capitalize">{draw.drawType} · Pool: ₹{draw.totalPrizePool?.toLocaleString()}</p>
                    </div>
                    <span className="badge-active">Published</span>
                  </div>
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {draw.drawnNumbers?.map((n, j) => (
                      <div key={j} className="w-10 h-10 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center text-gold font-bold text-sm font-mono">
                        {n}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-white/[0.02] rounded-lg p-2">
                      <p className="text-gold font-bold">{draw.prizes?.fiveMatch?.winners?.length || 0}</p>
                      <p className="text-white/30 text-xs">5-Match</p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2">
                      <p className="text-primary font-bold">{draw.prizes?.fourMatch?.winners?.length || 0}</p>
                      <p className="text-white/30 text-xs">4-Match</p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2">
                      <p className="text-white/60 font-bold">{draw.prizes?.threeMatch?.winners?.length || 0}</p>
                      <p className="text-white/30 text-xs">3-Match</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
