import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, Store, Briefcase, User, Phone, MapPin, ArrowRight, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerFn } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name:     z.string().min(2, 'Kamida 2 belgi'),
  email:    z.string().email("Noto'g'ri email"),
  password: z.string().min(6, 'Kamida 6 belgi'),
  role:     z.enum(['STORE', 'DISTRIBUTOR']),
  address:  z.string().min(5, 'Manzilni kiriting'),
  phone:    z.string().min(7, 'Telefon raqam kiriting'),
});
type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');   // ← xato state

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'DISTRIBUTOR' },
  });

  const selectedRole = watch('role');

  const { mutate, isPending } = useMutation({
    mutationFn: registerFn,
    onSuccess: (data) => {
      setErrorMsg('');
      console.log('✅ Register response:', data);

      const user   = data.user   ?? data.data?.user   ?? data.data;
      const accTok = data.token  ?? data.accessToken  ?? data.data?.token ?? data.data?.accessToken ?? '';
      const refTok = data.refreshToken ?? data.data?.refreshToken ?? '';

      console.log('👤 User:', user);
      console.log('🔑 Token:', accTok);

      if (!user?.id) {
        setErrorMsg("Foydalanuvchi ma'lumotlari topilmadi");
        return;
      }

      setAuth(
        {
          id:            user.id,
          name:          user.name,
          email:         user.email         ?? '',
          phone:         user.phone         ?? '',
          role:          user.role,
          distributorId: user.distributorId ?? user.distributor?.id ?? undefined,
          clientId:      user.clientId      ?? user.client?.id      ?? undefined,
          driverId:      user.driverId      ?? user.driver?.id      ?? undefined,
        },
        accTok,
        refTok,
      );

      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");

      if (user.role === 'STORE')            navigate('/store/dashboard',       { replace: true });
      else if (user.role === 'DISTRIBUTOR') navigate('/distributor/dashboard', { replace: true });
      else if (user.role === 'DRIVER')      navigate('/driver/dashboard',      { replace: true });
      else if (user.role === 'ADMIN')       navigate('/admin/dashboard',       { replace: true });
      else                                  navigate('/',                       { replace: true });
    },
    onError: (error: any) => {
      console.log('❌ Error:', error);
      console.log('❌ Error response:', error.response?.data);
      const msg = error.response?.data?.message
        || error.response?.data?.error
        || `Xatolik (${error.response?.status || 'network'})`;
      setErrorMsg(msg);   // ← sahifada ko'rsatish
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">
            Doko<span className="text-violet-600">nect</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Akkaunt yarating</h1>
            <p className="text-slate-500 text-sm">Platformaga qo'shiling</p>
          </div>

          <form onSubmit={handleSubmit((d) => { setErrorMsg(''); mutate(d); })} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Rolingiz
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'DISTRIBUTOR', icon: Briefcase, label: 'Distribyutor' },
                  { value: 'STORE',       icon: Store,     label: "Do'kon egasi" },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value as any)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all',
                      selectedRole === value
                        ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      selectedRole === value ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={selectedRole === 'DISTRIBUTOR' ? 'Kompaniya nomi' : "Do'kon nomi"}
                placeholder="Dokonect MChJ"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Telefon"
                placeholder="+998901234567"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Manzil"
                placeholder="Toshkent, Chilonzor"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.address?.message}
                {...register('address')}
              />
            </div>

            {/* Parol */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Parol</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn(
                    'w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all',
                    errors.password ? 'border-red-400' : 'border-slate-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* ── Xato xabari — sahifada doimiy ── */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
              </motion.div>
            )}

            <Button type="submit" isLoading={isPending} className="w-full" size="lg">
              {!isPending && <>Ro'yxatdan o'tish <ArrowRight className="w-4 h-4 ml-1.5" /></>}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Allaqachon a'zomisiz?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;