import React from 'react';
import { UserProfile, Lead, SheetCategory, ActivityLog } from '../types/pipeline';
import { calculateTeamLeaderboard } from '../utils/storage';
import { ShieldCheck, TrendingUp, Phone, Mail, MapPin, Calendar, Clock, AlertTriangle, Building2, User, Award } from 'lucide-react';

interface ObserverCockpitProps {
  currentUser: UserProfile;
  users: UserProfile[];
  leads: Lead[];
  sheets: SheetCategory[];
  activities: ActivityLog[];
}

export const ObserverCockpit: React.FC<ObserverCockpitProps> = ({
  currentUser,
  users,
  leads,
  sheets,
  activities,
}) => {
  const leaderboard = calculateTeamLeaderboard(activities, users);

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueLeads = leads.filter(l => l.nextFollowUp && l.nextFollowUp < todayStr);

  const totalCallsThisWeek = leaderboard.reduce((acc, r) => acc + r.callsThisWeek, 0);
  const totalEmailsThisWeek = leaderboard.reduce((acc, r) => acc + r.emailsThisWeek, 0);
  const totalVisitsThisWeek = leaderboard.reduce((acc, r) => acc + r.visitsThisWeek, 0);
  const totalActivitiesThisWeek = leaderboard.reduce((acc, r) => acc + r.totalActivities, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Oversight & Performance Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Company Sales & Pipeline Velocity
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of team member output, follow-up consistency, and commercial pipeline volume.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs">
          <span>Observer: {currentUser.name} ({currentUser.email})</span>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Team Activities This Week
          </span>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-2">
            {totalActivitiesThisWeek}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span>{totalCallsThisWeek} calls</span>
            <span>·</span>
            <span>{totalEmailsThisWeek} emails</span>
            <span>·</span>
            <span>{totalVisitsThisWeek} visits</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Active Commercial Accounts
          </span>
          <div className="text-3xl font-bold text-blue-400 font-mono tabular-nums mt-2">
            {leads.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {sheets.length} specialized pipeline categories
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Overdue Follow-ups
          </span>
          <div className={`text-3xl font-bold font-mono tabular-nums mt-2 ${
            overdueLeads.length > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {overdueLeads.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {overdueLeads.length > 0 ? 'Accounts requiring immediate rep touch' : 'Zero overdue pipeline accounts'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Team Velocity Index
          </span>
          <div className="text-3xl font-bold text-purple-400 font-mono tabular-nums mt-2">
            {Math.round(leaderboard.reduce((a, b) => a + b.performanceScore, 0) / Math.max(1, leaderboard.length))}%
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Aggregate activity vs company target
          </p>
        </div>
      </div>

      {/* TEAM MEMBER PERFORMANCE INDEX TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Sales Team Performance Leaderboard (This Week)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live score and work output comparison per sales representative and admin
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Team Member</th>
                <th className="py-3 px-4 text-center">Calls Done</th>
                <th className="py-3 px-4 text-center">Emails Sent</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4 text-center">Follow-ups</th>
                <th className="py-3 px-4 text-center">Total Volume</th>
                <th className="py-3 px-5 min-w-[180px]">Performance Index</th>
                <th className="py-3 px-5 text-right">Last Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((rep, idx) => (
                <tr key={rep.email} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-300 font-semibold flex items-center justify-center shrink-0">
                        {rep.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{rep.name}</span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{rep.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-400 tabular-nums">
                    {rep.callsThisWeek}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-sky-400 tabular-nums">
                    {rep.emailsThisWeek}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-purple-400 tabular-nums">
                    {rep.visitsThisWeek}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-amber-400 tabular-nums">
                    {rep.followUpsThisWeek}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white tabular-nums">
                    {rep.totalActivities}
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-purple-300 font-bold tabular-nums">
                          {rep.performanceScore}%
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {rep.totalActivities}/20 weekly goal
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, rep.performanceScore)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400 tabular-nums">
                    {new Date(rep.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIPELINE CATEGORY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Lead Distribution Across 14 Sheets
          </h3>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
            {sheets.map((sheet) => {
              const count = leads.filter(l => l.sheetId === sheet.id).length;
              const percent = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;

              return (
                <div key={sheet.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sheet.color }} />
                    <span className="text-slate-300 truncate">{sheet.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                    <span className="text-white font-medium">{count} leads</span>
                    <span className="text-slate-500 w-9 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Audit Feed */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Recent Team Actions Stream
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500">No actions recorded yet.</p>
            ) : (
              activities.slice(0, 6).map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{act.organizationName}</span>
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    <span className="text-blue-400 font-medium">{act.performedByName}</span>
                    <span className="mx-1">logged</span>
                    <span className="uppercase text-[10px] font-mono font-semibold text-slate-300">{act.type}</span>
                    <span className="mx-1">→</span>
                    <span className="text-slate-300">{act.outcome}</span>
                  </div>
                  {act.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{act.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
