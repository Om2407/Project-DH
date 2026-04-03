// LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GiGolfFlag } from 'react-icons/gi';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GiGolfFlag className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/40">
            Sign in to your GolfGives account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-dark flex flex-col gap-5">

          {/* Email */}
   <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <div className="relative">
              <FiMail className=" absolute left-4  top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="email"
                placeholder="    you@example.com"
                className="input-dark pl-11 py-3"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
</div>

          {/* Password */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="password"
                placeholder="    ••••••••"
                className="input-dark pl-11"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn-primary py-3 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <FiArrowRight />
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          No account?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary-light transition-colors font-medium"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;