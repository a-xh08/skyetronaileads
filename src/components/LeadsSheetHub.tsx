import React, { useState, useRef } from 'react';
import { Lead, SheetCategory, ContactPerson, UserProfile, ActionType } from '../types/pipeline';
import { exportPipelineToExcel, importPipelineFromExcel } from '../utils/excelHelper';
import { Table2, Plus, Download, Upload, Search, Phone, Mail, Edit3, Trash2, Check, ExternalLink, Link2, Filter, ChevronDown } from 'lucide-react';

interface LeadsSheetHubProps {
  sheets: SheetCategory[];
  leads: Lead[];
  users: UserProfile[];
  currentUser: UserProfile;
  activeSheetId: string;
  onSelectSheet: (sheetId: string) => void;
  onAddSheet: (name: string) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenAddLeadModal: (sheetId: string) => void;
  onOpenActionModal: (lead: Lead, contactIdx: number, type: ActionType) => void;
  onImportLeads: (newLeads: Lead[], newSheets: SheetCategory[]) => void;
}

export const LeadsSheetHub: React.FC<LeadsSheetHubProps> = ({
  sheets,
  leads,
  users,
  currentUser,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onUpdateLead,
  onDeleteLead,
  onOpenAddLeadModal,
  onOpenActionModal,
  onImportLeads,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});
  const [isAddingSheet, setIsAddingSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [oneDriveUrl, setOneDriveUrl] = useState<string>('');
  const [showOneDriveConfig, setShowOneDriveConfig] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];
  const sheetLeads = leads.filter(l => l.sheetId === currentSheet?.id);

  // Filtered by search and rep
  const filteredLeads = sheetLeads.filter(l => {
    if (repFilter !== 'all' && l.assignedToEmail !== repFilter) return false;

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

  const handleStartEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditFormData({
      organizationName: lead.organizationName,
      status: lead.status,
      lastFollowUp: lead.lastFollowUp,
      nextFollowUp: lead.nextFollowUp,
      nextFollowUpTime: lead.nextFollowUpTime,
      nextFollowUpType: lead.nextFollowUpType,
      note: lead.note,
      assignedToEmail: lead.assignedToEmail,
    });
  };

  const handleSaveEdit = (lead: Lead) => {
    const updated: Lead = {
      ...lead,
      ...editFormData,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
    setEditingLeadId(null);
  };

  const handleCreateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;
    onAddSheet(newSheetName.trim());
    setNewSheetName('');
    setIsAddingSheet(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const result = await importPipelineFromExcel(file, sheets, currentUser.email);
      onImportLeads(result.newLeads, result.addedSheets);
    } catch (err) {
      alert('Error parsing Excel file. Please ensure it has valid columns.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Spreadsheet Pipeline Tracker</span>
            <span aria-hidden="true">·</span>
            <span>{sheets.length} Category Sheets</span>
            <span aria-hidden="true">·</span>
            <span>{leads.length} Total Commercial Leads</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>{currentSheet?.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono tabular-nums">
              {sheetLeads.length} leads
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add Lead to current sheet */}
          <button
            onClick={() => onOpenAddLeadModal(currentSheet?.id || 'sheet-uae')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row to Sheet</span>
          </button>

          {/* Import Excel */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Import Excel (.xlsx) file"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportPipelineToExcel(leads, sheets)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Export full multi-sheet workbook (.xlsx)"
          >
            <Download className="w-4 h-4" />
            <span>Export Workbook (.xlsx)</span>
          </button>

          {/* OneDrive Link Toggle */}
          <button
            onClick={() => setShowOneDriveConfig(!showOneDriveConfig)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="OneDrive / SharePoint connection"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>OneDrive Sync</span>
          </button>
        </div>
      </div>

      {/* Optional OneDrive sync configuration card */}
      {showOneDriveConfig && (
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <Link2 className="w-4 h-4" />
              <span>Microsoft OneDrive / SharePoint Pipeline Tracker Connection</span>
            </div>
            <button
              onClick={() => setShowOneDriveConfig(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Paste your company OneDrive or SharePoint share link below to enable fast cross-referencing or open your raw Excel sheet directly in Office Online.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={oneDriveUrl}
              onChange={(e) => setOneDriveUrl(e.target.value)}
              placeholder="https://skytron-my.sharepoint.com/:x:/g/personal/m_abdullah_skytron_ai/..."
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
            />
            {oneDriveUrl && (
              <a
                href={oneDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1"
              >
                <span>Open in OneDrive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* MULTI-SHEET TABS BAR */}
      <div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-800">
          {sheets.map((sheet) => {
            const count = leads.filter(l => l.sheetId === sheet.id).length;
            const isActive = sheet.id === activeSheetId;

            return (
              <button
                key={sheet.id}
                onClick={() => onSelectSheet(sheet.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap shrink-0 border-t border-l border-r cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-slate-700 text-white shadow-sm font-semibold'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: sheet.color }}
                />
                <span>{sheet.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                  isActive ? 'bg-slate-800 text-blue-300' : 'bg-slate-900 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Add Sheet Button */}
          {isAddingSheet ? (
            <form onSubmit={handleCreateSheet} className="flex items-center gap-1 shrink-0 ml-1">
              <input
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Sheet name..."
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSheet(false)}
                className="p-1 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSheet(true)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-t-lg transition-colors whitespace-nowrap shrink-0 ml-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Rep Filter Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organization, contacts, position, or status..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Rep:</span>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
            >
              <option value="all">All Sales Reps</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SPREADSHEET TABLE GRID */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 min-w-[200px]">Organization Name</th>
                <th className="py-3 px-4 min-w-[220px]">Key Contacts & Positions</th>
                <th className="py-3 px-4 min-w-[180px]">Contact Coordinates</th>
                <th className="py-3 px-4 min-w-[220px]">Pipeline Status</th>
                <th className="py-3 px-4 min-w-[120px]">Last Follow-up</th>
                <th className="py-3 px-4 min-w-[140px]">Next Follow-up</th>
                <th className="py-3 px-4 min-w-[220px]">Notes & Solutions Pitch</th>
                <th className="py-3 px-4 min-w-[120px]">Assigned Rep</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Table2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-400">No leads in this sheet yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "+ Add Row to Sheet" or import your Excel file to populate this sheet.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isEditing = editingLeadId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* 1. Organization Name */}
                      <td className="py-3 px-4 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.organizationName || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, organizationName: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          />
                        ) : (
                          <div>
                            <span>{lead.organizationName}</span>
                          </div>
                        )}
                      </td>

                      {/* 2. Key Contacts & Positions */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {lead.contacts.map((c, i) => (
                            <div key={c.id || i} className="text-slate-200">
                              <span className="font-medium text-white">{c.name}</span>
                              <span className="text-slate-400 text-[11px] ml-1.5">
                                · {c.position}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 3. Contact Coordinates (Email & Phone) */}
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums">
                        <div className="space-y-1">
                          {lead.contacts.map((c, i) => (
                            <div key={c.id || i} className="flex items-center gap-1.5 text-slate-300">
                              {c.phone && (
                                <button
                                  onClick={() => onOpenActionModal(lead, i, 'call')}
                                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                  title="Call contact"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{c.phone}</span>
                                </button>
                              )}
                              {c.phone && c.email && <span className="text-slate-600">|</span>}
                              {c.email && (
                                <button
                                  onClick={() => onOpenActionModal(lead, i, 'email')}
                                  className="text-sky-400 hover:text-sky-300 truncate max-w-[120px]"
                                  title="Email contact"
                                >
                                  {c.email}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.status || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          />
                        ) : (
                          <div className="text-amber-300/90 text-xs">
                            {lead.status}
                          </div>
                        )}
                      </td>

                      {/* 5. Last Follow-up */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 tabular-nums">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editFormData.lastFollowUp || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, lastFollowUp: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          />
                        ) : (
                          <span>{lead.lastFollowUp || '—'}</span>
                        )}
                      </td>

                      {/* 6. Next Follow-up */}
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="date"
                              value={editFormData.nextFollowUp || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, nextFollowUp: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            />
                            <select
                              value={editFormData.nextFollowUpType || 'followup'}
                              onChange={(e) => setEditFormData({ ...editFormData, nextFollowUpType: e.target.value as ActionType })}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            >
                              <option value="call">Call</option>
                              <option value="email">Email</option>
                              <option value="visit">Visit</option>
                              <option value="followup">Follow-up</option>
                            </select>
                          </div>
                        ) : (
                          <div className="text-blue-300">
                            <span>{lead.nextFollowUp}</span>
                            {lead.nextFollowUpTime && (
                              <span className="text-slate-400 ml-1 font-mono text-[10px]">
                                ({lead.nextFollowUpTime})
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 uppercase block font-sans">
                              {lead.nextFollowUpType || 'followup'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 7. Notes & Products Selling */}
                      <td className="py-3 px-4 text-slate-300 text-xs max-w-xs">
                        {isEditing ? (
                          <textarea
                            value={editFormData.note || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            rows={2}
                          />
                        ) : (
                          <p className="line-clamp-2">{lead.note || '—'}</p>
                        )}
                      </td>

                      {/* 8. Assigned Rep */}
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {isEditing ? (
                          <select
                            value={editFormData.assignedToEmail || currentUser.email}
                            onChange={(e) => setEditFormData({ ...editFormData, assignedToEmail: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.email}>{u.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span>{lead.assignedToEmail ? lead.assignedToEmail.split('@')[0] : 'Unassigned'}</span>
                        )}
                      </td>

                      {/* 9. Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(lead)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLeadId(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenActionModal(lead, 0, 'call')}
                              className="p-1.5 rounded bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-400 transition"
                              title="Call now and log outcome"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenActionModal(lead, 0, 'email')}
                              className="p-1.5 rounded bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-400 transition"
                              title="Email now and log outcome"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(lead)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                              title="Edit inline row"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${lead.organizationName} from sheet?`)) {
                                  onDeleteLead(lead.id);
                                }
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition"
                              title="Delete lead row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
