import React, { useState } from 'react';
import { Lead, SheetCategory, ContactPerson, ActionType, UserProfile } from '../types/pipeline';
import { X, Plus, Trash2, Building2, User, Phone, Mail, Check } from 'lucide-react';

interface AddLeadModalProps {
  sheets: SheetCategory[];
  currentSheetId?: string;
  users: UserProfile[];
  currentUser: UserProfile;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  sheets,
  currentSheetId,
  users,
  currentUser,
  onClose,
  onAddLead,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState(currentSheetId || sheets[0]?.id || 'sheet-uae');
  const [organizationName, setOrganizationName] = useState('');
  const [status, setStatus] = useState('New prospect added');
  const [note, setNote] = useState('');
  const [assignedToEmail, setAssignedToEmail] = useState(currentUser.email);

  const todayStr = new Date().toISOString().split('T')[0];
  const [nextFollowUpDate, setNextFollowUpDate] = useState(todayStr);
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00');
  const [nextFollowUpType, setNextFollowUpType] = useState<ActionType>('call');

  // Dynamic contacts list (support multiple persons per organization)
  const [contacts, setContacts] = useState<Omit<ContactPerson, 'id'>[]>([
    {
      name: '',
      position: 'Procurement Specialist',
      email: '',
      phone: '',
      isPrimary: true,
    },
  ]);

  const handleAddContactField = () => {
    setContacts([
      ...contacts,
      {
        name: '',
        position: 'Engineering / Operations',
        email: '',
        phone: '',
        isPrimary: false,
      },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    if (contacts.length <= 1) return;
    setContacts(contacts.filter((_, idx) => idx !== index));
  };

  const handleContactChange = (index: number, field: keyof Omit<ContactPerson, 'id'>, value: any) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    const formattedContacts: ContactPerson[] = contacts.map((c, idx) => ({
      id: `c-${Date.now()}-${idx}`,
      name: c.name.trim() || `Contact ${idx + 1}`,
      position: c.position.trim() || 'Representative',
      email: c.email.trim(),
      phone: c.phone.trim(),
      isPrimary: idx === 0,
    }));

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      sheetId: selectedSheetId,
      organizationName: organizationName.trim(),
      contacts: formattedContacts,
      status: status.trim() || 'New lead added',
      lastFollowUp: todayStr,
      nextFollowUp: nextFollowUpDate,
      nextFollowUpTime: nextFollowUpTime,
      nextFollowUpType: nextFollowUpType,
      note: note.trim(),
      assignedToEmail: assignedToEmail,
      createdAt: todayStr,
      updatedAt: todayStr,
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Add New Lead to Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter organization details, multiple key contact persons, and set initial follow-up
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
          {/* Target Sheet & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Pipeline Sheet
              </label>
              <select
                value={selectedSheetId}
                onChange={(e) => setSelectedSheetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sheets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Organization / Company Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Rixos Hotel / Abu Dhabi Ports"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Dynamic Contacts Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contact Persons (Add multiple representatives)
              </label>
              <button
                type="button"
                onClick={handleAddContactField}
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Contact</span>
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Contact Person #{idx + 1} {idx === 0 ? '(Primary)' : ''}</span>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        placeholder="Person name (e.g. Sokina / Sabich)"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={idx === 0}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => handleContactChange(idx, 'position', e.target.value)}
                        placeholder="Position (e.g. Procurement, Director)"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                        placeholder="Email (e.g. sokina@rixos.com)"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                        placeholder="Phone (e.g. +971 50 123 4567)"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Products Offered Note */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Initial Pipeline Status
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. Didn't pick up call / Awaiting RFP reply"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Note / Solutions Selling (What products are we pitching?)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. AI Hologram concierge, Key drone inspection, Talent Cloud pilot..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scheduling Next Follow-up & Assigned Rep */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Follow-up Time
              </label>
              <input
                type="time"
                value={nextFollowUpTime}
                onChange={(e) => setNextFollowUpTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Task Type
              </label>
              <select
                value={nextFollowUpType}
                onChange={(e) => setNextFollowUpType(e.target.value as ActionType)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="visit">Visit</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Assigned Rep
              </label>
              <select
                value={assignedToEmail}
                onChange={(e) => setAssignedToEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name}
                  </option>
                ))}
              </select>
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
