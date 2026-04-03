import React, { useEffect, useState } from 'react';
import { drawsAPI } from '../api';
import { GiTrophy } from 'react-icons/gi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    drawsAPI.getAll()
      .then(r => setDraws(r.data.draws))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">Monthly Draws</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Draw Results</h1>
          <p className="text-white/40">Published monthly. Match 3, 4 or all 5 numbers to win.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <div className="card-dark text-center py-20">
            <GiTrophy className="text-gold text-5xl mx-auto mb-4" />
            <p className="text-white/50 font-medium">No draws published yet</p>
            <p className="text-white/30 text-sm mt-2">First draw coming soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {draws.map((draw, i) => (
              <div key={draw._id} className={`card-dark ${i === 0 ? 'border-gold/30' : ''}`}>
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {i === 0 && <span className="text-xs bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-semibold">Latest</span>}
                      <h3 className="font-display text-xl font-bold text-white">
                        {MONTHS[draw.month - 1]} {draw.year}
                      </h3>
                    </div>
                    <p className="text-white/30 text-sm capitalize">{draw.drawType} draw</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Total Prize Pool</p>
                    <p className="text-gold font-bold text-lg">₹{draw.totalPrizePool?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Numbers */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  {draw.drawnNumbers?.map((n, j) => (
                    <div key={j} className="draw-ball">{n}</div>
                  ))}
                </div>

                {/* Prize breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '5 Match (Jackpot)', pool: draw.prizes?.fiveMatch?.poolAmount, winners: draw.prizes?.fiveMatch?.winners?.length, color: 'text-gold' },
                    { label: '4 Match', pool: draw.prizes?.fourMatch?.poolAmount, winners: draw.prizes?.fourMatch?.winners?.length, color: 'text-primary' },
                    { label: '3 Match', pool: draw.prizes?.threeMatch?.poolAmount, winners: draw.prizes?.threeMatch?.winners?.length, color: 'text-white/60' },
                  ].map((tier, j) => (
                    <div key={j} className="text-center p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-white/30 text-xs mb-1">{tier.label}</p>
                      <p className={`font-bold ${tier.color}`}>₹{tier.pool?.toLocaleString() || 0}</p>
                      <p className="text-white/30 text-xs mt-1">{tier.winners || 0} winner{tier.winners !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>

                {draw.jackpotCarriedOver > 0 && (
                  <p className="text-white/30 text-xs mt-3 text-right">
                    Includes ₹{draw.jackpotCarriedOver.toLocaleString()} jackpot carried over
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
