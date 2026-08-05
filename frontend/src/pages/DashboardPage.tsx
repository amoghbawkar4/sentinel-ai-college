import { motion } from 'framer-motion';
import { Activity, DatabaseZap, ShieldCheck, ServerCog, Wifi } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const cards = [
  { title: 'System Status', value: 'Operational', icon: ShieldCheck, accent: 'text-emerald-400' },
  { title: 'Backend Status', value: 'Healthy', icon: ServerCog, accent: 'text-blue-400' },
  { title: 'Database Status', value: 'Connected', icon: DatabaseZap, accent: 'text-violet-400' },
  { title: 'Redis Status', value: 'Active', icon: Wifi, accent: 'text-cyan-400' },
];

export default function DashboardPage() {
  const { adminEmail } = useAdminAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/50 p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-blue-300">Welcome to SentinelAI</p>
            <h2 className="text-2xl font-semibold">Administrator</h2>
            <p className="mt-2 text-sm text-slate-400">{adminEmail}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">All monitoring systems online</div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, accent }) => (
          <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{title}</p>
              <Icon className={accent} size={18} />
            </div>
            <p className="mt-4 text-xl font-semibold">{value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center gap-2 text-blue-300"><Activity size={18} /> Current Activity</div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">No active LLM requests detected. The gateway is ready to monitor and secure future requests.</div>
      </motion.div>
    </div>
  );
}
