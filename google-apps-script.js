// ============================================
// INTERVIEW EVALUATION - Google Apps Script
// ============================================
// SETUP:
// 1. Go to https://script.google.com
// 2. Create new project, name it "Interview Eval"
// 3. Paste this entire code
// 4. Click Deploy → New Deployment
// 5. Type: Web App
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. Click Deploy, authorize, copy the URL
// 9. Send the URL to Oliver
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get or create spreadsheet for the interview date
    const sheetName = data.interviewDate || 'Unknown Date';
    const ss = getOrCreateSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers
      const headers = [
        'Timestamp', 'Judge Name', 'Candidate Name',
        '1a. Identify study name', '1b. Identify anatomy', '1c. Identify abnormal findings',
        '1d. Differential/diagnosis', '1e. Ask for another injection/study',
        '1f. Explain natural history', '1g. Contemplate management',
        '1h. Coherent/organized/thoughtful',
        'Section 1 Total',
        '2a. Overstate themselves?', '2b. Recognize uncertainty?',
        '2c. Teachable?', '2d. Think safely?', '2e. Show humility/compliance?',
        'Section 2 Total',
        '3a. Work with team?', '3b. Follow instructions?', '3c. Issues as assistant?',
        'Section 3 Total',
        '4. Commitment to Neurointervention',
        'Section 4 Total',
        'TOTAL POINTS'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Build row
    const row = [
      new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}),
      data.judgeName,
      data.candidateName,
      data.q1a, data.q1b, data.q1c, data.q1d, data.q1e, data.q1f, data.q1g, data.q1h,
      data.section1Total,
      data.q2a, data.q2b, data.q2c, data.q2d, data.q2e,
      data.section2Total,
      data.q3a, data.q3b, data.q3c,
      data.section3Total,
      data.q4,
      data.section4Total,
      data.totalPoints
    ];
    
    sheet.appendRow(row);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, row.length);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Interview Eval API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSpreadsheet() {
  // Look for existing spreadsheet
  const files = DriveApp.getFilesByName('Interview Evaluations');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  // Create new one
  const ss = SpreadsheetApp.create('Interview Evaluations');
  // Remove default Sheet1
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  return ss;
}
