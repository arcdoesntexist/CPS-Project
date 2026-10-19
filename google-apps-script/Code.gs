const SPREADSHEET_ID = '1fi7VUnYyXRohA6jlrFwCaoA0w9RvS3AIjYzJb9nriWk';
const RESULTS_SHEET = 'Results';
const HEADERS = [
  'receivedAtUtc', 'schemaVersion', 'sessionId', 'playerId', 'displayName',
  'difficulty', 'endReason', 'endedAtUtc', 'playedSeconds', 'score',
  'remainingHp', 'foodCaught', 'foodMissed', 'trashEaten', 'maxCombo',
  'highestRank', 'inputSource', 'leftMaxStrength01', 'leftMeanStrength01',
  'leftPressedSeconds', 'leftMaxForceN', 'leftMeanForceN',
  'rightMaxStrength01', 'rightMeanStrength01', 'rightPressedSeconds',
  'rightMaxForceN', 'rightMeanForceN', 'bothPressedSeconds', 'leftBalance01'
];

function setupResultsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(RESULTS_SHEET) || spreadsheet.insertSheet(RESULTS_SHEET);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), HEADERS.length).createFilter();
  formatGroup_(sheet, 1, 8, '#d9e8f5', '#f4f8fc', '#eaf2f9');
  formatGroup_(sheet, 9, 9, '#dceee2', '#f4faf6', '#eaf5ed');
  formatGroup_(sheet, 18, 12, '#f3e3d1', '#fcf8f2', '#f8f0e6');
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setFontColor('#263238');
  sheet.setColumnWidths(1, HEADERS.length, 120);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(3, 245);
  sheet.setColumnWidth(4, 245);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(8, 170);
  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('H2:H').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('I2:I').setNumberFormat('0.000');
  sheet.getRange('R2:AC').setNumberFormat('0.000');
  return sheet;
}

function doPost(e) {
  let lock;
  try {
    const payload = parsePayload_(e && e.postData && e.postData.contents);
    validatePayload_(payload);
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESULTS_SHEET);
    if (!sheet || !headersMatch_(sheet)) throw new Error('Results sheet is not configured');
    if (findSessionRow_(sheet, payload.sessionId))
      return jsonResponse_({ ok: true, status: 'duplicate' });
    const row = rowFromPayload_(payload, new Date());
    sheet.appendRow(row);
    formatDataRow_(sheet, sheet.getLastRow());
    return jsonResponse_({ ok: true, status: 'created' });
  } catch (error) {
    const message = error && /^Invalid payload/.test(error.message) ? error.message : 'Request failed';
    return jsonResponse_({ ok: false, status: 'error', message: message });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function parsePayload_(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('Invalid payload: empty body');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid payload: malformed JSON');
  }
}

function validatePayload_(payload) {
  if (!payload || payload.schemaVersion !== 1)
    throw new Error('Invalid payload: unsupported schemaVersion');
  ['sessionId', 'playerId', 'displayName', 'difficulty', 'endReason', 'endedAtUtc', 'highestRank', 'inputSource']
    .forEach(function (field) {
      if (typeof payload[field] !== 'string' || !payload[field].trim())
        throw new Error('Invalid payload: missing ' + field);
    });
  ['playedSeconds', 'score', 'remainingHp', 'foodCaught', 'foodMissed', 'trashEaten', 'maxCombo']
    .forEach(function (field) { requireFiniteNumber_(payload, field, false); });
  ['leftMaxStrength01', 'leftMeanStrength01', 'leftPressedSeconds', 'leftMaxForceN',
    'leftMeanForceN', 'rightMaxStrength01', 'rightMeanStrength01', 'rightPressedSeconds',
    'rightMaxForceN', 'rightMeanForceN', 'bothPressedSeconds', 'leftBalance01']
    .forEach(function (field) { requireFiniteNumber_(payload, field, true); });
  if (isNaN(new Date(payload.endedAtUtc).getTime()))
    throw new Error('Invalid payload: endedAtUtc');
  return true;
}

function rowFromPayload_(payload, receivedAtUtc) {
  validatePayload_(payload);
  return [
    new Date(receivedAtUtc), payload.schemaVersion, payload.sessionId, payload.playerId,
    payload.displayName, payload.difficulty, payload.endReason, new Date(payload.endedAtUtc),
    payload.playedSeconds, payload.score, payload.remainingHp, payload.foodCaught,
    payload.foodMissed, payload.trashEaten, payload.maxCombo, payload.highestRank,
    payload.inputSource, optionalNumber_(payload.leftMaxStrength01),
    optionalNumber_(payload.leftMeanStrength01), optionalNumber_(payload.leftPressedSeconds),
    optionalNumber_(payload.leftMaxForceN), optionalNumber_(payload.leftMeanForceN),
    optionalNumber_(payload.rightMaxStrength01), optionalNumber_(payload.rightMeanStrength01),
    optionalNumber_(payload.rightPressedSeconds), optionalNumber_(payload.rightMaxForceN),
    optionalNumber_(payload.rightMeanForceN), optionalNumber_(payload.bothPressedSeconds),
    optionalNumber_(payload.leftBalance01)
  ];
}

function findSessionRow_(sheet, sessionId) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1)
    .createTextFinder(sessionId).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function runContractSelfTests() {
  const payload = contractFixture_();
  assert_(validatePayload_(payload) === true, 'valid payload should pass');
  const row = rowFromPayload_(payload, '2026-10-20T01:00:00.000Z');
  assert_(row.length === 29, 'row must contain 29 columns');
  assert_(row[2] === 'contract-session' && row[4] === 'ผู้เล่นทดสอบ', 'identity mapping');
  assert_(row[5] === 'Normal' && row[6] === 'Triumph' && row[15] === 'B', 'enum mapping');
  assert_(row[20] === '' && row[21] === '' && row[25] === '' && row[26] === '', 'unavailable force cells');
  assert_(row[28] === '', 'unavailable balance cell');
  expectInvalid_(Object.assign({}, payload, { sessionId: '' }), 'missing sessionId');
  expectInvalid_(Object.assign({}, payload, { schemaVersion: 2 }), 'unsupported schema');
  expectInvalid_(Object.assign({}, payload, { score: 'NaN' }), 'non-finite number');
  expectInvalid_(Object.assign({}, payload, { rightMeanStrength01: 'Infinity' }), 'non-finite optional number');
  let malformed = false;
  try { parsePayload_('{'); } catch (error) { malformed = true; }
  assert_(malformed, 'malformed JSON should fail');
}

function contractFixture_() {
  return {
    schemaVersion: 1,
    sessionId: 'contract-session',
    playerId: 'player-contract',
    displayName: 'ผู้เล่นทดสอบ',
    difficulty: 'Normal',
    endReason: 'Triumph',
    endedAtUtc: '2026-10-20T00:00:00.000Z',
    playedSeconds: 60,
    score: 45,
    remainingHp: 2,
    foodCaught: 3,
    foodMissed: 1,
    trashEaten: 0,
    maxCombo: 3,
    highestRank: 'B',
    inputSource: 'Keyboard',
    leftMaxStrength01: 1,
    leftMeanStrength01: 0.5,
    leftPressedSeconds: 30,
    leftMaxForceN: null,
    leftMeanForceN: null,
    rightMaxStrength01: 1,
    rightMeanStrength01: 0.4,
    rightPressedSeconds: 24,
    rightMaxForceN: null,
    rightMeanForceN: null,
    bothPressedSeconds: 5,
    leftBalance01: null
  };
}

function requireFiniteNumber_(payload, field, optional) {
  const value = payload[field];
  if (optional && (value === null || typeof value === 'undefined')) return;
  if (typeof value !== 'number' || !isFinite(value))
    throw new Error('Invalid payload: ' + field);
}

function optionalNumber_(value) {
  return value === null || typeof value === 'undefined' ? '' : value;
}

function headersMatch_(sheet) {
  const values = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  return HEADERS.every(function (header, index) { return values[index] === header; });
}

function formatGroup_(sheet, firstColumn, columnCount, headerColor, oddColor, evenColor) {
  sheet.getRange(1, firstColumn, 1, columnCount).setBackground(headerColor);
  const rowCount = Math.max(sheet.getMaxRows() - 1, 1);
  const colors = [];
  for (let row = 0; row < rowCount; row++)
    colors.push(Array(columnCount).fill((row + 2) % 2 === 0 ? evenColor : oddColor));
  sheet.getRange(2, firstColumn, rowCount, columnCount).setBackgrounds(colors);
}

function formatDataRow_(sheet, row) {
  const even = row % 2 === 0;
  sheet.getRange(row, 1, 1, 8).setBackground(even ? '#eaf2f9' : '#f4f8fc');
  sheet.getRange(row, 9, 1, 9).setBackground(even ? '#eaf5ed' : '#f4faf6');
  sheet.getRange(row, 18, 1, 12).setBackground(even ? '#f8f0e6' : '#fcf8f2');
}

function expectInvalid_(payload, label) {
  let failed = false;
  try { validatePayload_(payload); } catch (error) { failed = true; }
  assert_(failed, label + ' should fail');
}

function assert_(condition, message) {
  if (!condition) throw new Error(message);
}
