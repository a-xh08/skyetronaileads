import React, { useState, useEffect } from 'react';
import { UserProfile, Lead, SheetCategory, ActivityLog, ActionType } from './types/pipeline';
import {
  loadUsers,
  saveUsers,
  loadSheets,
  saveSheets,
  loadLeads,
  saveLeads,
  loadActivities,
  saveActivities,
  loadCurrentUser,
  saveCurrentUser,
  calculateKPISummary,
  calculatePersonalWeeklyStats,
} from './utils/storage';
import { exportPipelineToExcel } from './utils/excelHelper';

import { AuthScreen } from './components/AuthScreen';
import { TopNav } from './components/TopNav';
import { InfoDashboard } from './components/InfoDashboard';
import { LeadsSheetHub } from './components/LeadsSheetHub';
import { ObserverCockpit } from './components/ObserverCockpit';
import { KPITasksModal } from './components/KPITasksModal';
import { ActionLoggerModal } from './components/ActionLoggerModal';
import { AddLeadModal } from './components/AddLeadModal';
import { CompletedHistoryDrawer } from './components/CompletedHistoryDrawer';
import { TeamManagementModal } from './components/TeamManagementModal';

export default function App() {
  // State stores
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsers());
  const [sheets, setSheets] = useState<SheetCategory[]>(() => loadSheets());
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads());
  const [activities, setActivities] = useState<ActivityLog[]>(() => loadActivities());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadCurrentUser());

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'info' | 'leads' | 'observer' | 'team'>('info');
  const [activeSheetId, setActiveSheetId] = useState<string>(() => sheets[0]?.id || 'sheet-uae');

  // Modal states
  const [isKPIDrilldownOpen, setIsKPIDrilldownOpen] = useState(false);
  const [kpiDrilldownType, setKpiDrilldownType] = useState<'all' | 'followup' | 'call' | 'email' | 'visit'>('all');

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionLead, setActionLead] = useState<Lead | null>(null);
  const [actionContactIdx, setActionContactIdx] = useState<number>(0);
  const [actionType, setActionType] = useState<ActionType>('call');

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [addLeadSheetId, setAddLeadSheetId] = useState<string>(activeSheetId);

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Sync to storage on change
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveSheets(sheets);
  }, [sheets]);

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Auth handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    // If observer, default to observer cockpit; otherwise info dashboard
    if (user.role === 'observer') {
      setActiveTab('observer');
    } else {
      setActiveTab('info');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddUser = (user: UserProfile) => {
    setUsers((prev) => [...prev, user]);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Lead handlers
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const handleAddSheet = (name: string) => {
    const newSheet: SheetCategory = {
      id: `sheet-${Date.now()}`,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      color: '#6366F1',
      order: sheets.length + 1,
    };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleImportLeads = (newLeads: Lead[], newSheets: SheetCategory[]) => {
    if (newSheets.length > 0) {
      setSheets((prev) => [...prev, ...newSheets]);
    }
    setLeads((prev) => [...newLeads, ...prev]);
    alert(`Successfully imported ${newLeads.length} leads across sheets.`);
  };

  // Quick Action execution (Call Now / Email Now / Log Action)
  const triggerQuickCall = (lead: Lead, contactIdx: number = 0) => {
    const contact = lead.contacts[contactIdx];
    if (contact?.phone) {
      // Initiate telephone link
      window.location.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
    }
    // Open action logger pre-filled
    setActionLead(lead);
    setActionContactIdx(contactIdx);
    setActionType('call');
    setIsActionModalOpen(true);
  };

  const triggerQuickEmail = (lead: Lead, contactIdx: number = 0) => {
    const contact = lead.contacts[contactIdx];
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
    }
    setActionLead(lead);
    setActionContactIdx(contactIdx);
    setActionType('email');
    setIsActionModalOpen(true);
  };

  const triggerOpenActionModal = (lead: Lead, contactIdx: number = 0, type: ActionType = 'call') => {
    setActionLead(lead);
    setActionContactIdx(contactIdx);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  // Generic New Action from Dashboard (searchable org)
  const openGenericNewAction = () => {
    setActionLead(null);
    setActionContactIdx(0);
    setActionType('call');
    setIsActionModalOpen(true);
  };

  const handleSaveAction = (
    updatedLead: Lead,
    activityData: Omit<ActivityLog, 'id' | 'timestamp'>
  ) => {
    // 1. Update lead in state
    handleUpdateLead(updatedLead);

    // 2. Add activity log
    const newLog: ActivityLog = {
      ...activityData,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newLog, ...prev]);
  };

  // Navigation tab switcher
  const handleSelectTab = (tab: 'info' | 'leads' | 'observer' | 'team') => {
    if (tab === 'team') {
      setIsTeamModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Drilldown
  const handleOpenKPIDrilldown = (type: 'all' | 'followup' | 'call' | 'email' | 'visit') => {
    setKpiDrilldownType(type);
    setIsKPIDrilldownOpen(true);
  };

  // If not logged in, show AuthScreen
  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        onLogin={handleLogin}
        onAddUser={handleAddUser}
      />
    );
  }

  // Calculated metrics
  const kpis = calculateKPISummary(leads, currentUser.email, currentUser.role);
  const personalWeeklyStats = calculatePersonalWeeklyStats(activities, currentUser.email);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLeads = leads.filter((l) => l.nextFollowUp === todayStr);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Header */}
      <TopNav
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewAction={openGenericNewAction}
        onOpenNewLead={() => {
          setAddLeadSheetId(activeSheetId);
          setIsAddLeadModalOpen(true);
        }}
        onExportExcel={() => exportPipelineToExcel(leads, sheets)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'info' && (
          <InfoDashboard
            currentUser={currentUser}
            kpis={kpis}
            weeklyStats={personalWeeklyStats}
            todayLeads={todayLeads}
            onOpenKPIDrilldown={handleOpenKPIDrilldown}
            onOpenNewAction={openGenericNewAction}
            onOpenNewLead={() => {
              setAddLeadSheetId(activeSheetId);
              setIsAddLeadModalOpen(true);
            }}
            onOpenHistory={() => setIsHistoryDrawerOpen(true)}
            onQuickCall={(lead) => triggerQuickCall(lead, 0)}
            onQuickEmail={(lead) => triggerQuickEmail(lead, 0)}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsSheetHub
            sheets={sheets}
            leads={leads}
            users={users}
            currentUser={currentUser}
            activeSheetId={activeSheetId}
            onSelectSheet={setActiveSheetId}
            onAddSheet={handleAddSheet}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onOpenAddLeadModal={(sheetId) => {
              setAddLeadSheetId(sheetId);
              setIsAddLeadModalOpen(true);
            }}
            onOpenActionModal={triggerOpenActionModal}
            onImportLeads={handleImportLeads}
          />
        )}

        {activeTab === 'observer' && (
          <ObserverCockpit
            currentUser={currentUser}
            users={users}
            leads={leads}
            sheets={sheets}
            activities={activities}
          />
        )}
      </main>

      {/* Modals & Drawers */}

      {/* 1. KPI Drilldown Modal */}
      {isKPIDrilldownOpen && (
        <KPITasksModal
          initialType={kpiDrilldownType}
          leads={leads}
          sheets={sheets}
          onClose={() => setIsKPIDrilldownOpen(false)}
          onCallNow={(lead, idx) => {
            setIsKPIDrilldownOpen(false);
            triggerQuickCall(lead, idx || 0);
          }}
          onEmailNow={(lead, idx) => {
            setIsKPIDrilldownOpen(false);
            triggerQuickEmail(lead, idx || 0);
          }}
          onLogActivity={(lead, idx) => {
            setIsKPIDrilldownOpen(false);
            triggerOpenActionModal(lead, idx || 0, 'followup');
          }}
        />
      )}

      {/* 2. Action Logger Modal (Handles Call Now, Email Now, or New Action with Search) */}
      {isActionModalOpen && (
        <ActionLoggerModal
          initialLead={actionLead}
          initialContactIndex={actionContactIdx}
          initialActionType={actionType}
          allLeads={leads}
          currentUser={currentUser}
          onClose={() => {
            setIsActionModalOpen(false);
            setActionLead(null);
          }}
          onSaveAction={handleSaveAction}
        />
      )}

      {/* 3. Add Lead Modal */}
      {isAddLeadModalOpen && (
        <AddLeadModal
          sheets={sheets}
          currentSheetId={addLeadSheetId}
          users={users}
          currentUser={currentUser}
          onClose={() => setIsAddLeadModalOpen(false)}
          onAddLead={handleAddLead}
        />
      )}

      {/* 4. Completed History Drawer */}
      {isHistoryDrawerOpen && (
        <CompletedHistoryDrawer
          activities={activities}
          users={users}
          onClose={() => setIsHistoryDrawerOpen(false)}
        />
      )}

      {/* 5. Team & Access Modal (Admin only) */}
      {isTeamModalOpen && (
        <TeamManagementModal
          users={users}
          sheets={sheets}
          currentUser={currentUser}
          onClose={() => setIsTeamModalOpen(false)}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );
}
