import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember_me: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await login({ ...values, remember_me: values.remember_me ?? false });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-400"><ShieldCheck size={24} /></div>
        <div>
          <h1 className="text-2xl font-semibold">SentinelAI</h1>
          <p className="text-sm text-slate-400">Secure LLM Gateway Access</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm text-slate-300">
          <span className="mb-2 block">Email</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3">
            <Mail size={16} className="text-slate-500" />
            <input {...register('email')} className="w-full bg-transparent outline-none" placeholder="analyst@company.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 block">Password</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3">
            <Lock size={16} className="text-slate-500" />
            <input type={showPassword ? 'text' : 'password'} {...register('password')} className="w-full bg-transparent outline-none" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
        </label>

        <label className="flex items-center justify-between text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <input type="checkbox" {...register('remember_me')} className="rounded border-slate-700 bg-slate-950" />
            Remember me
          </span>
          <a href="#" className="text-blue-400">Forgot password?</a>
        </label>

        <button disabled={isSubmitting} className="w-full rounded-xl bg-blue-500 px-4 py-3 font-medium text-white transition hover:bg-blue-400 disabled:opacity-70">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New to SentinelAI? <Link to="/register" className="text-blue-400">Create account</Link>
      </p>
    </motion.div>
  );
}
