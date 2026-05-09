import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import DokonectLogo from '../../components/ui/DokonectLogo';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loginType,    setLoginType]    = useState<'email' | 'phone'>('phone');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/api/auth/login', {
        ...(loginType === 'email' ? { email } : { phone }),
        password,
      });
      const payload      = response.data?.data ?? response.data;
      const user         = payload?.user        ?? payload;
      const accessToken  = payload?.token       ?? payload?.accessToken ?? '';
      const refreshToken = payload?.refreshToken ?? '';
      if (!user?.id) { setErrorMsg('Foydalanuvchi topilmadi'); return; }
      setAuth({
        id: user.id, name: user.name, email: user.email ?? '', phone: user.phone ?? '', role: user.role,
        distributorId: user.distributorId ?? user.distributor?.id ?? undefined,
        clientId:      user.clientId      ?? user.client?.id      ?? undefined,
        driverId:      user.driverId      ?? user.driver?.id      ?? undefined,
      }, accessToken, refreshToken);
      toast.success('Xush kelibsiz!');
      if (user.role === 'DISTRIBUTOR')                           navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard',       { replace: true });
      else if (user.role === 'DRIVER')                          navigate('/driver/dashboard',       { replace: true });
      else if (user.role === 'ADMIN')                           navigate('/admin/dashboard',        { replace: true });
      else                                                       navigate('/',                       { replace: true });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.response?.data?.error || `Xatolik (${error.response?.status || 'network'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080C1A', fontFamily: "'DM Sans','Outfit','Inter',sans-serif" }}>

      {/* BG */}
      <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'rgba(79,142,247,0.12)' }} />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'rgba(108,61,232,0.12)' }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 border shadow-2xl"
        style={{ background: 'rgba(14,20,37,0.95)', borderColor: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(24px)' }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(79,142,247,0.7),transparent)' }} />

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <DokonectLogo size={52} className="text-white justify-center mb-3" />
          <p className="text-slate-400 text-sm font-medium mt-1">B2B Platformaning kelajagi</p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 rounded-2xl mb-7 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {(['phone', 'email'] as const).map((type) => (
            <button key={type} type="button" onClick={() => { setLoginType(type); setErrorMsg(''); }}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                loginType === type
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}>
              {type === 'phone' ? 'Telefon' : 'Email'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {loginType === 'email' ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dokonect.uz" required
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-white placeholder-slate-600 text-sm font-medium focus:outline-none transition-all border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Telefon raqam</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567" required
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-white placeholder-slate-600 text-sm font-medium focus:outline-none transition-all border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full pl-11 pr-12 py-4 rounded-2xl text-white placeholder-slate-600 text-sm font-medium focus:outline-none transition-all border"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-4 py-3 rounded-2xl border"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
            </motion.div>
          )}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full py-4 text-white font-bold rounded-2xl text-sm transition-all disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg,#4F8EF7 0%,#6C3DE8 100%)', boxShadow: '0 6px 24px rgba(79,142,247,0.3)' }}>
            {loading ? 'Kirish...' : 'Tizimga kirish'}
          </motion.button>
        </form>

        <Link to="/register" className="block mt-3">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-slate-300 hover:text-white transition-all text-sm font-bold cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}>
            <UserPlus className="w-4 h-4" /> Ro'yxatdan o'tish
          </motion.div>
        </Link>

        {/* Back to landing */}
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
    
  );
};