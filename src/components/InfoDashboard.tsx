import React from 'react';
import { UserProfile, KPISummary, RepWeeklyStats, Lead, ActionType } from '../types/pipeline';
import { CheckCircle2, Phone, Mail, MapPin, Calendar, Plus, History, ArrowRight, TrendingUp, Sparkles, Building2, User } from 'lucide-react';

interface InfoDashboardProps {
  currentUser: UserProfile;
  kpis: KPISummary;
  weeklyStats: RepWeeklyStats;
  todayLeads: Lead[];
  onOpenKPIDrilldown: (kpiType: 'all' | 'followup' | 'call' | 'email' | 'visit') => void;
  onOpenNewAction: () => void;
  onOpenNewLead: () => void;
  onOpenHistory: () => void;
  onQuickCall: (lead: Lead) => void;
  onQuickEmail: (lead: Lead) => void;
}

export const InfoDashboard: React.FC<InfoDashboardProps> = ({
  currentUser,
  kpis,
  weeklyStats,
  todayLeads,
  onOpenKPIDrilldown,
  onOpenNewAction,
  onOpenNewLead,
  onOpenHistory,
  onQuickCall,
  onQuickEmail,
}) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Enterprise Pipeline Hub</span>
            <span aria-hidden="true">·</span>
            <span>{todayStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here are your priority pipeline tasks and customer follow-ups scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenKPIDrilldown('all')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Review Today's Queue ({kpis.totalTasksToday})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 KPI KEYS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daily Execution KPIs (Today)
          </h2>
          <span className="text-xs text-slate-500">
            Click any KPI card to view & act on schedule
          </span>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: Tasks To Be Done Today (Sum of 2+3+4+5) */}
          <div
            onClick={() => onOpenKPIDrilldown('all')}
            className="p-5 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-blue-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                1. Total Tasks Today
              </span>
              <CheckCircle2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
              {kpis.totalTasksToday}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sum of calls, emails, visits & follow-ups
            </p>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (weeklyStats.totalActivities / Math.max(1, kpis.totalTasksToday + weeklyStats.totalActivities)) * 100)}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Follow-ups To Do Today */}
          <div
            onClick={() => onOpenKPIDrilldown('followup')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. Follow-ups Today
              </span>
              <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
              {kpis.followUpsToday}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              General date reminders & touchpoints
            </p>
          </div>

          {/* KPI 3: Calls To Be Made */}
          <div
            onClick={() => onOpenKPIDrilldown('call')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                3. Calls To Make
              </span>
              <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
              {kpis.callsToday}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Direct phone contacts & voicemails
            </p>
          </div>

          {/* KPI 4: Emails To Be Made */}
          <div
            onClick={() => onOpenKPIDrilldown('email')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-sky-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                4. Emails To Send
              </span>
              <Mail className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
              {kpis.emailsToday}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Proposals, quotes & technical specs
            </p>
          </div>

          {/* KPI 5: Visits To Be Made */}
          <div
            onClick={() => onOpenKPIDrilldown('visit')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-purple-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                5. Visits To Make
              </span>
              <MapPin className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
              {kpis.visitsToday}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              On-site client & facility walkthroughs
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD ACTION CONTROLS UNDER KPI KEYS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Pipeline Action Station
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Initiate customer actions, capture new commercial accounts, or audit completed logs
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. New Action Button */}
            <button
              onClick={onOpenNewAction}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Action (Search Org)</span>
            </button>

            {/* 2. New Lead Button */}
            <button
              onClick={onOpenNewLead}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Lead</span>
            </button>

            {/* 3. Completed History Button */}
            <button
              onClick={onOpenHistory}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Completed History</span>
            </button>
          </div>
        </div>

        {/* Quick today snapshot list */}
        {todayLeads.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Priority Immediate Actions ({todayLeads.slice(0, 3).length} of {todayLeads.length})
              </span>
              <button
                onClick={() => onOpenKPIDrilldown('all')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                View all in structured queue →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {todayLeads.slice(0, 3).map((lead) => {
                const primaryContact = lead.contacts[0];
                return (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white truncate max-w-[180px]">
                          {lead.organizationName}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {lead.nextFollowUpTime || 'Today'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-1">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{primaryContact ? `${primaryContact.name} (${primaryContact.position})` : 'Contact Pending'}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {lead.status}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {lead.nextFollowUpType || 'followup'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {primaryContact?.phone && (
                          <button
                            onClick={() => onQuickCall(lead)}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                        )}
                        {primaryContact?.email && (
                          <button
                            onClick={() => onQuickEmail(lead)}
                            className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PERSONAL WEEKLY PROGRESS & PERFORMANCE INDEX */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Personal Progress Index — {currentUser.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time activity volume and pipeline execution pace for this week
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Weekly Velocity Index
              </span>
              <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
                {weeklyStats.performanceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Performance Counter Strips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Calls Done This Week</span>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {weeklyStats.callsThisWeek}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Phone touchpoints logged</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Emails Sent This Week</span>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {weeklyStats.emailsThisWeek}
            </div>
            <span className="text-[11px] text-sky-400 mt-1 block">Proposals & follow-ups</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Client Visits Done</span>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {weeklyStats.visitsThisWeek}
            </div>
            <span className="text-[11px] text-purple-400 mt-1 block">On-site demonstrations</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Follow-ups Closed</span>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {weeklyStats.followUpsThisWeek}
            </div>
            <span className="text-[11px] text-amber-400 mt-1 block">Pipeline touches updated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
