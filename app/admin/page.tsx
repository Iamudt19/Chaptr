'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LogoWordmark from '@/components/ui/LogoWordmark';
import {
  Mail, CheckCircle, Circle, ArrowLeft, Trash2, RefreshCw,
  Search, Download, Users, FileText, CheckCheck, X,
  MessageSquare, Filter,
} from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface PlatformStats {
  totalUsers: number;
  totalPeople: number;
  totalLogs: number;
}

type FilterTab = 'all' | 'unread' | 'read';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({ totalUsers: 0, totalPeople: 0, totalLogs: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadSubmissions(), loadPlatformStats()]);
  }

  async function loadSubmissions() {
    setLoading(true);
    const { data } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }

  async function loadPlatformStats() {
    setStatsLoading(true);
    const [{ count: people }, { count: logs }] = await Promise.all([
      supabase.from('people').select('*', { count: 'exact', head: true }),
      supabase.from('logs').select('*', { count: 'exact', head: true }),
    ]);
    setPlatformStats({
      totalUsers: 0, // requires service role — shown as N/A
      totalPeople: people ?? 0,
      totalLogs: logs ?? 0,
    });
    setStatsLoading(false);
  }

  async function markRead(id: string, read: boolean) {
    await supabase.from('contact_submissions').update({ read }).eq('id', id);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read } : s)));
    if (selected?.id === id) setSelected((s) => s ? { ...s, read } : s);
  }

  async function markAllRead() {
    setMarkingAll(true);
    const unreadIds = submissions.filter((s) => !s.read).map((s) => s.id);
    if (unreadIds.length > 0) {
      await supabase.from('contact_submissions').update({ read: true }).in('id', unreadIds);
      setSubmissions((prev) => prev.map((s) => ({ ...s, read: true })));
      if (selected) setSelected((s) => s ? { ...s, read: true } : s);
    }
    setMarkingAll(false);
  }

  async function deleteSubmission(id: string) {
    setDeleting(id);
    await supabase.from('contact_submissions').delete().eq('id', id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  }

  function exportCSV() {
    const rows = [
      ['Name', 'Email', 'Message', 'Read', 'Date'],
      ...filteredSubmissions.map((s) => [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.message.replace(/"/g, '""')}"`,
        s.read ? 'Yes' : 'No',
        new Date(s.created_at).toLocaleString('en-IN'),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaptr-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const unread = submissions.filter((s) => !s.read).length;

  const filteredSubmissions = useMemo(() => {
    let list = submissions;
    if (filterTab === 'unread') list = list.filter((s) => !s.read);
    if (filterTab === 'read') list = list.filter((s) => s.read);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [submissions, filterTab, search]);

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: submissions.length },
    { key: 'unread', label: 'Unread', count: unread },
    { key: 'read', label: 'Read', count: submissions.length - unread },
  ];

  return (
    <div className="min-h-screen bg-chaptr-bg text-chaptr-text font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-chaptr-surface border-b border-chaptr-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-chaptr-muted hover:text-chaptr-text transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div className="h-4 w-px bg-chaptr-border" />
          <LogoWordmark heightClass="h-8" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-600/20">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-chaptr-bg border border-chaptr-border rounded-[8px] text-chaptr-muted hover:text-chaptr-text transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Platform stats row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: 'Total messages', value: submissions.length, accent: unread > 0 },
            { icon: Mail, label: 'Unread', value: unread, accent: unread > 0 },
            { icon: Users, label: 'People logged', value: statsLoading ? '…' : platformStats.totalPeople },
            { icon: FileText, label: 'Total logs', value: statsLoading ? '…' : platformStats.totalLogs },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="bg-chaptr-surface border border-chaptr-border rounded-[14px] p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                accent ? 'bg-amber-100/60 dark:bg-amber-950/40' : 'bg-chaptr-bg border border-chaptr-border'
              }`}>
                <Icon size={16} className={accent ? 'text-amber-600 dark:text-amber-400' : 'text-chaptr-muted'} />
              </div>
              <div>
                <p className={`text-2xl font-black ${accent ? 'text-amber-500' : 'text-chaptr-text'}`}>{value}</p>
                <p className="text-[10px] text-chaptr-muted uppercase tracking-wider font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Inbox + detail ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left — inbox */}
          <div className="lg:col-span-2 bg-chaptr-surface border border-chaptr-border rounded-[14px] flex flex-col overflow-hidden">

            {/* Inbox header */}
            <div className="px-4 pt-4 pb-3 border-b border-chaptr-border space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-chaptr-text flex items-center gap-2">
                  <Mail size={14} className="text-amber-500" /> Contact Inbox
                </h2>
                <div className="flex items-center gap-1.5">
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      disabled={markingAll}
                      className="flex items-center gap-1 text-[10px] font-semibold text-chaptr-muted hover:text-chaptr-text transition-colors disabled:opacity-50"
                      title="Mark all as read"
                    >
                      <CheckCheck size={12} />
                      {markingAll ? 'Marking…' : 'All read'}
                    </button>
                  )}
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1 text-[10px] font-semibold text-chaptr-muted hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="Export as CSV"
                  >
                    <Download size={12} /> CSV
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-chaptr-faint" />
                <input
                  type="text"
                  placeholder="Search name, email, message…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs bg-chaptr-bg border border-chaptr-border rounded-[8px] text-chaptr-text placeholder:text-chaptr-faint focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X size={11} className="text-chaptr-faint hover:text-chaptr-text" />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold rounded-[6px] transition-colors ${
                      filterTab === tab.key
                        ? 'bg-amber-500 text-white'
                        : 'bg-chaptr-bg border border-chaptr-border text-chaptr-muted hover:text-chaptr-text'
                    }`}
                  >
                    <Filter size={9} /> {tab.label}
                    <span className={`ml-0.5 ${filterTab === tab.key ? 'text-white/80' : 'text-chaptr-faint'}`}>
                      ({tab.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inbox list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-4 h-4 border-2 border-chaptr-text border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Mail size={28} className="text-chaptr-faint mb-3" />
                <p className="text-sm font-semibold text-chaptr-text">
                  {search ? 'No results found' : 'No submissions yet'}
                </p>
                <p className="text-xs text-chaptr-muted mt-1">
                  {search ? 'Try a different search term.' : 'Contact form messages will appear here.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-chaptr-border/60 overflow-y-auto flex-1 max-h-[520px]">
                {filteredSubmissions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelected(s);
                      if (!s.read) markRead(s.id, true);
                    }}
                    className={`w-full text-left px-4 py-3.5 hover:bg-chaptr-bg/50 transition-colors relative ${
                      selected?.id === s.id ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {s.read
                        ? <CheckCircle size={13} className="text-chaptr-faint mt-0.5 flex-shrink-0" />
                        : <Circle size={13} className="text-amber-500 mt-0.5 flex-shrink-0 fill-amber-500" />
                      }
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-sm font-semibold truncate ${s.read ? 'text-chaptr-muted' : 'text-chaptr-text'}`}>
                            {s.name}
                          </p>
                          <span className="text-[10px] text-chaptr-faint flex-shrink-0">{timeAgo(s.created_at)}</span>
                        </div>
                        <p className="text-xs text-chaptr-faint truncate">{s.email}</p>
                        <p className="text-xs text-chaptr-muted mt-1 line-clamp-2 leading-relaxed">{s.message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — detail pane */}
          <div className="lg:col-span-3 bg-chaptr-surface border border-chaptr-border rounded-[14px] overflow-hidden flex flex-col">
            {selected ? (
              <>
                {/* Detail header */}
                <div className="px-6 py-4 border-b border-chaptr-border flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-chaptr-text">{selected.name}</h3>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => markRead(selected.id, !selected.read)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-chaptr-bg border border-chaptr-border rounded-[8px] text-chaptr-muted hover:text-chaptr-text transition-colors"
                    >
                      {selected.read ? <><Circle size={12} /> Unread</> : <><CheckCircle size={12} /> Read</>}
                    </button>
                    <button
                      onClick={() => deleteSubmission(selected.id)}
                      disabled={deleting === selected.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-[8px] text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {deleting === selected.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="px-6 pt-4 flex items-center gap-3">
                  <span className="text-xs text-chaptr-faint">
                    {new Date(selected.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selected.read
                      ? 'bg-chaptr-border/50 text-chaptr-muted'
                      : 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  }`}>
                    {selected.read ? 'Read' : 'Unread'}
                  </span>
                </div>

                {/* Message body */}
                <div className="flex-1 px-6 py-4">
                  <div className="bg-chaptr-bg/50 border border-chaptr-border/60 rounded-[12px] p-5 h-full min-h-[160px]">
                    <p className="text-sm text-chaptr-text leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex items-center gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your message to Chaptr`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 btn-chaptr-primary text-xs font-bold rounded-[8px]"
                  >
                    <Mail size={13} /> Reply via Email
                  </a>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your message to Chaptr&body=Hi ${encodeURIComponent(selected.name)},%0A%0A`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-chaptr-bg border border-chaptr-border text-chaptr-muted text-xs font-semibold rounded-[8px] hover:text-chaptr-text transition-colors"
                  >
                    Open in Mail app
                  </a>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-chaptr-bg border border-chaptr-border flex items-center justify-center mb-4">
                  <Mail size={24} className="text-chaptr-faint" />
                </div>
                <p className="text-sm font-semibold text-chaptr-text">Select a message</p>
                <p className="text-xs text-chaptr-muted mt-1 max-w-xs">
                  Click any submission on the left to read the full message here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Platform overview ────────────────────────────────────────────── */}
        <div className="bg-chaptr-surface border border-chaptr-border rounded-[14px] p-6">
          <h2 className="text-sm font-bold text-chaptr-text mb-4 flex items-center gap-2">
            <Users size={14} className="text-amber-500" /> Platform Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total contacts received', value: submissions.length, desc: 'via landing page form' },
              { label: 'Total people chapters', value: statsLoading ? '…' : platformStats.totalPeople, desc: 'across all user accounts' },
              { label: 'Total interaction logs', value: statsLoading ? '…' : platformStats.totalLogs, desc: 'across all user accounts' },
              { label: 'Response rate', value: `${submissions.length > 0 ? Math.round(((submissions.length - unread) / submissions.length) * 100) : 0}%`, desc: 'messages marked as read' },
              { label: 'Pending replies', value: unread, desc: 'unread contact messages', highlight: unread > 0 },
              { label: 'Avg message length', value: submissions.length > 0 ? `${Math.round(submissions.reduce((acc, s) => acc + s.message.length, 0) / submissions.length)} chars` : '—', desc: 'per contact submission' },
            ].map(({ label, value, desc, highlight }) => (
              <div key={label} className="bg-chaptr-bg/40 border border-chaptr-border/60 rounded-[10px] p-4">
                <p className={`text-xl font-black ${highlight ? 'text-amber-500' : 'text-chaptr-text'}`}>{value}</p>
                <p className="text-xs font-semibold text-chaptr-text mt-0.5">{label}</p>
                <p className="text-[10px] text-chaptr-faint mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
