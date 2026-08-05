import { motion } from 'framer-motion';
import { Plus, ShieldCheck, Trash2, UserCog } from 'lucide-react';

const users = [
  { id: 1, name: 'Alex Rivera', email: 'alex@company.com', role: 'Admin' },
  { id: 2, name: 'Jordan Chen', email: 'jordan@company.com', role: 'Security Analyst' },
];

export default function UsersPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-slate-400">Create, disable, and assign roles.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-400">
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="rounded-full border border-slate-800 bg-slate-800/70 px-3 py-1">{user.role}</span>
              <button className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"><UserCog size={16} /></button>
              <button className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"><ShieldCheck size={16} /></button>
              <button className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
