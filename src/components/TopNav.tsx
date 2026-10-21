import React from 'react';
import { UserProfile } from '../types/pipeline';
import { Building2, LayoutDashboard, Table2, ShieldAlert, Users, Plus, LogOut, Download } from 'lucide-react';

interface TopNavProps {
  currentUser: UserProfile;
  activeTab: 'info' | 'leads' | 'observer' | 'team';
  onSelectTab: (tab: 'info' | 'leads' | 'observer' | 'team') => void;
  onOpenNewAction: () => void;
  onOpenNewLead: () => void;
  onExportExcel: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenNewAction,
  onOpenNewLead,
  onExportExcel,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isObserver = currentUser.role === 'observer';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                  Pipeline Tracker
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  isObserver ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                {currentUser.name} ({currentUser.email})
              </p>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={() => onSelectTab('info')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Info Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('leads')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'leads'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span>Leads (Sheets)</span>
            </button>

            {(isAdmin || isObserver) && (
              <button
                onClick={() => onSelectTab('observer')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'observer'
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                    : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Observer Cockpit</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onSelectTab('team')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'team'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team & Access</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewAction}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Log call, email, or client interaction"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action</span>
            </button>

            <button
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </button>

            <button
              onClick={onExportExcel}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Export complete pipeline workbook (.xlsx)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign out of work account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-900/95">
        <button
          onClick={() => onSelectTab('info')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === 'info' ? 'text-blue-400 bg-blue-950/40' : 'text-slate-400'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => onSelectTab('leads')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === 'leads' ? 'text-blue-400 bg-blue-950/40' : 'text-slate-400'
          }`}
        >
          Leads
        </button>
        {(isAdmin || isObserver) && (
          <button
            onClick={() => onSelectTab('observer')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              activeTab === 'observer' ? 'text-purple-400 bg-purple-950/40' : 'text-slate-400'
            }`}
          >
            Observer
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('team')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              activeTab === 'team' ? 'text-blue-400 bg-blue-950/40' : 'text-slate-400'
            }`}
          >
            Team
          </button>
        )}
      </div>
    </header>
  );
};
