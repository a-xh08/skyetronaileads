import { Lead, SheetCategory, UserProfile, ActivityLog, KPISummary, RepWeeklyStats, UserRole } from '../types/pipeline';
import { INITIAL_USERS, INITIAL_SHEETS, INITIAL_LEADS, INITIAL_ACTIVITIES } from '../data/initialData';

const STORAGE_KEYS = {
  LEADS: 'pipeline_tracker_leads_v1',
  SHEETS: 'pipeline_tracker_sheets_v1',
  USERS: 'pipeline_tracker_users_v1',
  ACTIVITIES: 'pipeline_tracker_activities_v1',
  CURRENT_USER: 'pipeline_tracker_current_user_v1',
};

// Safe LocalStorage getter
function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Safe LocalStorage setter
function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function loadUsers(): UserProfile[] {
  return getStoredItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUsers(users: UserProfile[]): void {
  setStoredItem(STORAGE_KEYS.USERS, users);
}

export function loadSheets(): SheetCategory[] {
  return getStoredItem<SheetCategory[]>(STORAGE_KEYS.SHEETS, INITIAL_SHEETS);
}

export function saveSheets(sheets: SheetCategory[]): void {
  setStoredItem(STORAGE_KEYS.SHEETS, sheets);
}

export function loadLeads(): Lead[] {
  return getStoredItem<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
}

export function saveLeads(leads: Lead[]): void {
  setStoredItem(STORAGE_KEYS.LEADS, leads);
}

export function loadActivities(): ActivityLog[] {
  return getStoredItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

export function saveActivities(activities: ActivityLog[]): void {
  setStoredItem(STORAGE_KEYS.ACTIVITIES, activities);
}

export function loadCurrentUser(): UserProfile | null {
  return getStoredItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // defaults to M. Abdullah
}

export function saveCurrentUser(user: UserProfile | null): void {
  setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
}

// Helper to check if a date is today
export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dateString.startsWith(todayStr);
}

// Check if timestamp is in current week
export function isInCurrentWeek(timestamp: string): boolean {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  
  // Start of current week (Monday)
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return d >= monday;
}

// Calculate the 5 KPI keys
export function calculateKPISummary(leads: Lead[], userEmail?: string, userRole?: UserRole): KPISummary {
  const todayStr = new Date().toISOString().split('T')[0];

  // If user is sales rep (and not admin or observer), optionally filter to their leads
  const relevantLeads = leads.filter(l => {
    // If Admin or Observer, view company-wide pipeline; if user email provided and is sales rep, filter
    if (userRole === 'sales' && userEmail) {
      return l.assignedToEmail === userEmail;
    }
    return true;
  });

  const todayLeads = relevantLeads.filter(l => l.nextFollowUp === todayStr);

  let calls = 0;
  let emails = 0;
  let visits = 0;
  let followUps = 0;

  todayLeads.forEach(l => {
    const type = l.nextFollowUpType;
    if (type === 'call') calls++;
    else if (type === 'email') emails++;
    else if (type === 'visit') visits++;
    else followUps++; // Default or general follow-up
  });

  const total = calls + emails + visits + followUps;

  return {
    totalTasksToday: total,
    followUpsToday: followUps,
    callsToday: calls,
    emailsToday: emails,
    visitsToday: visits,
  };
}

// Get personal weekly stats for logged in rep
export function calculatePersonalWeeklyStats(activities: ActivityLog[], userEmail: string): RepWeeklyStats {
  const userActivities = activities.filter(a => a.performedByEmail === userEmail && isInCurrentWeek(a.timestamp));

  let calls = 0;
  let emails = 0;
  let visits = 0;
  let followups = 0;

  userActivities.forEach(a => {
    if (a.type === 'call') calls++;
    else if (a.type === 'email') emails++;
    else if (a.type === 'visit') visits++;
    else followups++;
  });

  const total = calls + emails + visits + followups;
  // Performance index score: based on healthy distribution (target 20 activities/week)
  const target = 20;
  const score = Math.min(100, Math.round((total / target) * 100));

  const sorted = [...userActivities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastActive = sorted.length > 0 ? sorted[0].timestamp : new Date().toISOString();

  return {
    email: userEmail,
    name: userActivities[0]?.performedByName || userEmail.split('@')[0],
    callsThisWeek: calls,
    emailsThisWeek: emails,
    visitsThisWeek: visits,
    followUpsThisWeek: followups,
    totalActivities: total,
    performanceScore: score,
    lastActive,
  };
}

// Calculate team leaderboard for Observer
export function calculateTeamLeaderboard(activities: ActivityLog[], users: UserProfile[]): RepWeeklyStats[] {
  return users
    .filter(u => u.role === 'admin' || u.role === 'sales')
    .map(user => {
      const stats = calculatePersonalWeeklyStats(activities, user.email);
      return {
        ...stats,
        name: user.name,
      };
    })
    .sort((a, b) => b.totalActivities - a.totalActivities);
}

// Reset all storage to initial state
export function resetStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.LEADS);
  localStorage.removeItem(STORAGE_KEYS.SHEETS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
}
