import * as XLSX from 'xlsx';
import { Lead, SheetCategory, ContactPerson } from '../types/pipeline';

// Format leads for a specific sheet into tabular rows
function formatLeadsForExport(leads: Lead[]) {
  return leads.map(l => {
    const contactNames = l.contacts.map(c => c.name).join(', ');
    const contactEmails = l.contacts.map(c => c.email).filter(Boolean).join(', ');
    const contactPositions = l.contacts.map(c => `${c.name}: ${c.position}`).join(' | ');
    const contactPhones = l.contacts.map(c => `${c.name}: ${c.phone}`).join(' | ');

    return {
      'Organization Name': l.organizationName,
      'Email': contactEmails,
      'Person Name': contactNames,
      'Position': contactPositions,
      'Phone Number': contactPhones,
      'Status': l.status,
      'Last Follow-up': l.lastFollowUp,
      'Next Follow-up': l.nextFollowUp,
      'Follow-up Time': l.nextFollowUpTime || '09:00',
      'Follow-up Type': l.nextFollowUpType || 'followup',
      'Note': l.note,
      'Assigned Rep': l.assignedToEmail,
    };
  });
}

// Export the complete multi-sheet pipeline workbook
export function exportPipelineToExcel(leads: Lead[], sheets: SheetCategory[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Overview sheet with all leads consolidated
  const allLeadsData = leads.map(l => {
    const sheetObj = sheets.find(s => s.id === l.sheetId);
    return {
      'Category / Sheet': sheetObj?.name || 'General',
      ...formatLeadsForExport([l])[0],
    };
  });
  const wsOverview = XLSX.utils.json_to_sheet(allLeadsData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Master Pipeline');

  // 2. Individual sheet for each category (matching user's 13-14 sheet structure)
  sheets.forEach(sheet => {
    const sheetLeads = leads.filter(l => l.sheetId === sheet.id);
    const data = formatLeadsForExport(sheetLeads);
    // Excel sheet name max 31 chars
    const safeSheetName = sheet.name.substring(0, 31).replace(/[:\\\/?*\[\]]/g, '');
    const ws = data.length > 0 ? XLSX.utils.json_to_sheet(data) : XLSX.utils.json_to_sheet([
      {
        'Organization Name': '',
        'Email': '',
        'Person Name': '',
        'Position': '',
        'Phone Number': '',
        'Status': '',
        'Last Follow-up': '',
        'Next Follow-up': '',
        'Follow-up Time': '',
        'Follow-up Type': '',
        'Note': '',
        'Assigned Rep': '',
      }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  });

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Pipeline_Tracker_${dateStr}.xlsx`);
}

// Parse imported Excel file into leads and detected sheets
export async function importPipelineFromExcel(
  file: File,
  existingSheets: SheetCategory[],
  defaultAssignedEmail: string
): Promise<{ newLeads: Lead[]; addedSheets: SheetCategory[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedLeads: Lead[] = [];
        const addedSheets: SheetCategory[] = [];
        const sheetMap = new Map<string, SheetCategory>();
        existingSheets.forEach(s => {
          sheetMap.set(s.name.toLowerCase().trim(), s);
          sheetMap.set(s.slug.toLowerCase().trim(), s);
        });

        workbook.SheetNames.forEach((sheetName) => {
          // Skip overview tab if present
          if (sheetName.toLowerCase().includes('master pipeline')) return;

          const worksheet = workbook.Sheets[sheetName];
          const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

          let targetSheet = sheetMap.get(sheetName.toLowerCase().trim());
          if (!targetSheet) {
            // Create sheet dynamically if absent
            const newSheetId = `sheet-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            targetSheet = {
              id: newSheetId,
              name: sheetName,
              slug: sheetName.toLowerCase().replace(/\s+/g, '-'),
              color: '#4F46E5',
              order: existingSheets.length + addedSheets.length + 1,
            };
            addedSheets.push(targetSheet);
            sheetMap.set(sheetName.toLowerCase().trim(), targetSheet);
          }

          rawRows.forEach((row, idx) => {
            const orgName = row['Organization Name'] || row['Organization'] || row['Company'] || row['Org Name'];
            if (!orgName || String(orgName).trim() === '') return;

            const emailsRaw = String(row['Email'] || row['Emails'] || '').split(/[,;]/);
            const personsRaw = String(row['Person Name'] || row['Person'] || row['Name'] || row['Contact'] || '').split(/[,;]/);
            const positionsRaw = String(row['Position'] || row['Title'] || row['Role'] || '').split(/[,;|]/);
            const phonesRaw = String(row['Phone Number'] || row['Phone'] || row['Mobile'] || '').split(/[,;|]/);

            const contacts: ContactPerson[] = [];
            const count = Math.max(personsRaw.length, emailsRaw.length, 1);

            for (let i = 0; i < count; i++) {
              const pName = personsRaw[i]?.trim() || `Contact ${i + 1}`;
              const pEmail = emailsRaw[i]?.trim() || '';
              const pPos = positionsRaw[i]?.trim() || 'Representative';
              const pPhone = phonesRaw[i]?.trim() || '';

              if (pName || pEmail || pPhone) {
                contacts.push({
                  id: `imp-c-${Date.now()}-${idx}-${i}`,
                  name: pName,
                  position: pPos,
                  email: pEmail,
                  phone: pPhone,
                  isPrimary: i === 0,
                });
              }
            }

            const todayStr = new Date().toISOString().split('T')[0];
            const nextFollowUp = row['Next Follow-up'] || row['Next Followup'] || todayStr;
            const lastFollowUp = row['Last Follow-up'] || row['Last Followup'] || todayStr;
            const status = row['Status'] || 'New lead imported';
            const note = row['Note'] || row['Notes'] || row['Product'] || row['Solution'] || '';
            const rep = row['Assigned Rep'] || row['Rep'] || defaultAssignedEmail;
            const followUpType = (['call', 'email', 'visit', 'followup'].includes(String(row['Follow-up Type']).toLowerCase())
              ? String(row['Follow-up Type']).toLowerCase()
              : 'followup') as 'call' | 'email' | 'visit' | 'followup';

            importedLeads.push({
              id: `imp-lead-${Date.now()}-${idx}`,
              sheetId: targetSheet!.id,
              organizationName: String(orgName).trim(),
              contacts: contacts.length > 0 ? contacts : [
                {
                  id: `imp-c-${Date.now()}-${idx}-0`,
                  name: 'Primary Contact',
                  position: 'Representative',
                  email: '',
                  phone: '',
                  isPrimary: true,
                }
              ],
              status: String(status).trim(),
              lastFollowUp: String(lastFollowUp).trim(),
              nextFollowUp: String(nextFollowUp).trim(),
              nextFollowUpTime: row['Follow-up Time'] || '11:00',
              nextFollowUpType: followUpType,
              note: String(note).trim(),
              assignedToEmail: String(rep).trim(),
              createdAt: todayStr,
              updatedAt: todayStr,
            });
          });
        });

        resolve({ newLeads: importedLeads, addedSheets });
      } catch (err) {
        console.error('Failed to parse excel file:', err);
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
