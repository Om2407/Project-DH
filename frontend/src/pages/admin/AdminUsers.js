import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiSearch, FiEdit2, FiTrash2, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 15, search, status: statusFilter })
      .then(r => {
        setUsers(r.data.users);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search, statusFilter]);

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '', 'subscription.status': user.subscription?.status });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(selectedUser._id, editForm);
      toast.success('User updated');
      setSelectedUser(null);
      fetchUsers();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deactivated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Users</h1>
            <p className="text-white/40">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input type="text" placeholder="Search name or email..." className="input-dark pl-11"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-dark w-auto" value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="cancelled">Cancelled</option>
            <option value="lapsed">Lapsed</option>
          </select>
        </div>

        {/* Table */}
        <div className="card-dark p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subscription</th>
                  <th>Plan</th>
                  <th>Charity</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-white/30">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-white/30">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.name}</p>
                          <p className="text-white/30 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-${u.subscription?.status || 'inactive'}`}>
                        {u.subscription?.status || 'inactive'}
                      </span>
                    </td>
                    <td className="text-white/50 capitalize">{u.subscription?.plan || '—'}</td>
                    <td className="text-white/50 text-sm">{u.selectedCharity?.name || '—'}</td>
                    <td className="text-white/40 text-sm">
                      {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)}
                          className="text-white/40 hover:text-white transition-colors p-1">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => deleteUser(u._id, u.name)}
                          className="text-white/40 hover:text-red-400 transition-colors p-1">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#252525]">
              <p className="text-white/30 text-sm">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="text-white/40 hover:text-white disabled:opacity-20 p-2">
                  <FiChevronLeft size={18} />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="text-white/40 hover:text-white disabled:opacity-20 p-2">
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
            <div className="card-dark w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white">Edit User</h3>
                <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-white/40 text-xs mb-1 block uppercase tracking-wider">{f.label}</label>
                    <input type={f.type} className="input-dark" value={editForm[f.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="text-white/40 text-xs mb-1 block uppercase tracking-wider">Subscription Status</label>
                  <select className="input-dark" value={editForm['subscription.status'] || ''}
                    onChange={e => setEditForm({ ...editForm, 'subscription.status': e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="lapsed">Lapsed</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={saveEdit} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={14} />}
                    Save Changes
                  </button>
                  <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white text-sm px-4">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
