import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!login(email, password)) {
      setError('Invalid administrator credentials.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)] p-4 text-slate-100"><section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-glow backdrop-blur"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-500/20 p-3 text-blue-400"><ShieldCheck size={24} /></div><div><h1 className="text-2xl font-semibold">Administrator Console</h1><p className="text-sm text-slate-400">SentinelAI platform access</p></div></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm text-slate-300">Email<div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3"><Mail size={16} className="text-slate-500" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full bg-transparent outline-none" /></div></label><label className="block text-sm text-slate-300">Password<div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3"><Lock size={16} className="text-slate-500" /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full bg-transparent outline-none" /></div></label>{error && <p className="text-sm text-rose-400">{error}</p>}<button className="w-full rounded-xl bg-blue-500 px-4 py-3 font-medium hover:bg-blue-400">Sign in</button></form></section></main>;
}
