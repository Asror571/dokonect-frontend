import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Store, Truck, ShieldCheck, ChevronRight, Play, Clock, ArrowUpRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import toast from 'react-hot-toast';

/* ─── Logo ──────────────────────────────────────────────────────────────────── */
const Logo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4A90E2" /><stop offset="100%" stopColor="#7B5CE7" />
      </linearGradient>
    </defs>
    <path d="M18 12H46C68 12 82 28 82 50C82 72 68 88 46 88H18Z" fill="url(#lg1)" />
    <path d="M30 26H44C58 26 68 37 68 50C68 63 58 74 44 74H30Z" fill="white" />
    <circle cx="43" cy="37" r="5.5" fill="url(#lg1)" />
    <circle cx="57" cy="50" r="5.5" fill="url(#lg1)" />
    <circle cx="43" cy="63" r="5.5" fill="url(#lg1)" />
    <line x1="43" y1="37" x2="57" y2="50" stroke="url(#lg1)" strokeWidth="3" strokeLinecap="round" />
    <line x1="57" y1="50" x2="43" y2="63" stroke="url(#lg1)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ─── 3D Tilt Card ─────────────────────────────────────────────────────────── */
const TiltCard = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', transformPerspective: 1000, ...style }}
      className={`relative cursor-default ${className}`}>
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none z-10 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, rgba(74,144,226,0.15) 0%, transparent 60%)` }} />
      {children}
    </motion.div>
  );
};

/* ─── Floating particles ────────────────────────────────────────────────────── */
const Particles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: `rgba(74,144,226,${p.opacity})` }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [p.opacity, p.opacity * 0.3, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
};

/* ─── 3D Rotating cube ─────────────────────────────────────────────────────── */
const FloatingCube = ({ color, size = 40, delay = 0, x = 0, y = 0 }: { color: string; size?: number; delay?: number; x?: number; y?: number }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%`, perspective: 400 }}
    animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}>
    <motion.div
      animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
      transition={{ duration: 12, delay, repeat: Infinity, ease: 'linear' }}
      style={{ transformStyle: 'preserve-3d', width: size, height: size, position: 'relative' }}>
      {/* 6 faces */}
      {[
        { transform: `rotateY(0deg) translateZ(${size/2}px)` },
        { transform: `rotateY(180deg) translateZ(${size/2}px)` },
        { transform: `rotateY(90deg) translateZ(${size/2}px)` },
        { transform: `rotateY(-90deg) translateZ(${size/2}px)` },
        { transform: `rotateX(90deg) translateZ(${size/2}px)` },
        { transform: `rotateX(-90deg) translateZ(${size/2}px)` },
      ].map((face, i) => (
        <div key={i} className="absolute inset-0 rounded-lg border"
          style={{ transform: face.transform, background: `${color}18`, borderColor: `${color}40`, backdropFilter: 'blur(4px)' }} />
      ))}
    </motion.div>
  </motion.div>
);

/* ─── Morphing blob ─────────────────────────────────────────────────────────── */
const MorphBlob = ({ color, className }: { color: string; className?: string }) => (
  <motion.div className={`absolute pointer-events-none ${className}`}
    animate={{
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 60% 70% 40% / 50% 60% 30% 60%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      scale: [1, 1.08, 1],
      rotate: [0, 10, 0],
    }}
    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    style={{ background: `radial-gradient(ellipse, ${color}18 0%, ${color}05 60%, transparent 80%)` }} />
);

/* ─── Data */
const TEST_ACCOUNTS = [
  { role: 'Distribyutor', nav: 'DISTRIBUTOR', phone: '+998901234567', password: '123456', icon: Truck, tag: 'B2B yetkazib berish', color: '#4A90E2' },
  { role: "Do'kon egasi", nav: 'CLIENT', phone: '+998901234500', password: '123456', icon: Store, tag: 'Savdo platformasi', color: '#7B5CE7' },
  { role: 'Admin', nav: 'ADMIN', phone: '+998900000000', password: '123456', icon: ShieldCheck, tag: 'Platform boshqaruvi', color: '#00C2A8' },
];
const TICKER = ["Real vaqt buyurtmalar", "B2B marketplace", "Yetkazib berish tizimi", "Analitika", "Haydovchi boshqaruvi", "Inventar nazorati", "500+ do'kon", "99.9% Uptime"];

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.85]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleDemo = async (acc: typeof TEST_ACCOUNTS[0]) => {
    setLoadingId(acc.role);
    try {
      const res = await api.post('/api/auth/login', { phone: acc.phone, password: acc.password });
      const payload = res.data?.data ?? res.data;
      const user = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? '';
      if (!user?.id) { toast.error('Xatolik'); return; }
      setAuth({ id: user.id, name: user.name, email: user.email ?? '', phone: user.phone ?? '', role: user.role,
        distributorId: user.distributorId ?? user.distributor?.id,
        clientId: user.clientId ?? user.client?.id,
        driverId: user.driverId ?? user.driver?.id,
      }, token, payload?.refreshToken ?? '');
      toast.success('Xush kelibsiz!');
      setShowDemo(false);
      if (user.role === 'DISTRIBUTOR') navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Xatolik');
    } finally { setLoadingId(null); }
  };

  return (
    <div className="min-h-screen overflow-x-hidden select-none"
      style={{ background: '#050912', fontFamily: "'DM Sans','Outfit',sans-serif" }}>

      {/* ── Dynamic cursor glow ── */}
      <motion.div className="fixed pointer-events-none z-0 w-[800px] h-[800px] rounded-full"
        style={{
          x: useTransform(glowX, v => v - 400),
          y: useTransform(glowY, v => v - 400),
          background: 'radial-gradient(circle, rgba(74,144,226,0.07) 0%, rgba(123,92,231,0.04) 40%, transparent 70%)',
        }} />

      {/* ── Particles ── */}
      <Particles />

      {/* ── Noise ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* ── Grid ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* ── Morphing blobs ── */}
      <MorphBlob color="#4A90E2" className="top-[-10%] left-[-5%] w-[70vw] h-[70vw]" />
      <MorphBlob color="#7B5CE7" className="bottom-[-5%] right-[-10%] w-[60vw] h-[60vw]" />

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-30 flex items-center justify-between px-6 md:px-14 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em', color: '#fff' }}>Dokonect</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDemo(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border transition-all"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(74,144,226,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
            <Play className="w-3.5 h-3.5 fill-current" /> Demo
          </button>
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold rounded-xl border transition-all"
            style={{ color: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'transparent'; }}>
            Kirish
          </button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 0 30px rgba(74,144,226,0.4)' }}>
            Boshlash <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pb-20 overflow-hidden"
        style={{ perspective: 1000 }}>

        {/* Floating 3D cubes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingCube color="#4A90E2" size={44} delay={0}  x={8}  y={15} />
          <FloatingCube color="#7B5CE7" size={32} delay={2}  x={88} y={20} />
          <FloatingCube color="#00C2A8" size={24} delay={4}  x={5}  y={65} />
          <FloatingCube color="#4A90E2" size={20} delay={1}  x={92} y={70} />
          <FloatingCube color="#7B5CE7" size={36} delay={3}  x={50} y={5}  />
          <FloatingCube color="#00C2A8" size={28} delay={5}  x={18} y={82} />
          <FloatingCube color="#4A90E2" size={22} delay={2.5}x={80} y={85} />
        </div>

        {/* Rotating glow rings */}
        {[680, 860, 1060].map((d, i) => (
          <motion.div key={i}
            className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
            style={{ width: d, height: d, marginLeft: -d/2, marginTop: -d/2, borderColor: `rgba(${i===0?'74,144,226':i===1?'123,92,231':'0,194,168'},${0.08-i*0.02})` }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.03, 1] }}
            transition={{ rotate: { duration: 30 + i * 15, repeat: Infinity, ease: 'linear' }, scale: { duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' } }} />
        ))}

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.1) 0%, rgba(123,92,231,0.07) 35%, transparent 65%)' }} />

        {/* Hero content with parallax */}
        <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border mb-10 backdrop-blur-sm"
            style={{ background: 'rgba(74,144,226,0.08)', borderColor: 'rgba(74,144,226,0.22)', color: '#6BA8ED' }}>
            <motion.span className="w-2 h-2 rounded-full" style={{ background: '#4A90E2' }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-xs font-bold uppercase tracking-[0.12em]">O'zbekistoning #1 B2B Platformasi</span>
          </motion.div>

          {/* Headline with 3D reveal */}
          <div className="overflow-hidden" style={{ perspective: 800 }}>
            {['Biznesingizni', 'raqamlashtiring'].map((word, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, rotateX: -60, y: 40 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block', transformOrigin: 'top center' }}>
                <span style={{
                  fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em',
                  fontSize: 'clamp(50px, 9vw, 100px)', display: 'block',
                  ...(i === 1 ? { background: 'linear-gradient(135deg,#4A90E2 0%,#9B72E8 50%,#00C2A8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#fff' }),
                }}>{word}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.42)' }}>
            Distribyutorlar, do'kon egalari va haydovchilarni birlashtiruvchi yagona ekotizim.
            Buyurtmalar, analitika, yetkazib berish — barchasi bir joyda.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(74,144,226,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2.5 px-9 py-4.5 text-white font-bold rounded-2xl text-sm relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 8px 40px rgba(74,144,226,0.4)', padding: '14px 36px' }}>
              <motion.span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)' }} />
              Bepul boshlash
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button whileHover={{ scale: 1.05, borderColor: 'rgba(74,144,226,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDemo(true)}
              className="group flex items-center gap-3 px-8 py-4 font-bold rounded-2xl text-sm border backdrop-blur-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', padding: '14px 32px' }}>
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                whileHover={{ background: 'rgba(74,144,226,0.3)', scale: 1.1 }}>
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </motion.div>
              Demo kirish
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex flex-wrap justify-center gap-px mt-20 rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
            {[{ n: '500+', l: "Faol do'konlar" }, { n: '50+', l: 'Distribyutor' }, { n: '10K+', l: 'Buyurtmalar' }, { n: '99.9%', l: 'Uptime' }].map((s, i) => (
              <motion.div key={i} className="px-8 py-5 text-center"
                style={{ background: 'rgba(255,255,255,0.025)', minWidth: 120 }}
                whileHover={{ background: 'rgba(74,144,226,0.08)' }}
                transition={{ duration: 0.2 }}>
                <motion.p className="text-2xl font-black text-white"
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1, type: 'spring', stiffness: 200 }}>{s.n}</motion.p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Ticker ── */}
      <div className="relative z-10 overflow-hidden py-5 border-y"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(10px)' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="flex gap-14 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#4A90E2' }} />{t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Cards section ── */}
      <section className="relative z-10 px-6 md:px-14 py-32 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] mb-4" style={{ color: '#4A90E2' }}>Platforma imkoniyatlari</p>
          <h2 className="text-4xl md:text-6xl font-black text-white" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Har bir rol uchun<br />
            <span style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>maxsus panel</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Truck, title: 'Distribyutor', color: '#4A90E2', desc: 'Mahsulot, buyurtma va haydovchilarni boshqarish tizimi', points: ['Mahsulot va narx boshqaruvi', 'Buyurtmalarni qabul qilish', 'Haydovchi tayinlash', 'Sotuv analitikasi', 'Inventar nazorati'] },
            { icon: Store, title: "Do'kon egasi", color: '#7B5CE7', desc: 'Distribyutorlardan mahsulot buyurtma qilish platformasi', points: ['Distribyutorga ulanish', 'Katalogdan buyurtma', 'Buyurtma kuzatish', 'Moliyaviy hisobot', 'Chat imkoniyati'] },
            { icon: ShieldCheck, title: 'Admin', color: '#00C2A8', desc: 'Butun platformani nazorat qilish va boshqarish', points: ['Platforma statistikasi', 'Foydalanuvchi boshqaruvi', 'GMV monitoring', 'Distribyutor CRUD', 'Global analitika'] },
          ].map((card, i) => (
            <motion.div key={card.title}
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <TiltCard className="h-full"
                style={{ borderRadius: 24, border: `1px solid rgba(255,255,255,0.08)`, background: 'rgba(255,255,255,0.025)' }}>
                <div className="p-8 h-full" style={{ transform: 'translateZ(20px)' }}>
                  <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7 border"
                    style={{ background: `${card.color}15`, borderColor: `${card.color}25` }}
                    whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <card.icon className="w-7 h-7" style={{ color: card.color }} />
                  </motion.div>
                  <h3 className="text-xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>{card.title}</h3>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{card.desc}</p>
                  <ul className="space-y-3">
                    {card.points.map((p, j) => (
                      <motion.li key={j} className="flex items-center gap-2.5 text-sm"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 + j * 0.06 }}>
                        <motion.div className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: card.color }}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, delay: j * 0.3, repeat: Infinity }} />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div className="mt-8 flex items-center gap-1.5 text-sm font-bold cursor-pointer"
                    style={{ color: card.color }}
                    whileHover={{ gap: '10px' }} transition={{ duration: 0.2 }}>
                    Batafsil <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 md:px-14 pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="relative rounded-[32px] overflow-hidden p-14 md:p-20 text-center border"
          style={{ background: 'linear-gradient(135deg,rgba(74,144,226,0.1),rgba(123,92,231,0.08))', borderColor: 'rgba(74,144,226,0.2)' }}>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(74,144,226,0.7),transparent)' }} />
            <motion.div className="absolute inset-0" animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,144,226,0.12) 0%, transparent 60%)' }} />
          </div>

          <div className="relative flex flex-col items-center">
            <motion.div animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="mb-8">
              <Logo size={56} />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ letterSpacing: '-0.04em' }}>
              Hoziroq sinab ko'ring
            </h2>
            <p className="mb-10 max-w-md text-base" style={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>
              Ro'yxatdan o'tmay, demo hisoblar orqali platformani to'liq sinab ko'ring
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <motion.button whileHover={{ scale: 1.06, boxShadow: '0 20px 60px rgba(74,144,226,0.55)' }}
                whileTap={{ scale: 0.97 }} onClick={() => setShowDemo(true)}
                className="flex items-center gap-2.5 px-9 py-4 text-white font-bold rounded-2xl text-sm"
                style={{ background: 'linear-gradient(135deg,#4A90E2,#7B5CE7)', boxShadow: '0 8px 40px rgba(74,144,226,0.4)', padding: '14px 36px' }}>
                <Play className="w-4 h-4 fill-white" /> Demo kirish
              </motion.button>
              <motion.button whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.25)' }}
                whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-9 py-4 text-sm font-bold rounded-2xl border transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', padding: '14px 36px' }}>
                Ro'yxatdan o'tish <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t px-6 md:px-14 py-10"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><Logo size={26} /><span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.6)' }}>Dokonect</span></div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2025 Dokonect. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {['Shartlar', 'Maxfiylik', 'Aloqa'].map(l => (
              <button key={l} className="hover:text-white transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Demo Modal ── */}
      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(20px)', background: 'rgba(5,9,18,0.88)' }}
            onClick={e => e.target === e.currentTarget && setShowDemo(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40, rotateX: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
              style={{ background: '#0A1120', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 40px 120px rgba(74,144,226,0.2)' }}>

              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#4A90E2,#7B5CE7,#00C2A8,transparent)' }} />

              <div className="p-7">
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2"><Logo size={28} /><span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#fff' }}>Dokonect</span></div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Rol tanlang va platformani bepul sinab ko'ring</p>
                  </div>
                  <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={() => setShowDemo(false)}
                    className="p-2 rounded-xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {TEST_ACCOUNTS.map((acc, i) => (
                    <motion.button key={acc.role}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ x: 4, borderColor: `${acc.color}40`, background: `${acc.color}12` }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDemo(acc)}
                      disabled={loadingId !== null}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors text-left disabled:opacity-60"
                      style={{ background: `${acc.color}08`, borderColor: `${acc.color}18` }}>
                      <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ background: `${acc.color}14`, borderColor: `${acc.color}22` }}
                        whileHover={{ rotate: 10, scale: 1.1 }}>
                        {loadingId === acc.role
                          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 rounded-full border-2 border-t-transparent" style={{ borderColor: acc.color, borderTopColor: 'transparent' }} />
                          : <acc.icon className="w-5 h-5" style={{ color: acc.color }} />}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{acc.role}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{acc.tag}</p>
                      </div>
                      <motion.div whileHover={{ x: 3 }}><ChevronRight className="w-4 h-4 shrink-0" style={{ color: `${acc.color}60` }} /></motion.div>
                    </motion.button>
                  ))}
                </div>

                <motion.div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.22)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
                    Barcha demo hisoblar uchun parol:{' '}
                    <span className="font-mono font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>123456</span>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}