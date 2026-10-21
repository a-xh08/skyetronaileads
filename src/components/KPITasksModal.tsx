import React, { useState } from 'react';
import { Lead, SheetCategory, ActionType } from '../types/pipeline';
import { X, Phone, Mail, MapPin, Calendar, Clock, Building2, User, ChevronRight, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface KPITasksModalProps {
  initialType: 'all' | 'followup' | 'call' | 'email' | 'visit';
  leads: Lead[];
  sheets: SheetCategory[];
  onClose: () => void;
  onCallNow: (lead: Lead, contactIndex?: number) => void;
  onEmailNow: (lead: Lead, contactIndex?: number) => void;
  onLogActivity: (lead: Lead, contactIndex?: number) => void;
}

export const KPITasksModal: React.FC<KPITasksModalProps> = ({
  initialType,
  leads,
  sheets,
  onClose,
  onCallNow,
  onEmailNow,
  onLogActivity,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'followup' | 'call' | 'email' | 'visit'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLeads = leads.filter(l => l.nextFollowUp === todayStr);

  const filteredLeads = todayLeads.filter(l => {
    // Type filtering
    if (activeFilter === 'call' && l.nextFollowUpType !== 'call') return false;
    if (activeFilter === 'email' && l.nextFollowUpType !== 'email') return false;
    if (activeFilter === 'visit' && l.nextFollowUpType !== 'visit') return false;
    if (activeFilter === 'followup' && (l.nextFollowUpType && l.nextFollowUpType !== 'followup')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrg = l.organizationName.toLowerCase().includes(q);
      const matchStatus = l.status.toLowerCase().includes(q);
      const matchNote = l.note.toLowerCase().includes(q);
      const matchContact = l.contacts.some(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q)
      );
      return matchOrg || matchStatus || matchNote || matchContact;
    }

    return true;
  });

  const getSheetName = (sheetId: string) => {
    const s = sheets.find(sheet => sheet.id === sheetId);
    return s?.name || 'General';
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'call': return 'Calls Scheduled For Today';
      case 'email': return 'Emails To Send Today';
      case 'visit': return 'Client Visits Scheduled Today';
      case 'followup': return 'General Follow-ups Due Today';
      default: return "All Tasks & Follow-ups To Do Today";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Pre-Designed Execution Queue</span>
              <span aria-hidden="true">·</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{getFilterTitle()}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono tabular-nums">
                {filteredLeads.length}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and search bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Today ({todayLeads.length})
            </button>
            <button
              onClick={() => setActiveFilter('call')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === 'call' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calls ({todayLeads.filter(l => l.nextFollowUpType === 'call').length})
            </button>
            <button
              onClick={() => setActiveFilter('email')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === 'email' ? 'bg-sky-950/60 text-sky-300 border border-sky-800/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Emails ({todayLeads.filter(l => l.nextFollowUpType === 'email').length})
            </button>
            <button
              onClick={() => setActiveFilter('visit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === 'visit' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visits ({todayLeads.filter(l => l.nextFollowUpType === 'visit').length})
            </button>
            <button
              onClick={() => setActiveFilter('followup')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === 'followup' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Follow-ups ({todayLeads.filter(l => !l.nextFollowUpType || l.nextFollowUpType === 'followup').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search org, person, or phone..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All clear for this task queue</p>
              <p className="text-xs text-slate-500 mt-1">No items found matching the selected KPI filter for today.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const primaryContact = lead.contacts[0];
              const sheetName = getSheetName(lead.sheetId);

              return (
                <div
                  key={lead.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition space-y-4"
                >
                  {/* Top Bar: Organization & Sheet */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {lead.organizationName}
                          </h3>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {sheetName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Scheduled: <strong className="text-slate-200 font-mono tabular-nums">{lead.nextFollowUpTime || 'Today'}</strong></span>
                          <span>·</span>
                          <span>Assigned: {lead.assignedToEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {primaryContact?.phone && (
                        <button
                          onClick={() => onCallNow(lead, 0)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          title="Call phone number and log outcome"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Now</span>
                        </button>
                      )}

                      {primaryContact?.email && (
                        <button
                          onClick={() => onEmailNow(lead, 0)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          title="Send email and log outcome"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => onLogActivity(lead, 0)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Update Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Contact Cards */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Target Contacts ({lead.contacts.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {lead.contacts.map((contact, idx) => (
                        <div
                          key={contact.id || idx}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>{contact.name}</span>
                              {contact.isPrimary && (
                                <span className="text-[10px] text-blue-400 font-normal">Primary</span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] mt-0.5">{contact.position}</div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                            {contact.phone && (
                              <div className="flex items-center justify-between text-slate-300 font-mono tabular-nums text-[11px]">
                                <span>{contact.phone}</span>
                                <button
                                  onClick={() => onCallNow(lead, idx)}
                                  className="text-emerald-400 hover:text-emerald-300 text-[11px] underline ml-2"
                                >
                                  Call
                                </button>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center justify-between text-slate-400 text-[11px] truncate">
                                <span className="truncate">{contact.email}</span>
                                <button
                                  onClick={() => onEmailNow(lead, idx)}
                                  className="text-sky-400 hover:text-sky-300 text-[11px] underline ml-2 shrink-0"
                                >
                                  Email
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status & Context Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Current Status</span>
                      <p className="text-amber-300">{lead.status || 'No status noted'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Products / Solution Offered</span>
                      <p className="text-slate-300">{lead.note || 'General exploration'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tip: Clicking "Call Now" triggers your device dialer and instantly presents the activity logger.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
};
