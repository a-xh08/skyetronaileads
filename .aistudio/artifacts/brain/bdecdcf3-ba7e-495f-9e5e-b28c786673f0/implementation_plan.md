# Pipeline Tracker: Enterprise Lead Management System

A dedicated B2B Lead Management System built for commercial pipelines, replacing manual spreadsheet juggling with corporate Microsoft / Office email direct authentication, a 5-KPI daily task engine, interactive contact-level activity logging, and bidirectional Excel data sync.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following revisions have been incorporated:
> - **Authentication (PIN Removed)**: Switched from PINs to **Corporate Office / Microsoft Email Direct Login** (`@skytron.ai` and authorized company emails).
>   - **Admin (`m.abdullah@skytron.ai`)**: Full authority, manages team permissions and sheet assignments, and actively logs sales.
>   - **Observer / CEO (`n.khan@skytron.ai`)**: Full company-wide performance visibility and pipeline monitoring.
>   - **Sales Team**: Direct sign-in with company email, assigned specific sheets and leads. Admin can add allowed corporate emails and assign roles.
> - **Dashboard Action Controls (Under 5 KPIs)**:
>   - **`+ New Action`**: Opens the action drawer without pre-filled data, allowing live search across all organizations and contacts to log calls, emails, or meetings.
>   - **`+ New Lead`**: Quick lead intake modal with multi-contact support (name, title, email, phone) and sector sheet assignment.
>   - **`Completed History`**: Immediate drawer to inspect recently completed tasks, call outcomes, and follow-up notes.
> - **Personal Progress Index (Under Action Bar)**:
>   - Displays the logged-in rep's personal weekly performance: calls completed this week, emails sent, visits logged, follow-up rate, and composite performance score.

---

## 1. System Architecture & Visual Flowchart

```
┌────────────────────────────────────────────────────────┐
│      CORPORATE EMAIL AUTHENTICATION (Office / SSO)     │
│  - Email sign-in: m.abdullah@skytron.ai (Admin/Sales)   │
│  - CEO Observer: n.khan@skytron.ai                      │
│  - Sales Reps: Authorized corporate email accounts      │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     ADMIN & SALES       │ │       CEO OBSERVER      │
│  "Welcome, [Name]"      │ │  "Executive Cockpit"    │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
  ┌──────────┴──────────┐                │
  ▼                     ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  INFO DASHBOARD │ │ LEADS SHEET HUB │ │ OBSERVER COCKPIT│
│ - 5 KPI Keys    │ │ - 14+ Sheet Tabs│ │ - Team Output   │
│   1. Tasks Due  │ │ - Multi-contact │   Leaderboard     │
│   2. Follow-ups │ │ - Inline Edit   │ │ - Weekly Trends │
│   3. Calls Due  │ │ - Search/Filter │ │ - Overdue Tasks │
│   4. Emails Due │ │ - Excel Import  │ │ - Sector Volume │
│   5. Visits Due │ │ - Excel Export  │ └─────────────────┘
└────────┬────────┘ └─────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│               DASHBOARD QUICK ACTION BAR               │
│  [ + New Action ]      [ + New Lead ]   [ Completed ] │
│  · Live Org Search     · Multi-contact  · Audit Log   │
│  · Custom outcome      · Sheet assign   · Past notes  │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│        PERSONAL WEEKLY PROGRESS & PERFORMANCE          │
│  - Calls Done This Week   - Emails Sent This Week      │
│  - Client Visits Made     - Follow-up Compliance %     │
│  - Personal Velocity Score & Activity Heatmap          │
└────────────────────────────────────────────────────────┘
```

---

## 2. User Experience & Feature Breakdown

### A. Corporate Email Authentication
- Clean Microsoft 365 / Corporate Email sign-in screen.
- Pre-seeded profiles:
  - **`m.abdullah@skytron.ai`** (Admin & Sales): Full permissions + personal sales workflow.
  - **`n.khan@skytron.ai`** (Observer / CEO): Executive analytics, team performance rankings, activity timeline.
  - Additional sales reps: Pre-configured or dynamically created by Admin in Team Settings.
- Quick switch option for testing and multi-rep demoing.

### B. Info Dashboard (Daily Control Center)
1. **The 5 Real-Time KPI Keys**:
   - **KPI 1: Total Tasks Today**: Dynamically calculated as sum of KPIs 2, 3, 4, and 5 with completed progress tracker.
   - **KPI 2: Follow-ups Due Today**: General reminders and dates requiring touchpoint.
   - **KPI 3: Calls To Be Made**: Prioritized call queue with one-click **"Call Now"**.
   - **KPI 4: Emails To Be Sent**: Pending email communications with one-click **"Email Now"**.
   - **KPI 5: Visits Scheduled**: In-person site, hotel, or office meetings.
2. **Interactive KPI Drill-Down Modal**:
   - Clicking any KPI displays the filtered list of today's leads with organization name, contact person, position, solution/product, and direct action triggers.
3. **Action Bar (Directly Under KPIs)**:
   - **`+ New Action`**: Modal with real-time fuzzy search across all organizations and contacts. Log outcome (*"Didn't pick up"*, *"Requested quote"*, *"Scheduled demo"*), set next follow-up date/time, and update notes.
   - **`+ New Lead`**: Modal to add organization, sheet category, multiple contacts (name, position, email, phone), and solution notes.
   - **`Completed History`**: Filterable slide-out of all completed activities today and this week with timestamped outcomes.
4. **Personal Weekly Progress Card**:
   - Tracks individual productivity metrics for the current week:
     - Calls logged vs weekly target
     - Emails dispatched
     - Client meetings/visits completed
     - Overall weekly performance score

### C. Leads Sheet Hub (Spreadsheet Grid)
- **14+ Sheet Tabs**: University Leads, Hospital Leads, Mall Leads, UAE Leads, Qatar Leads, Saudi Leads, Strategic Partnership Leads, Towers, Key Drone Leads, AI Hologram Leads, Oil & Gas Leads, Trace Leads, Talent Cloud Leads, and Custom Sheets.
- **Organization Hierarchy**: Each organization row supports multiple contacts (e.g., *Rixos Hotel* with *Sokina in Procurement*, *Sabich in Engineering*).
- **Inline Cell Editing**: Click to update status, next follow-up date, or note.
- **Excel Sync**:
  - **Import**: Upload existing `.xlsx` or `.csv` Pipeline Tracker files to parse and populate tabs.
  - **Export**: Download the entire multi-sheet workbook as `.xlsx`.

### D. Observer / CEO Executive Cockpit
- Dedicated view for `n.khan@skytron.ai` (and accessible by Admin):
  - Team member performance comparison (calls, emails, visits per rep per day/week).
  - Overdue follow-up alerts across all sheets.
  - Pipeline volume and conversion rates by industry sector.

---

## 3. Data Model

- **User**: `id`, `name`, `email` (`@skytron.ai`), `role` (`admin` | `observer` | `sales`), `avatar`.
- **Sheet**: `id`, `name`, `categoryKey`, `order`.
- **Contact**: `id`, `name`, `position`, `email`, `phone`.
- **Lead**: `id`, `sheetId`, `organizationName`, `contacts: Contact[]`, `status`, `lastFollowUp`, `nextFollowUp`, `note`, `assignedRepId`, `createdAt`.
- **Activity**: `id`, `leadId`, `organizationName`, `contactName`, `type` (`call` | `email` | `visit` | `followup`), `outcome`, `note`, `performedByEmail`, `timestamp`, `nextFollowUpScheduled`.

---

## 4. Verification Plan

1. **Authentication**: Verify direct login with `m.abdullah@skytron.ai` (Admin/Sales), `n.khan@skytron.ai` (CEO Observer), and custom rep accounts.
2. **KPI Engine**: Verify KPI 1 equals sum of KPIs 2-5 and clicking any KPI opens the matching action list.
3. **Action Bar**:
   - Test `+ New Action`: Search organization, pick contact, submit outcome, verify lead status and next follow-up update.
   - Test `+ New Lead`: Add new organization with multiple contacts, verify it appears in the proper sheet tab.
   - Test `Completed History`: Confirm logged actions appear in chronological order.
4. **Personal Progress**: Verify personal weekly counters increment immediately upon logging actions.
5. **Leads Sheet Hub**: Verify sheet tab switching, multi-contact display, inline editing, and Excel export/import.
6. **Code Compilation**: Run `compile_applet` to confirm zero build errors.
