import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { authApi } from '@/api/auth.api';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const RESEND_SECONDS = 60;

const OtpPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') ?? '';
  const { setUser } = useAuthContext();
  const { toast } = useToast();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const code = digits.join('');
  const allFilled = useMemo(() => digits.every((d) => /\d/.test(d)), [digits]);

  const submit = async (finalCode: string) => {
    if (!email || finalCode.length !== 6) return;
    setSubmitting(true);
    try {
      const u = await authApi.verifyOtp(email, finalCode);
      setUser(u);
      navigate('/dashboard');
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid or expired code';
      toast({ variant: 'destructive', title: 'Verification failed', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (allFilled && !submitting) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFilled, code]);

  const setDigitAt = (i: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const resend = async () => {
    if (secondsLeft > 0 || !email) return;
    try {
      await authApi.resendOtp(email);
      toast({ title: 'Code resent', description: `New code sent to ${email}` });
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      toast({ variant: 'destructive', title: 'Could not resend code' });
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-4">
          <Logo size={32} />
        </div>
        <div className="flex flex-col items-center text-center">
          <Mail size={48} className="text-blue-400" />
          <h2 className="text-xl text-white font-semibold mt-3">Check your email</h2>
          <p className="text-slate-400 text-sm mt-1">
            We sent a 6-digit code to <span className="text-white">{email || 'your inbox'}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigitAt(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>

        <div className="text-center mt-6">
          {secondsLeft > 0 ? (
            <span className="text-slate-500 text-sm">
              Resend in {mins}:{secs}
            </span>
          ) : (
            <button onClick={resend} className="text-blue-400 hover:text-blue-300 text-sm">
              Resend code
            </button>
          )}
        </div>

        <button
          onClick={() => submit(code)}
          disabled={!allFilled || submitting}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Verifying...
            </>
          ) : (
            'Verify and continue'
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default OtpPage;
