// ============================================================
// Budgetty – Google Apps Script Backend
// Deploy as Web App: Execute as Me, Access: Anyone
// ============================================================

var SHEET_ACCOUNTS = 'Accounts';
var SHEET_TRANSACTIONS = 'Transactions';
var TZ = 'Asia/Phnom_Penh';

// ── Helpers ──────────────────────────────────────────────────

function getToken() {
  return PropertiesService.getScriptProperties().getProperty('API_TOKEN');
}

function auth(e) {
  var params = e.parameter || {};
  var body = {};
  try { body = JSON.parse(e.postData ? e.postData.contents : '{}'); } catch (_) {}
  var token = params.token || body.token;
  return token === getToken();
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(data) { return json({ ok: true, data: data }); }
function err(msg) { return json({ ok: false, error: msg }); }

function todayPhnomPenh() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

function thisMonthPhnomPenh() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
}

// ── Sheet bootstrapper ────────────────────────────────────────

/**
 * Run this ONCE from the Apps Script editor (Run → setup) to create
 * the Accounts and Transactions sheets with headers, and to format
 * the date column as Plain Text so Sheets never auto-converts dates.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Accounts ---
  var acc = ss.getSheetByName(SHEET_ACCOUNTS);
  if (!acc) acc = ss.insertSheet(SHEET_ACCOUNTS);
  acc.clearContents();
  acc.getRange(1, 1, 1, 5).setValues([['id', 'name', 'type', 'opening_balance', 'created_at']]);
  acc.setFrozenRows(1);

  // --- Transactions ---
  var trx = ss.getSheetByName(SHEET_TRANSACTIONS);
  if (!trx) trx = ss.insertSheet(SHEET_TRANSACTIONS);
  trx.clearContents();
  trx.getRange(1, 1, 1, 8).setValues([['id', 'account_id', 'type', 'amount', 'category', 'note', 'date', 'created_at']]);
  trx.setFrozenRows(1);

  // Format the `date` column (column G = 7) as Plain Text
  // so Sheets never converts YYYY-MM-DD to a Date serial
  var dateCol = trx.getRange(2, 7, Math.max(trx.getMaxRows() - 1, 1000), 1);
  dateCol.setNumberFormat('@STRING@');

  SpreadsheetApp.flush();
  Logger.log('Setup complete.');
}

// ── Data readers ──────────────────────────────────────────────

function readAccounts(ss) {
  var sheet = ss.getSheetByName(SHEET_ACCOUNTS);
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  return rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  });
}

function readTransactions(ss) {
  var sheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  return rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    // amount is always stored as a number; ensure integer
    obj.amount = parseInt(obj.amount, 10) || 0;
    // date may come back as a Date object if the cell format slipped
    if (obj.date instanceof Date) {
      obj.date = Utilities.formatDate(obj.date, TZ, 'yyyy-MM-dd');
    } else {
      obj.date = String(obj.date).trim();
    }
    return obj;
  });
}

// ── Period helpers ────────────────────────────────────────────

/**
 * Returns true if the transaction `date` string (YYYY-MM-DD) falls
 * within the selected period for income/expense filtering.
 */
function inPeriod(date, mode, periodDate) {
  if (mode === 'daily') return date === periodDate;
  // monthly: periodDate is YYYY-MM
  return date.substring(0, 7) === periodDate;
}

/**
 * Returns true if the transaction `date` is ≤ the last day of the
 * selected period — used for running balance.
 */
function onOrBeforePeriodEnd(date, mode, periodDate) {
  var endDate;
  if (mode === 'daily') {
    endDate = periodDate; // YYYY-MM-DD
  } else {
    // last day of the month: increment month by 1, subtract 1 day
    var parts = periodDate.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var lastDay = new Date(y, m, 0); // JS Date: month is 1-based here → day 0 of next month = last day of this
    endDate = Utilities.formatDate(lastDay, TZ, 'yyyy-MM-dd');
  }
  return date <= endDate;
}

// ── getSummary ────────────────────────────────────────────────

function getSummary(e) {
  var mode = (e.parameter.mode || 'daily').toLowerCase();
  // date param: YYYY-MM-DD for daily, YYYY-MM for monthly
  var periodDate = e.parameter.date || (mode === 'daily' ? todayPhnomPenh() : thisMonthPhnomPenh());

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var accounts = readAccounts(ss);
  var transactions = readTransactions(ss);

  var result = accounts.map(function(acc) {
    var acctTrx = transactions.filter(function(t) { return t.account_id === acc.id; });

    // income & expense: only within the selected period
    var income = 0, expense = 0;
    acctTrx.forEach(function(t) {
      if (!inPeriod(t.date, mode, periodDate)) return;
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });

    // balance: opening_balance + all income – all expense up to period end
    var balIncome = 0, balExpense = 0;
    acctTrx.forEach(function(t) {
      if (!onOrBeforePeriodEnd(t.date, mode, periodDate)) return;
      if (t.type === 'income') balIncome += t.amount;
      else if (t.type === 'expense') balExpense += t.amount;
    });
    var openingBalance = parseInt(acc.opening_balance, 10) || 0;
    var balance = openingBalance + balIncome - balExpense;

    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      openingBalance: openingBalance,
      balance: balance,
      income: income,
      expense: expense
    };
  });

  return ok(result);
}

// ── getTransactions ───────────────────────────────────────────

function getTransactions(e) {
  var accountId = e.parameter.accountId;
  var mode = (e.parameter.mode || 'daily').toLowerCase();
  var periodDate = e.parameter.date || (mode === 'daily' ? todayPhnomPenh() : thisMonthPhnomPenh());

  if (!accountId) return err('accountId required');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var transactions = readTransactions(ss);

  var filtered = transactions
    .filter(function(t) {
      return t.account_id === accountId && inPeriod(t.date, mode, periodDate);
    })
    .sort(function(a, b) {
      // newest first
      if (b.date > a.date) return 1;
      if (b.date < a.date) return -1;
      return 0;
    })
    .map(function(t) {
      return {
        id: t.id,
        accountId: t.account_id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        date: t.date,
        createdAt: t.created_at
      };
    });

  return ok(filtered);
}

// ── getAccounts ───────────────────────────────────────────────

function getAccounts(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var accounts = readAccounts(ss);
  return ok(accounts.map(function(a) {
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      openingBalance: parseInt(a.opening_balance, 10) || 0,
      createdAt: a.created_at
    };
  }));
}

// ── createAccount ─────────────────────────────────────────────

function createAccount(body) {
  var name = String(body.name || '').trim();
  var type = String(body.type || '').trim();
  var openingBalance = parseInt(body.openingBalance, 10);

  if (!name) return err('name required');
  if (!type) return err('type required');
  if (isNaN(openingBalance) || openingBalance < 0) return err('openingBalance must be a non-negative integer');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ACCOUNTS);
    var id = Utilities.getUuid();
    var createdAt = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss");
    sheet.appendRow([id, name, type, openingBalance, createdAt]);
    SpreadsheetApp.flush();
    return ok({ id: id, name: name, type: type, openingBalance: openingBalance, createdAt: createdAt });
  } finally {
    lock.releaseLock();
  }
}

// ── createTransaction ─────────────────────────────────────────

function createTransaction(body) {
  var accountId = String(body.accountId || '').trim();
  var type = String(body.type || '').trim();
  var amount = parseInt(body.amount, 10);
  var category = String(body.category || '').trim();
  var note = String(body.note || '').trim();
  var date = String(body.date || '').trim();

  if (!accountId) return err('accountId required');
  if (type !== 'income' && type !== 'expense') return err('type must be income or expense');
  if (isNaN(amount) || amount <= 0) return err('amount must be a positive integer');
  if (!category) return err('category required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return err('date must be YYYY-MM-DD');

  // Validate account exists
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var accounts = readAccounts(ss);
    var account = accounts.find(function(a) { return a.id === accountId; });
    if (!account) return err('account not found');

    var sheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    var id = Utilities.getUuid();
    var createdAt = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss");
    // Append as plain text to preserve date string
    sheet.appendRow([id, accountId, type, amount, category, note, date, createdAt]);
    // Re-apply Plain Text format to the date cell just written
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 7).setNumberFormat('@STRING@');
    SpreadsheetApp.flush();
    return ok({ id: id, accountId: accountId, type: type, amount: amount, category: category, note: note, date: date, createdAt: createdAt });
  } finally {
    lock.releaseLock();
  }
}

// ── Router ────────────────────────────────────────────────────

function doGet(e) {
  if (!auth(e)) return err('unauthorized');
  var action = e.parameter.action;
  switch (action) {
    case 'getAccounts':     return getAccounts(e);
    case 'getSummary':      return getSummary(e);
    case 'getTransactions': return getTransactions(e);
    default:                return err('unknown action: ' + action);
  }
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (_) { return err('invalid JSON body'); }
  if (!auth({ parameter: {}, postData: e.postData })) return err('unauthorized');
  var action = body.action;
  switch (action) {
    case 'createAccount':     return createAccount(body);
    case 'createTransaction': return createTransaction(body);
    default:                  return err('unknown action: ' + action);
  }
}
