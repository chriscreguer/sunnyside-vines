/* ============================================================================
   Sunnyside Vines - newsletter signups -> a Google Sheet
   ----------------------------------------------------------------------------
   One-time setup (about 5 minutes):
   1. Create a Google Sheet (e.g. "Sunnyside Vines newsletter") in the account
      that should own the list.
   2. In the sheet: Extensions > Apps Script. Delete what's there, paste this
      whole file, and save.
   3. Deploy > New deployment > type "Web app".
        Execute as:     Me
        Who has access: Anyone
      Deploy, approve the permissions prompt, and copy the Web app URL
      (it ends in /exec).
   4. Paste that URL into NEWSLETTER_ENDPOINT in js/newsletter.js.

   Each signup becomes a row on the "Signups" tab: date, email, language, page.
   Repeat signups of the same address are skipped. If you edit this script
   later, use Deploy > Manage deployments > Edit > New version so the same
   URL keeps working.
   ========================================================================== */

const SHEET_NAME = 'Signups';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return reply('ok'); // the hidden spam trap was filled in: a bot

  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply('invalid');

  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (sheet.getLastRow() === 0) sheet.appendRow(['Signed up', 'Email', 'Language', 'Page']);
    const rows = sheet.getLastRow() - 1;
    const known = rows > 0 ? sheet.getRange(2, 2, rows, 1).getValues().flat() : [];
    if (!known.includes(email)) sheet.appendRow([new Date(), email, p.lang || '', p.page || '']);
  } finally {
    lock.releaseLock();
  }
  return reply('ok');
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
