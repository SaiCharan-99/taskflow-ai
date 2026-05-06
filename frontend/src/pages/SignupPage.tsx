import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { authApi } from '@/api/auth.api';
import { useToast } from '@/hooks/use-toast';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 chars'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Min 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const scorePassword = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const STRENGTH = [
  { label: '', color: 'bg-slate-700', text: '' },
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' },
  { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' },
  { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pwd = watch('password') ?? '';
  const score = scorePassword(pwd);
  const meta = STRENGTH[score];

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.signup(values.name, values.email, values.password);
      navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not create account';
      toast({ variant: 'destructive', title: 'Sign up failed', description: msg });
    }
  });

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden gradient-mesh">
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <Logo size={80} />
          <h1 className="mt-6 text-4xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Build with your team.
          </h1>
          <p className="mt-4 text-white/80 max-w-sm">
            Create an account in seconds. Bring your team. Let AI do the busywork.
          </p>
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
          <h2 className="text-xl text-white font-semibold mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm mb-6">Start building with your team</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
              <input {...register('name')} placeholder="John Smith" className={inputClass} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
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
                  placeholder="At least 8 characters"
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
              {pwd && (
                <div className="mt-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className={`h-1.5 rounded-full ${
                          i <= score ? meta.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  {meta.label && (
                    <div className={`text-xs mt-1 ${meta.text}`}>{meta.label}</div>
                  )}
                </div>
              )}
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Confirm password
              </label>
              <input
                {...register('confirm')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={inputClass}
              />
              {errors.confirm && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>
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
                  <Loader2 size={16} className="animate-spin" /> Creating account...
                </>
              ) : (
                'Create account'
              )}
            </motion.button>
          </form>

          <p className="text-slate-400 text-sm mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
