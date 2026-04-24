import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, Zap, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        ...(loginType === 'email' ? { email } : { phone }),
        password,
      });

      const payload      = response.data?.data ?? response.data;
      const user         = payload?.user        ?? payload;
      const accessToken  = payload?.accessToken ?? payload?.token  ?? '';
      const refreshToken = payload?.refreshToken ?? '';

      setAuth(user, accessToken, refreshToken);
      toast.success('Xush kelibsiz!');

      if (user.role === 'DISTRIBUTOR')                  navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard', { replace: true });
      else if (user.role === 'DRIVER')                  navigate('/driver/dashboard',      { replace: true });
      else if (user.role === 'ADMIN')                   navigate('/admin/dashboard',       { replace: true });
      else                                              navigate('/',                       { replace: true });

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-600/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-600/20 transform -rotate-6">
            <Zap className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Doko<span className="text-indigo-400">nect</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">B2B Platformaning kelajagi</p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
          {(['phone', 'email'] as const).map((type) => (
            <button key={type} type="button" onClick={() => setLoginType(type)}
              className={`flex-1 py-4 px-4 rounded-xl text-sm font-bold transition-all ${loginType === type ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
              {type === 'phone' ? 'Telefon' : 'Email'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {loginType === 'email' ? (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email manzil</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@dokonect.uz" required
                  className="w-full pl-12 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefon raqam</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" required
                  className="w-full pl-12 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parol</label>
              <button type="button" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Unutdingizmi?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full pl-12 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium" />
            </div>
          </div>

          {/* Login button */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading ? 'Kirish...' : 'Tizimga kirish'}
          </motion.button>
        </form>

        {/* ── Register button ── */}
        <Link to="/register" className="block mt-4">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all font-black text-xs uppercase tracking-widest cursor-pointer">
            <UserPlus className="w-4 h-4" />
            Ro'yxatdan o'tish
          </motion.div>
        </Link>

        {/* Test Accounts */}
        <div className="mt-6 p-5 bg-white/5 border border-white/10 rounded-[24px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Test hisoblar (Parol: 123456)
          </p>
          <div className="space-y-3">
            {[
              { label: 'Distribyutor', phone: '+998901234567' },
              { label: "Do'kon egasi", phone: '+998901234500' },
              { label: 'Admin',        phone: '+998900000000' },
            ].map(({ label, phone: p }) => (
              <button key={p} type="button" className="w-full flex items-center justify-between group cursor-pointer"
                onClick={() => { setLoginType('phone'); setPhone(p); setPassword('123456'); }}>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
                <span className="text-[10px] font-mono text-slate-500">{p}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};