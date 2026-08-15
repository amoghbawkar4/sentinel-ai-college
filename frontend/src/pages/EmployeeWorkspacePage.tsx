import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LoaderCircle, LogOut, Menu, Plus, Send, X } from 'lucide-react';

import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

type Conversation = { id: string; created_at: string; updated_at: string };
type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: string };

function ResponseContent({ content }: { content: string }) {
  const blocks = content.split(/```(?:[\w+-]+)?\n?/);
  return <>{blocks.map((block, index) => index % 2
    ? <pre key={index} className="my-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-blue-100"><code>{block}</code></pre>
    : <p key={index} className="whitespace-pre-wrap">{block}</p>)}</>;
}

export default function EmployeeWorkspacePage() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const loadConversations = async () => {
    const response = await api.get<Conversation[]>('/workspace/conversations');
    setConversations(response.data);
  };

  useEffect(() => { setConversations([]); setConversationId(null); setMessages([]); loadConversations().catch(() => setError('Unable to load conversation history.')); }, [user?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const openConversation = async (id: string) => {
    const response = await api.get<{ messages: Message[] }>(`/workspace/conversations/${id}`);
    setConversationId(id);
    setMessages(response.data.messages);
    setError('');
  };

  const newChat = async () => {
    const response = await api.post<Conversation>('/workspace/conversations', {});
    setConversationId(response.data.id);
    setMessages([]);
    setError('');
    await loadConversations();
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    let activeId = conversationId;
    try {
      if (!activeId) {
        const response = await api.post<Conversation>('/workspace/conversations', {});
        activeId = response.data.id;
        setConversationId(activeId);
      }
      const content = input;
      setInput('');
      setError('');
      setMessages((current) => [...current, { id: `pending-${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() }]);
      setLoading(true);
      const response = await api.post<{ user_message: Message; assistant_message: Message }>(`/workspace/conversations/${activeId}/messages`, { content });
      setMessages((current) => [...current.slice(0, -1), response.data.user_message, response.data.assistant_message]);
      await loadConversations();
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setMessages((current) => current.filter((message) => !message.id.startsWith('pending-')));
      setError(detail || 'Unable to send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="flex min-h-screen bg-slate-950 text-slate-100">
    <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 overflow-hidden border-r border-slate-800 bg-slate-900/70 transition-all`}>
      <div className="flex h-full w-72 flex-col p-4"><button onClick={() => { void logout(); }} className="inline-flex items-center gap-2 text-left text-sm text-slate-400 hover:text-slate-100"><ArrowLeft size={16} /> Exit Workspace</button><div className="mt-6"><p className="font-semibold">Employee Workspace</p><p className="mt-1 text-xs text-slate-400">Role: {user?.role_name}</p></div><button onClick={() => newChat().catch(() => setError('Unable to create a conversation.'))} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-sm font-medium hover:bg-blue-400"><Plus size={16} /> New Chat</button><nav className="mt-5 flex-1 space-y-1 overflow-y-auto">{conversations.map((conversation, index) => <button key={conversation.id} onClick={() => openConversation(conversation.id).catch(() => setError('Unable to open conversation.'))} className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm ${conversation.id === conversationId ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}>Conversation {conversations.length - index}</button>)}</nav><button onClick={() => { void logout(); }} className="flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"><LogOut size={16} /> Logout</button></div>
    </aside>
    <section className="flex min-w-0 flex-1 flex-col"><header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/40 p-4"><button onClick={() => setSidebarOpen((value) => !value)} className="rounded-lg p-2 hover:bg-slate-800">{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button><div><h1 className="font-semibold">Employee Workspace</h1><p className="text-xs text-slate-400">Enterprise AI Assistant</p></div></header><div className="flex-1 overflow-y-auto p-4"><div className="mx-auto max-w-3xl space-y-4">{messages.length === 0 && <div className="pt-24 text-center"><h2 className="text-2xl font-semibold">Enterprise AI Assistant</h2><p className="mt-2 text-sm text-slate-400">Start a new conversation to begin.</p></div>}{messages.map((message) => <div key={message.id} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-8 bg-blue-500 text-white' : 'mr-8 border border-slate-800 bg-slate-900/70'}`}>{message.role === 'assistant' ? <ResponseContent content={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>}</div>)}{loading && <div className="flex items-center gap-2 text-sm text-slate-400"><LoaderCircle className="animate-spin" size={16} /> Generating response…</div>}{error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}<div ref={endRef} /></div></div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="border-t border-slate-800 bg-slate-900/40 p-4"><div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} placeholder="Write a message…" className="min-h-12 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none" /><button disabled={loading || !input.trim()} className="rounded-xl bg-blue-500 p-3 hover:bg-blue-400 disabled:opacity-50" title="Send message"><Send size={17} /></button></div></form></section>
  </main>;
}
