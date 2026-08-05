import { motion } from 'framer-motion';

const logs = [
  { id: 1, timestamp: '2026-07-25 10:12', user: 'A. Rivera', action: 'Login', status: 'Success', ip: '192.168.1.10' },
  { id: 2, timestamp: '2026-07-25 09:58', user: 'J. Chen', action: 'Role Update', status: 'Success', ip: '10.0.0.5' },
];

export default function AuditLogsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <p className="text-sm text-slate-400">Search, sort, and review security events.</p>
        </div>
        <input placeholder="Search logs..." className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 md:w-72" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/70 text-slate-300">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800 bg-slate-950/60">
                <td className="px-4 py-3">{log.timestamp}</td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 text-emerald-400">{log.status}</td>
                <td className="px-4 py-3">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
