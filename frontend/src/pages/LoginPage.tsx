import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Sparkles, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { authApi } from '@/api/auth.api';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const PILLS = [
  { icon: Sparkles, label: 'AI-powered' },
  { icon: Users, label: 'Team collaboration' },
  { icon: Zap, label: 'Real-time updates' },
];

const inputClass =
  'w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const LoginPage = () => {
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const u = await authApi.login(values.email, values.password);
      setUser(u);
      navigate('/dashboard');
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password';
      toast({ variant: 'destructive', title: 'Sign in failed', description: msg });
    }
  });

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden gradient-mesh">
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <Logo size={80} />
          <h1 className="mt-6 text-4xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Ship faster. Together.
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PILLS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                className="backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 text-white/90 text-sm flex items-center gap-2"
              >
                <p.icon size={14} /> {p.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Logo size={28} />
            <span className="text-2xl font-bold text-white">TaskFlow</span>
          </div>
          <h2 className="text-xl text-white font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your workspace</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={inputClass}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <p className="text-slate-400 text-sm mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
