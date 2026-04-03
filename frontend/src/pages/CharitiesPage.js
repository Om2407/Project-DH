import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { charitiesAPI } from '../api';
import { FiSearch, FiHeart, FiArrowRight } from 'react-icons/fi';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'sports', 'community', 'other'];

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchCharities = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== 'all') params.category = category;
    charitiesAPI.getAll(params)
      .then(r => setCharities(r.data.charities))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCharities(); }, [search, category]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Support What Matters</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Charity Directory</h1>
          <p className="text-white/40 max-w-lg mx-auto">Every subscription contributes to the charity you choose. Browse causes making a real difference.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input type="text" placeholder="Search charities..." className="input-dark pl-11"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize border ${
                  category === cat
                    ? 'bg-primary border-primary text-white'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-5xl mb-4">🔍</p>
            <p className="text-white/50">No charities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map(charity => (
              <Link key={charity._id} to={`/charities/${charity._id}`}
                className="card-dark group hover:border-primary/30 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  {charity.logo ? (
                    <img src={charity.logo} alt={charity.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      ❤️
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-primary transition-colors">{charity.name}</h3>
                    <span className="text-xs text-white/30 capitalize bg-white/5 px-2 py-0.5 rounded-full">{charity.category}</span>
                  </div>
                </div>
                <p className="text-white/40 text-sm leading-relaxed flex-1 line-clamp-3">
                  {charity.shortDescription || charity.description}
                </p>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <FiHeart size={12} className="text-primary" />
                    <span>{charity.subscriberCount || 0} supporters</span>
                  </div>
                  <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View <FiArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
