import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Ban, CheckCircle2, Search, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type Metrics = { total_requests: number; allowed_requests: number; blocked_requests: number; warned_requests: number; threat_counts: Record<string, number>; average_risk_score: number };
type Event = { event_id: string; request_id: string; conversation_id: string; timestamp: string; user_id: string; risk_score: number | null; risk_severity: string | null; policy_decision: string | null; outcome: string };
type Detector = { detector_name: string; count: number; non_safe_count: number };
type Risk = { severity_distribution: Record<string, number>; high_risk_requests: number; trend: { timestamp: string; average_score: number; high_risk_count: number }[] };
type Outcomes = { percentages: Record<string, number>; policy_distribution: Record<string, number> };
type UserActivity = { user_id: string; user_name: string | null; request_count: number; threat_count: number; average_risk_score: number };

const statusClass = (value: string | null) => value?.toLowerCase() === 'allowed' || value?.toLowerCase() === 'allow' ? 'text-emerald-300' : value?.toLowerCase().includes('block') || value?.toLowerCase() === 'denied' ? 'text-rose-300' : 'text-amber-300';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [detectors, setDetectors] = useState<Detector[]>([]);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [outcomes, setOutcomes] = useState<Outcomes | null>(null);
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [filters, setFilters] = useState({ search: '', severity: '', policy_decision: '', user_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value) as [string, string][]).toString();
      const [metricResponse, timelineResponse, detectorResponse, riskResponse, outcomeResponse, usersResponse] = await Promise.all([
        api.get<Metrics>('/dashboard/metrics'),
        api.get<Event>(`/dashboard/timeline?limit=50${query ? `&${query}` : ''}`),
        api.get<{ detectors: Detector[] }>('/dashboard/detectors'),
        api.get<Risk>('/dashboard/risk'), api.get<Outcomes>('/dashboard/outcomes'), api.get<UserActivity[]>('/dashboard/users'),
      ]);
      setMetrics(metricResponse.data); setEvents(timelineResponse.data as unknown as Event[]); setDetectors(detectorResponse.data.detectors); setRisk(riskResponse.data); setOutcomes(outcomeResponse.data); setUsers(usersResponse.data);
    } catch { setError('Unable to load security analytics. Check the API connection and try again.'); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (loading && !metrics) return <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-400">Loading security analytics...</div>;
  if (error && !metrics) return <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">{error}<button onClick={() => { void load(); }} className="ml-4 rounded-lg border border-rose-400/30 px-3 py-1 text-sm">Retry</button></div>;
  const cards = [['Total Requests', metrics?.total_requests, Activity], ['Allowed', metrics?.allowed_requests, CheckCircle2], ['Blocked', metrics?.blocked_requests, Ban], ['Warned / Reviewed', metrics?.warned_requests, AlertTriangle], ['Threats', Object.values(metrics?.threat_counts || {}).reduce((sum, count) => sum + count, 0), ShieldAlert]] as const;
  const maxDetector = Math.max(1, ...detectors.map((item) => item.count));
  return <div className="space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-blue-300">Security operations</p><h2 className="text-2xl font-semibold">Admin Security Dashboard</h2><p className="mt-1 text-sm text-slate-400">Live analytics from persisted gateway events.</p></div><button onClick={() => { void load(); }} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Refresh data</button></div>
    {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex justify-between text-sm text-slate-400"><span>{label}</span><Icon size={17} className="text-blue-300" /></div><p className="mt-3 text-2xl font-semibold">{value ?? 0}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="mb-4 flex flex-wrap items-center gap-2"><h3 className="mr-auto font-semibold">Request timeline</h3><div className="flex items-center gap-2 rounded-lg border border-slate-700 px-2"><Search size={15} className="text-slate-500" /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search IDs" className="w-24 bg-transparent py-1.5 text-xs outline-none" /></div><select value={filters.severity} onChange={(event) => setFilters({ ...filters, severity: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs"><option value="">All risk</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select><select value={filters.policy_decision} onChange={(event) => setFilters({ ...filters, policy_decision: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs"><option value="">All policy</option><option>ALLOW</option><option>WARN</option><option>BLOCK</option><option>ESCALATE</option></select><button onClick={() => { void load(); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs">Apply</button></div><div className="overflow-x-auto">{events.length ? <table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-2">Time</th><th>User / request</th><th>Risk</th><th>Policy</th><th>Outcome</th></tr></thead><tbody>{events.map((event) => <tr key={event.event_id} className="border-t border-slate-800"><td className="py-3 text-slate-400">{new Date(event.timestamp).toLocaleString()}</td><td><Link to={`/investigations/${event.event_id}`} className="text-blue-300 hover:underline">{event.user_id.slice(0, 8)}</Link><p className="text-slate-500">{event.request_id.slice(0, 8)}</p></td><td className={statusClass(event.risk_severity)}>{event.risk_severity || '-'} {event.risk_score ?? ''}</td><td>{event.policy_decision || '-'}</td><td className={statusClass(event.outcome)}>{event.outcome.toUpperCase()}</td></tr>)}</tbody></table> : <p className="py-8 text-center text-sm text-slate-500">No events match these filters.</p>}</div></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold">Detector activity</h3><div className="mt-5 space-y-4">{detectors.length ? detectors.map((detector) => <div key={detector.detector_name}><div className="mb-1 flex justify-between text-sm"><span>{detector.detector_name}</span><span className="text-amber-300">{detector.non_safe_count} detected / {detector.count}</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-amber-400" style={{ width: `${detector.count / maxDetector * 100}%` }} /></div></div>) : <p className="py-8 text-sm text-slate-500">No detector observations recorded.</p>}</div></section>
    </div>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold">Risk distribution</h3><div className="mt-4 space-y-3">{Object.entries(risk?.severity_distribution || {}).map(([severity, count]) => <div key={severity} className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3"><span className={statusClass(severity)}>{severity}</span><strong>{count}</strong></div>)}<p className="text-sm text-slate-400">High-risk requests: {risk?.high_risk_requests || 0}</p></div></section><section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold">Risk over time</h3><div className="mt-4 max-h-40 space-y-2 overflow-y-auto">{risk?.trend.length ? risk.trend.map((point) => <div key={point.timestamp} className="flex items-center justify-between text-xs"><span className="text-slate-500">{new Date(point.timestamp).toLocaleString()}</span><span className="text-cyan-300">{point.average_score} avg · {point.high_risk_count} high</span></div>) : <p className="text-sm text-slate-500">No risk trend data recorded.</p>}</div></section><section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold">Outcome analytics</h3><div className="mt-4 space-y-2 text-sm">{Object.entries(outcomes?.percentages || {}).map(([key, value]) => <div key={key} className="flex justify-between"><span className="text-slate-400">{key.replace(/_/g, ' ')}</span><span>{value}%</span></div>)}<p className="mt-4 border-t border-slate-800 pt-3 text-slate-400">Policy: {Object.entries(outcomes?.policy_distribution || {}).map(([key, value]) => `${key} ${value}`).join(' · ') || 'No policy data'}</p></div></section></div>
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold">User activity</h3><div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">{users.length ? users.slice(0, 9).map((item) => <div key={item.user_id} className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm"><span className="truncate">{item.user_name || item.user_id.slice(0, 8)}<small className="block text-xs text-slate-500">{item.request_count} requests · {item.threat_count} threats</small></span><span className="text-slate-300">{item.average_risk_score}</span></div>) : <p className="text-sm text-slate-500">No user activity recorded.</p>}</div></section>
  </div>;
}
