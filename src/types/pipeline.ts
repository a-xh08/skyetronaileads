export type UserRole = 'admin' | 'sales' | 'observer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar?: string;
  assignedSheets?: string[]; // sheet IDs or 'all'
}

export interface ContactPerson {
  id: string;
  name: string;
  position: string; // e.g. Procurement, Engineering, Director
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export type ActionType = 'call' | 'email' | 'visit' | 'followup';

export interface Lead {
  id: string;
  sheetId: string;
  organizationName: string;
  contacts: ContactPerson[];
  status: string; // e.g. "Sabich didn't pick up the call"
  lastFollowUp: string; // ISO date or date string
  nextFollowUp: string; // ISO date or date string (YYYY-MM-DD)
  nextFollowUpTime?: string; // e.g. "11:30"
  nextFollowUpType?: ActionType;
  note: string; // Products / Solutions selling (e.g. "AI Hologram, Drone Leads")
  assignedToEmail: string; // User email
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  organizationName: string;
  contactPersonName: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  type: ActionType;
  outcome: string; // e.g. "Didn't pick up", "Requested email quote", "Meeting confirmed"
  notes: string;
  performedByEmail: string;
  performedByName: string;
  timestamp: string; // ISO date string
  nextFollowUpScheduled?: string;
}

export interface SheetCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
  description?: string;
}

export interface KPISummary {
  totalTasksToday: number;
  followUpsToday: number;
  callsToday: number;
  emailsToday: number;
  visitsToday: number;
}

export interface RepWeeklyStats {
  email: string;
  name: string;
  callsThisWeek: number;
  emailsThisWeek: number;
  visitsThisWeek: number;
  followUpsThisWeek: number;
  totalActivities: number;
  performanceScore: number; // 0 - 100
  lastActive: string;
}
