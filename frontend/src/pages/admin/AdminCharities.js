import React, { useEffect, useState } from 'react';
import { charitiesAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiStar } from 'react-icons/fi';

const CATEGORIES = ['health', 'education', 'environment', 'sports', 'community', 'other'];
const EMPTY = { name: '', description: '', shortDescription: '', website: '', category: 'other', featured: false };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCharities = () => {
    charitiesAPI.getAll()
      .then(r => setCharities(r.data.charities))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCharities(); }, []);

  const openAdd = () => { setForm(EMPTY); setLogoFile(null); setEditId(null); setModal('add'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, shortDescription: c.shortDescription || '', website: c.website || '', category: c.category, featured: c.featured }); setLogoFile(null); setEditId(c._id); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name || !form.description) { toast.error('Name and description required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append('logo', logoFile);

      if (modal === 'add') {
        await charitiesAPI.create(fd);
        toast.success('Charity added!');
      } else {
        await charitiesAPI.update(editId, fd);
        toast.success('Charity updated!');
      }
      setModal(null);
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await charitiesAPI.delete(id);
      toast.success('Charity deactivated');
      fetchCharities();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Charities</h1>
            <p className="text-white/40">{charities.length} charities listed</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <FiPlus /> Add Charity
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <div className="card-dark text-center py-16">
            <p className="text-white/30">No charities yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {charities.map(c => (
              <div key={c._id} className="card-dark flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {c.logo ? (
                      <img src={c.logo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">❤️</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-white/30 text-xs capitalize">{c.category}</p>
                    </div>
                  </div>
                  {c.featured && <FiStar className="text-gold flex-shrink-0 mt-1" size={14} />}
                </div>
                <p className="text-white/40 text-sm leading-relaxed flex-1 line-clamp-2 mb-4">{c.shortDescription || c.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-white/20 text-xs">{c.subscriberCount || 0} supporters</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-white/40 hover:text-white transition-colors p-1.5">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c._id, c.name)} className="text-white/40 hover:text-red-400 transition-colors p-1.5">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6 py-8 overflow-y-auto">
            <div className="card-dark w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white">
                  {modal === 'add' ? 'Add Charity' : 'Edit Charity'}
                </h3>
                <button onClick={() => setModal(null)} className="text-white/40 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Name *</label>
                  <input type="text" className="input-dark" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Short Description</label>
                  <input type="text" className="input-dark" placeholder="One-line summary" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Full Description *</label>
                  <textarea rows={4} className="input-dark resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Category</label>
                    <select className="input-dark" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Website</label>
                    <input type="url" className="input-dark" placeholder="https://..." value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Logo Image</label>
                  <input type="file" accept="image/*" className="text-white/50 text-sm"
                    onChange={e => setLogoFile(e.target.files[0])} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-white/60 text-sm">Feature on homepage</span>
                </label>
                <div className="flex gap-3 mt-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={14} />}
                    {modal === 'add' ? 'Add Charity' : 'Save Changes'}
                  </button>
                  <button onClick={() => setModal(null)} className="text-white/40 hover:text-white text-sm px-4">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
