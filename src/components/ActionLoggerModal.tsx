import React, { useState, useEffect } from 'react';
import { Lead, ContactPerson, ActionType, UserProfile, ActivityLog } from '../types/pipeline';
import { X, Phone, Mail, MapPin, Calendar, Check, Search, Building2, User, Clock } from 'lucide-react';

interface ActionLoggerModalProps {
  initialLead?: Lead | null;
  initialContactIndex?: number;
  initialActionType?: ActionType;
  allLeads: Lead[];
  currentUser: UserProfile;
  onClose: () => void;
  onSaveAction: (
    updatedLead: Lead,
    activityLog: Omit<ActivityLog, 'id' | 'timestamp'>
  ) => void;
}

export const ActionLoggerModal: React.FC<ActionLoggerModalProps> = ({
  initialLead,
  initialContactIndex = 0,
  initialActionType = 'call',
  allLeads,
  currentUser,
  onClose,
  onSaveAction,
}) => {
  // If no initial lead provided, user can search and select an organization
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(!initialLead);

  // Selected contact within the lead
  const [selectedContactIndex, setSelectedContactIndex] = useState<number>(initialContactIndex);
  const [customContactName, setCustomContactName] = useState('');

  // Activity fields
  const [actionType, setActionType] = useState<ActionType>(initialActionType);
  const [outcome, setOutcome] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Next follow-up scheduling
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [nextFollowUpDate, setNextFollowUpDate] = useState(tomorrowStr);
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00');
  const [nextFollowUpType, setNextFollowUpType] = useState<ActionType>('call');

  // Quick preset chips
  const quickOutcomePresets = [
    { label: "Didn't pick up call", nextType: 'call' as ActionType, daysAhead: 1 },
    { label: "Spoke - requested proposal email", nextType: 'email' as ActionType, daysAhead: 1 },
    { label: "Meeting / Demo confirmed", nextType: 'visit' as ActionType, daysAhead: 3 },
    { label: "Left WhatsApp voice note & specs", nextType: 'followup' as ActionType, daysAhead: 2 },
    { label: "In review with procurement committee", nextType: 'call' as ActionType, daysAhead: 5 },
    { label: "Requested price discount / revision", nextType: 'email' as ActionType, daysAhead: 2 },
  ];

  useEffect(() => {
    if (selectedLead) {
      setNewStatus(selectedLead.status);
    }
  }, [selectedLead]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedContactIndex(0);
    setNewStatus(lead.status);
    setIsSearchOpen(false);
  };

  const applyPreset = (preset: typeof quickOutcomePresets[0]) => {
    setOutcome(preset.label);
    setNewStatus(preset.label);
    setNextFollowUpType(preset.nextType);
    const targetDate = new Date(Date.now() + preset.daysAhead * 86400000).toISOString().split('T')[0];
    setNextFollowUpDate(targetDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const contact = selectedLead.contacts[selectedContactIndex] || {
      id: 'custom',
      name: customContactName || 'General Contact',
      position: 'Staff',
      email: '',
      phone: '',
    };

    const finalContactName = customContactName.trim() || contact.name;
    const finalOutcome = outcome.trim() || `${actionType.toUpperCase()} conducted`;

    const updatedLead: Lead = {
      ...selectedLead,
      status: newStatus.trim() || finalOutcome,
      lastFollowUp: new Date().toISOString().split('T')[0],
      nextFollowUp: nextFollowUpDate,
      nextFollowUpTime: nextFollowUpTime,
      nextFollowUpType: nextFollowUpType,
      updatedAt: new Date().toISOString(),
    };

    const activityLog: Omit<ActivityLog, 'id' | 'timestamp'> = {
      leadId: selectedLead.id,
      organizationName: selectedLead.organizationName,
      contactPersonName: finalContactName,
      contactPersonEmail: contact.email,
      contactPersonPhone: contact.phone,
      type: actionType,
      outcome: finalOutcome,
      notes: detailedNotes.trim(),
      performedByEmail: currentUser.email,
      performedByName: currentUser.name,
      nextFollowUpScheduled: nextFollowUpDate,
    };

    onSaveAction(updatedLead, activityLog);
    onClose();
  };

  const filteredOrgs = allLeads.filter(l =>
    l.organizationName.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
    l.contacts.some(c => c.name.toLowerCase().includes(orgSearchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Log Pipeline Action</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record customer outcome, update current status, and set next follow-up
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Select Organization */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Organization
            </label>

            {selectedLead && !isSearchOpen ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedLead.organizationName}</h4>
                    <p className="text-xs text-slate-400">Current Status: {selectedLead.status}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  Change Org
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    placeholder="Search organization or company name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 divide-y divide-slate-800/60">
                  {filteredOrgs.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center">No organizations match search</div>
                  ) : (
                    filteredOrgs.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => handleSelectLead(lead)}
                        className="w-full p-2.5 text-left text-xs hover:bg-slate-800/60 transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold text-white">{lead.organizationName}</span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                          {lead.contacts[0]?.name ? `${lead.contacts[0].name} (${lead.contacts[0].position})` : ''}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Target Contact & Action Type */}
          {selectedLead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contact Person
                </label>
                <select
                  value={selectedContactIndex}
                  onChange={(e) => setSelectedContactIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {selectedLead.contacts.map((c, idx) => (
                    <option key={c.id || idx} value={idx}>
                      {c.name} — {c.position} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Action Executed
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActionType('call')}
                    className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                      actionType === 'call' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('email')}
                    className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                      actionType === 'email' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('visit')}
                    className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                      actionType === 'visit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Visit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('followup')}
                    className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                      actionType === 'followup' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Touch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Outcome Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Quick Result Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickOutcomePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome & Detailed Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Activity Outcome Summary
              </label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g. Sabich didn't pick up call / Spoke to procurement"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                New Pipeline Status For Lead
              </label>
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="This will update the lead's status in the Excel sheet"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Notes & Context (Solutions Discussed, Action Items)
              </label>
              <textarea
                value={detailedNotes}
                onChange={(e) => setDetailedNotes(e.target.value)}
                placeholder="Write specific points discussed, pricing questions, or technical requirements..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Schedule Next Follow-up */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
              Schedule Next Pipeline Touchpoint
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Next Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Target Time
                </label>
                <input
                  type="time"
                  value={nextFollowUpTime}
                  onChange={(e) => setNextFollowUpTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Action Type
                </label>
                <select
                  value={nextFollowUpType}
                  onChange={(e) => setNextFollowUpType(e.target.value as ActionType)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="call">Call Phone</option>
                  <option value="email">Send Email</option>
                  <option value="visit">Client Visit</option>
                  <option value="followup">General Touchpoint</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedLead}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Activity & Update Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
