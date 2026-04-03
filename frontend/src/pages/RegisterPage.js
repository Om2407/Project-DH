import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import { GiGolfFlag } from 'react-icons/gi';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to GolfGives 🎉');
      navigate('/subscribe');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith', icon: <FiUser size={16} /> },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: <FiMail size={16} /> },
    { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', icon: <FiPhone size={16} /> },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: <FiLock size={16} /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GiGolfFlag className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Join GolfGives</h1>
          <p className="text-white/40">Create your account and start making a difference</p>
        </div>

        <form onSubmit={handleSubmit} className="card-dark flex flex-col gap-5">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-white/60 text-sm mb-2 block">{f.label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10">
                  {f.icon}
                </span>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="input-dark w-full pl-11"
                  style={{ paddingLeft: '2.75rem' }}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.key !== 'phone'}
                />
              </div>
            </div>
          ))}
          <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <FiArrowRight /></>}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';
// import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
// import { GiGolfFlag } from 'react-icons/gi';

// export default function RegisterPage() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
//     setLoading(true);
//     try {
//       await register(form);
//       toast.success('Account created! Welcome to GolfGives 🎉');
//       navigate('/subscribe');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Registration failed');
//     } finally { setLoading(false); }
//   };

//   const fields = [
//     { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith', icon: <FiUser size={16} /> },
//     { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: <FiMail size={16} /> },
//     { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', icon: <FiPhone size={16} /> },
//     { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: <FiLock size={16} /> },
//   ];

//   return (
//     <div className="min-h-screen flex items-center justify-center px-6 pt-16 pb-16">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-10">
//           <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <GiGolfFlag className="text-white text-2xl" />
//           </div>
//           <h1 className="font-display text-3xl font-bold text-white mb-2">Join GolfGives</h1>
//           <p className="text-white/40">Create your account and start making a difference</p>
//         </div>

//         <form onSubmit={handleSubmit} className="card-dark flex flex-col gap-5">
//           {fields.map(f => (
//             <div key={f.key}>
//               <label className="text-white/60 text-sm mb-2 block">{f.label}</label>
//               <div className="relative">
//                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{f.icon}</span>
//                 <input type={f.type} placeholder={f.placeholder} className="input-dark pl-11"
//                   value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
//                   required={f.key !== 'phone'} />
//               </div>
//             </div>
//           ))}
//           <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-2" disabled={loading}>
//             {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <FiArrowRight /></>}
//           </button>
//         </form>

//         <p className="text-center text-white/40 text-sm mt-6">
//           Already have an account?{' '}
//           <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// }
