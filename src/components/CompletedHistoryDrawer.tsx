import React, { useState } from 'react';
import { ActivityLog, UserProfile, ActionType } from '../types/pipeline';
import { X, History, Phone, Mail, MapPin, Calendar, Search, Filter, Building2, User } from 'lucide-react';

interface CompletedHistoryDrawerProps {
  activities: ActivityLog[];
  users: UserProfile[];
  onClose: () => void;
}

export const CompletedHistoryDrawer: React.FC<CompletedHistoryDrawerProps> = ({
  activities,
  users,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = activities.filter((act) => {
    if (filterType !== 'all' && act.type !== filterType) return false;
    if (filterUser !== 'all' && act.performedByEmail !== filterUser) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrg = act.organizationName.toLowerCase().includes(q);
      const matchContact = act.contactPersonName.toLowerCase().includes(q);
      const matchOutcome = act.outcome.toLowerCase().includes(q);
      const matchNotes = act.notes.toLowerCase().includes(q);
      return matchOrg || matchContact || matchOutcome || matchNotes;
    }

    return true;
  });

  const getActionBadge = (type: ActionType) => {
    switch (type) {
      case 'call':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
            <Mail className="w-3 h-3" />
            <span>Email</span>
          </span>
        );
      case 'visit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
            <MapPin className="w-3 h-3" />
            <span>Visit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Calendar className="w-3 h-3" />
            <span>Touch</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <span>Completed Pipeline History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of customer calls, emails, visits, and outcome notes
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by org, contact, or notes..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="all">All Action Types</option>
              <option value="call">Calls Only</option>
              <option value="email">Emails Only</option>
              <option value="visit">Visits Only</option>
              <option value="followup">Follow-ups Only</option>
            </select>

            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="all">All Team Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name}
                </option>
              ))}
            </select>

            <span className="ml-auto text-slate-500 font-mono text-[11px] tabular-nums">
              {filtered.length} logs
            </span>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No activity logs match your filter criteria.
            </div>
          ) : (
            filtered.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">
                    {act.organizationName}
                  </span>
                  {getActionBadge(act.type)}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{act.contactPersonName}</span>
                  {act.contactPersonPhone && (
                    <>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-300">{act.contactPersonPhone}</span>
                    </>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">
                    Outcome: <span className="text-amber-300 font-normal">{act.outcome}</span>
                  </div>
                  {act.notes && (
                    <div className="text-slate-400 mt-1 italic">
                      "{act.notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Logged by {act.performedByName}</span>
                  <span className="tabular-nums">
                    {new Date(act.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
