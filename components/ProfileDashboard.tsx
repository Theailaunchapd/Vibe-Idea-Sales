import React, { useMemo, useState } from 'react';
import type { CrmLead, LeadPriority, LeadStatus, UserProfile } from '../types';
import { Briefcase, Building2, Check, ChevronLeft, Download, ExternalLink, LogOut, Pencil, Search, Tag, Trash2, Twitter } from 'lucide-react';

type SourceFilter = 'all' | 'business' | 'social' | 'job';

function getLeadName(l: CrmLead): string {
  if (l.source === 'business' && l.business) return l.business.name;
  if (l.source === 'social' && l.socialIdea) return l.socialIdea.title;
  if (l.source === 'job' && l.job) return `${l.job.title} at ${l.job.company}`;
  return 'Untitled Lead';
}

function getLeadSubtitle(l: CrmLead): string {
  if (l.source === 'business' && l.business) return `${l.business.industry} • ${l.business.location}`;
  if (l.source === 'social' && l.socialIdea) return `@${l.socialIdea.author} • ${l.socialIdea.category}`;
  if (l.source === 'job' && l.job) return `${l.job.location} • ${l.job.salaryRange || 'Salary N/A'}`;
  return '';
}

function getSourceBadge(source: CrmLead['source']) {
  switch (source) {
    case 'business':
      return { icon: Building2, label: 'Business', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'social':
      return { icon: Twitter, label: 'Social', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'job':
      return { icon: Briefcase, label: 'Job', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    default:
      return { icon: Tag, label: 'Lead', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
}

const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won', 'Lost'];
const PRIORITY_OPTIONS: LeadPriority[] = ['Low', 'Medium', 'High'];

function toCsv(leads: CrmLead[]): string {
  const header = [
    'source',
    'name',
    'subtitle',
    'status',
    'priority',
    'tags',
    'nextFollowUpAt',
    'lastContactedAt',
    'contactEmail',
    'contactPhone',
    'websiteUrl',
    'notes',
    'createdAt',
    'updatedAt',
  ];

  const rows = leads.map((l) => [
    l.source,
    getLeadName(l),
    getLeadSubtitle(l),
    l.status,
    l.priority,
    (l.tags || []).join('|'),
    l.nextFollowUpAt || '',
    l.lastContactedAt || '',
    l.business?.contactEmail || l.socialIdea?.authorHandle || '',
    l.business?.contactPhone || '',
    l.business?.websiteUrl || l.socialIdea?.sourceUrl || l.job?.url || '',
    (l.notes || '').replace(/\r?\n/g, '\\n'),
    l.createdAt,
    l.updatedAt,
  ]);

  const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

function downloadText(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const ProfileDashboard: React.FC<{
  profile: UserProfile;
  leads: CrmLead[];
  onBack: () => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onUpdateLead: (leadId: string, patch: Partial<CrmLead>) => void;
  onDeleteLead: (leadId: string) => void;
}> = ({ profile, leads, onBack, onUpdateProfile, onSignOut, onUpdateLead, onDeleteLead }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftRole, setDraftRole] = useState(profile.role);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => (statusFilter === 'All' ? true : l.status === statusFilter))
      .filter((l) => (sourceFilter === 'all' ? true : l.source === sourceFilter))
      .filter((l) => {
        if (!q) return true;
        const hay = [
          l.business?.name,
          l.business?.industry,
          l.business?.location,
          l.business?.contactEmail,
          l.business?.contactPhone,
          l.socialIdea?.title,
          l.socialIdea?.author,
          l.socialIdea?.description,
          l.job?.title,
          l.job?.company,
          l.job?.location,
          ...(l.tags || []),
          l.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [leads, query, statusFilter, sourceFilter]);

  const selected = useMemo(() => filtered.find((l) => l.id === selectedId) || null, [filtered, selectedId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900">Profile</div>
              <div className="text-xs text-gray-500">Account settings + Saved Leads CRM</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = toCsv(leads);
                downloadText(`vib3_saved_leads_${(profile.name || 'agent').replace(/\s+/g, '_')}.csv`, csv);
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-2"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={onSignOut}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-2"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                  {(profile.avatarInitial || profile.name?.charAt(0) || 'A').toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-bold">{profile.name}</div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">{profile.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDraftName(profile.name);
                  setDraftRole(profile.role);
                  setEditingProfile((v) => !v);
                }}
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
                aria-label="Edit profile"
              >
                <Pencil size={16} />
              </button>
            </div>

            {editingProfile && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Name</label>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Role</label>
                  <input
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={() => {
                    onUpdateProfile({
                      name: draftName.trim() || profile.name,
                      role: draftRole.trim() || profile.role,
                      avatarInitial: (draftName.trim() || profile.name).charAt(0).toUpperCase(),
                    });
                    setEditingProfile(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Save Profile
                </button>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Focus</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.focus || []).map((f) => (
                    <span key={f} className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Services</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.services || []).map((s) => (
                    <span key={s} className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Industries</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.topics || []).map((t) => (
                    <span key={t} className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-sm font-bold mb-3">Saved Leads</div>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-xl font-bold">{leads.length}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xl font-bold text-blue-700">{leads.filter((l) => l.status === 'New').length}</div>
                <div className="text-[10px] uppercase font-bold text-blue-500">New</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="text-xl font-bold text-emerald-700">{leads.filter((l) => l.status === 'Won').length}</div>
                <div className="text-[10px] uppercase font-bold text-emerald-600">Won</div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">By Source</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-orange-50 border border-orange-100">
                <div className="text-lg font-bold text-orange-700">{leads.filter((l) => l.source === 'business').length}</div>
                <div className="text-[9px] uppercase font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Building2 size={10} /> Business
                </div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-lg font-bold text-blue-700">{leads.filter((l) => l.source === 'social').length}</div>
                <div className="text-[9px] uppercase font-bold text-blue-500 flex items-center justify-center gap-1">
                  <Twitter size={10} /> Social
                </div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                <div className="text-lg font-bold text-purple-700">{leads.filter((l) => l.source === 'job').length}</div>
                <div className="text-[9px] uppercase font-bold text-purple-500 flex items-center justify-center gap-1">
                  <Briefcase size={10} /> Jobs
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle: Lead list */}
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search saved leads (name, industry, tags, notes...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700"
              >
                <option value="all">All sources</option>
                <option value="business">Business</option>
                <option value="social">Social</option>
                <option value="job">Job</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700"
              >
                <option value="All">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="font-bold">CRM Pipeline</div>
                <div className="text-xs text-gray-500">{filtered.length} leads</div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No saved leads yet. Save a lead from any search to start tracking.</div>
                ) : (
                  filtered.map((l) => {
                    const badge = getSourceBadge(l.source);
                    const BadgeIcon = badge.icon;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelectedId(l.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedId === l.id ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                                <BadgeIcon size={10} /> {badge.label}
                              </span>
                            </div>
                            <div className="font-bold text-gray-900 truncate">{getLeadName(l)}</div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {getLeadSubtitle(l)}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600">
                                {l.status}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${
                                  l.priority === 'High'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : l.priority === 'Medium'
                                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {l.priority}
                              </span>
                              {(l.tags || []).slice(0, 2).map((t) => (
                                <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 flex items-center gap-1">
                                  <Tag size={10} /> {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-gray-400 uppercase font-bold flex-shrink-0">
                            {l.nextFollowUpAt ? `Follow up: ${l.nextFollowUpAt}` : 'No follow-up'}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Lead details */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="font-bold">Lead Details</div>
                <div className="text-xs text-gray-500">Update status, notes, tags, and follow-up schedule.</div>
              </div>
              {!selected ? (
                <div className="p-6 text-sm text-gray-500">Select a lead on the left to manage it.</div>
              ) : (
                <div className="p-5 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const badge = getSourceBadge(selected.source);
                        const BadgeIcon = badge.icon;
                        return (
                          <span className={`inline-flex text-[10px] uppercase font-bold px-2 py-1 rounded border items-center gap-1 mb-2 ${badge.color}`}>
                            <BadgeIcon size={12} /> {badge.label} Lead
                          </span>
                        );
                      })()}
                      <div className="text-lg font-bold">{getLeadName(selected)}</div>
                      <div className="text-sm text-gray-600">
                        {getLeadSubtitle(selected)}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        {selected.source === 'business' && selected.business && (
                          <>
                            {selected.business.contactEmail && (
                              <div>
                                <span className="font-bold text-gray-700">Email:</span> <span className="select-all">{selected.business.contactEmail}</span>
                              </div>
                            )}
                            {selected.business.contactPhone && (
                              <div>
                                <span className="font-bold text-gray-700">Phone:</span> <span className="select-all">{selected.business.contactPhone}</span>
                              </div>
                            )}
                            {selected.business.websiteUrl && (
                              <div>
                                <span className="font-bold text-gray-700">Website:</span>{' '}
                                <a className="text-blue-600 hover:underline" href={selected.business.websiteUrl} target="_blank" rel="noreferrer">
                                  {selected.business.websiteUrl}
                                </a>
                              </div>
                            )}
                          </>
                        )}
                        {selected.source === 'social' && selected.socialIdea && (
                          <>
                            <div>
                              <span className="font-bold text-gray-700">Author:</span> {selected.socialIdea.authorHandle}
                            </div>
                            <div>
                              <span className="font-bold text-gray-700">Post:</span>{' '}
                              <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href={selected.socialIdea.sourceUrl} target="_blank" rel="noreferrer">
                                View on X.com <ExternalLink size={12} />
                              </a>
                            </div>
                            <div className="mt-2 text-gray-600 text-sm line-clamp-3">{selected.socialIdea.description}</div>
                          </>
                        )}
                        {selected.source === 'job' && selected.job && (
                          <>
                            <div>
                              <span className="font-bold text-gray-700">Company:</span> {selected.job.company}
                            </div>
                            <div>
                              <span className="font-bold text-gray-700">Skills:</span> {selected.job.skills.slice(0, 5).join(', ')}
                            </div>
                            {selected.job.url && (
                              <div>
                                <span className="font-bold text-gray-700">Listing:</span>{' '}
                                <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href={selected.job.url} target="_blank" rel="noreferrer">
                                  View on {selected.job.source} <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onDeleteLead(selected.id);
                        setSelectedId(null);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                      aria-label="Delete lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Status</label>
                      <select
                        value={selected.status}
                        onChange={(e) => onUpdateLead(selected.id, { status: e.target.value as LeadStatus })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Priority</label>
                      <select
                        value={selected.priority}
                        onChange={(e) => onUpdateLead(selected.id, { priority: e.target.value as LeadPriority })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Next follow-up</label>
                      <input
                        type="date"
                        value={(selected.nextFollowUpAt || '').slice(0, 10)}
                        onChange={(e) => onUpdateLead(selected.id, { nextFollowUpAt: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Last contacted</label>
                      <input
                        type="date"
                        value={(selected.lastContactedAt || '').slice(0, 10)}
                        onChange={(e) => onUpdateLead(selected.id, { lastContactedAt: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Tags (comma separated)</label>
                    <input
                      value={(selected.tags || []).join(', ')}
                      onChange={(e) =>
                        onUpdateLead(selected.id, {
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .slice(0, 12),
                        })
                      }
                      placeholder="e.g. urgent, dentist, website"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Notes</label>
                    <textarea
                      value={selected.notes || ''}
                      onChange={(e) => onUpdateLead(selected.id, { notes: e.target.value })}
                      placeholder="Log outreach notes, objections, next steps..."
                      className="w-full min-h-[140px] px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    Updated: <span className="font-mono">{new Date(selected.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

