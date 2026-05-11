import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Store, Truck, ChevronRight, Play, Clock, Package, TrendingUp, Users, BarChart3, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import toast from 'react-hot-toast';
import DokonectLogo from '../components/ui/DokonectLogo';

/* ─── Logo ──────────────────────────────────────────────────────────────────── */
const Logo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#7B5CE7" />
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

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const ALL_TEST_ACCOUNTS = [
  { role: 'Distribyutor', nav: 'DISTRIBUTOR', phone: '+998901234567', password: '123456', icon: Truck, tag: 'Mahsulot sotish va boshqarish', color: '#4A90E2', mobileOnly: false },
  { role: "Do'kon egasi", nav: 'CLIENT', phone: '+998901234500', password: '123456', icon: Store, tag: 'Mahsulot buyurtma qilish', color: '#7B5CE7', mobileOnly: false },
  { role: 'Haydovchi', nav: 'DRIVER', phone: '+998901234599', password: '123456', icon: Truck, tag: 'Yetkazib berish', color: '#00C2A8', mobileOnly: true },
];

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check scroll position for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter accounts based on screen size
  const TEST_ACCOUNTS = ALL_TEST_ACCOUNTS.filter(acc => !acc.mobileOnly || isMobile);

  const handleDemo = async (acc: typeof ALL_TEST_ACCOUNTS[0]) => {
    setLoadingId(acc.role);
    try {
      const res = await api.post('/api/auth/login', { phone: acc.phone, password: acc.password });
      const payload = res.data?.data ?? res.data;
      const user = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? '';
      if (!user?.id) {
        toast.error('Xatolik');
        return;
      }
      setAuth(
        {
          id: user.id,
          name: user.name,
          email: user.email ?? '',
          phone: user.phone ?? '',
          role: user.role,
          distributorId: user.distributorId ?? user.distributor?.id,
          clientId: user.clientId ?? user.client?.id,
          driverId: user.driverId ?? user.driver?.id,
        },
        token,
        payload?.refreshToken ?? ''
      );
      toast.success('Xush kelibsiz!');
      setShowDemo(false);
      if (user.role === 'DISTRIBUTOR') navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'STORE' || user.role === 'CLIENT') navigate('/store/dashboard', { replace: true });
      else if (user.role === 'DRIVER') navigate('/driver/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Xatolik');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-[#0A0F1E] overflow-x-hidden" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      {/* Simple gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#0F1629] to-[#0A0F1E] -z-10" />
      <div
        className="fixed inset-0 opacity-30 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(74, 144, 226, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(123, 92, 231, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* ── Navbar ── */}
      {/* <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#081028]/95 backdrop-blur-lg border-b border-white/10 shadow-lg' : 'bg-[#081028]'
          }`}> */}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-[#0B0F2A]/92 backdrop-blur-xl border-b border-indigo-500/10 shadow-lg"
          : "bg-[#081028]"
          }`}
      >

        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5 max-w-7xl mx-auto">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <DokonectLogo size={48} variant="full" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowDemo(true)}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
              <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
              Kirish
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#4A90E2] to-[#7B5CE7] hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer">
              Boshlash <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-4 sm:px-6 pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-32 max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
          <span className="bg-gradient-to-r from-[#4A90E2] via-[#7B5CE7] to-[#00C2A8] bg-clip-text text-transparent">
            Distribyuter va do'kon egalarini
          </span>
          <br />
          bog'laydigan platforma
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
          Distribyuter va do'kon egalarini bog'laydigan platforma. Oson buyurtma, samarali boshqaruv va tezkor yetkazib berish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#4A90E2] to-[#7B5CE7] hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer">
            Bepul boshlash
          </button>
          <button
            onClick={() => setShowDemo(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 hover:text-white transition-all cursor-pointer">
            <Play className="w-4 h-4" /> Demo kirish
          </button>
        </motion.div>
      </section>

      {/* ── Cards section ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Platformaning asosiy imkoniyatlari
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Har bir foydalanuvchi uchun maxsus dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Truck,
              title: 'Distribyutor',
              color: '#4A90E2',
              desc: 'Mahsulot sotish, buyurtmalarni boshqarish va haydovchilarni nazorat qilish',
              points: ['Mahsulot katalogi boshqaruvi', 'Buyurtmalarni qabul qilish', 'Haydovchi tayinlash', 'Real-time sotuv analitikasi', 'Ombor va inventar nazorati'],
            },
            {
              icon: Store,
              title: "Do'kon egasi",
              color: '#7B5CE7',
              desc: 'Distribyutorlardan mahsulot buyurtma qilish va biznesingizni rivojlantirish',
              points: ['Bir nechta distribyutorga ulanish', 'Katalogdan tez buyurtma', 'Buyurtma holati kuzatuvi', "Qarz va to'lov hisoboti", 'Distribyutor bilan chat'],
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${card.color}20` }}>
                <card.icon className="w-7 h-7" style={{ color: card.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{card.desc}</p>
              <ul className="space-y-3">
                {card.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: card.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Nima uchun <span className="bg-gradient-to-r from-[#4A90E2] to-[#7B5CE7] bg-clip-text text-transparent">Dokonect?</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            O'zbekiston bozori uchun maxsus ishlab chiqilgan, zamonaviy texnologiyalar va foydalanuvchi tajribasiga asoslangan B2B platforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Package, title: 'Inventar boshqaruvi', desc: 'Real-time stok nazorati, ombor boshqaruvi va avtomatik ogohlantirish', color: '#4A90E2' },
            { icon: TrendingUp, title: 'Sotuv analitikasi', desc: 'Batafsil hisobotlar, GMV tracking va sotuv prognozlash', color: '#7B5CE7' },
            { icon: Users, title: 'Multi-rol tizimi', desc: "Do'kon, distribyutor, haydovchi va admin rollari", color: '#00C2A8' },
            { icon: BarChart3, title: 'Real-time dashboard', desc: 'Jonli statistika, buyurtma monitoring va analitika', color: '#FF6B6B' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}20` }}>
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 text-center">
          <div className="mb-4 sm:mb-6">
            <Logo size={40} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Hoziroq bepul sinab ko'ring</h2>
          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-2">
            Ro'yxatdan o'tmay demo hisoblar orqali platformaning barcha imkoniyatlarini sinab ko'ring
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <button
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#4A90E2] to-[#7B5CE7] hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer">
              Demo kirish
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 hover:text-white transition-all cursor-pointer">
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="text-base font-semibold text-gray-400">Dokonect</span>
          </div>
          <p className="text-xs text-gray-500">© 2025 Dokonect. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            {['Shartlar', 'Maxfiylik', 'Aloqa'].map((l) => (
              <button key={l} className="hover:text-gray-300 transition-colors cursor-pointer">
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Demo Modal ── */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowDemo(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F1629] rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <Logo size={28} />
                      <span className="text-lg font-bold text-white">Dokonect</span>
                    </div>
                    <p className="text-sm text-gray-400">Rol tanlang va platformani bepul sinab ko'ring</p>
                  </div>
                  <button onClick={() => setShowDemo(false)} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {TEST_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      onClick={() => handleDemo(acc)}
                      disabled={loadingId !== null}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left disabled:opacity-60 cursor-pointer">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${acc.color}20` }}>
                        {loadingId === acc.role ? (
                          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: acc.color }} />
                        ) : (
                          <acc.icon className="w-5 h-5" style={{ color: acc.color }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{acc.role}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{acc.tag}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                  <p className="text-xs text-gray-400">
                    Barcha demo hisoblar uchun parol: <span className="font-mono font-semibold text-gray-300">123456</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
