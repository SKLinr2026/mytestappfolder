// ============================================
// INTERVIEW EVALUATION - Google Apps Script v2
// Formatted like the original Excel template
// One sheet per candidate, evaluators in columns
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getOrCreateSpreadsheet();
    
    // Sheet name: "Date - Candidate Name"
    const sheetName = data.interviewDate + ' - ' + data.candidateName;
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      buildTemplate(sheet, data.interviewDate, data.candidateName);
    }
    
    // Find next available evaluator column
    const evalCol = findNextEvaluatorColumn(sheet);
    
    // Write evaluator name (row 3)
    sheet.getRange(3, evalCol).setValue(data.judgeName);
    sheet.getRange(3, evalCol).setFontWeight('bold');
    
    // Section 1: Angiographic Knowledge Evaluation
    const s1Map = [
      { row: 7, id: 'q1a' }, { row: 8, id: 'q1b' }, { row: 9, id: 'q1c' },
      { row: 10, id: 'q1d' }, { row: 11, id: 'q1e' }, { row: 12, id: 'q1f' },
      { row: 13, id: 'q1g' }, { row: 14, id: 'q1h' }
    ];
    s1Map.forEach(m => {
      sheet.getRange(m.row, evalCol).setValue(data[m.id] || '');
      sheet.getRange(m.row, evalCol + 1).setValue(getPoints(m.id, data[m.id]));
    });
    // Section 1 total
    sheet.getRange(15, evalCol + 1).setValue(data.section1Total);
    sheet.getRange(15, evalCol + 1).setBackground('#ffff00').setFontWeight('bold');
    
    // Section 2: Teachability/Humility
    const s2Map = [
      { row: 18, id: 'q2a' }, { row: 19, id: 'q2b' }, { row: 20, id: 'q2c' },
      { row: 21, id: 'q2d' }, { row: 22, id: 'q2e' }
    ];
    s2Map.forEach(m => {
      sheet.getRange(m.row, evalCol).setValue(data[m.id] || '');
      sheet.getRange(m.row, evalCol + 1).setValue(getPoints(m.id, data[m.id]));
    });
    sheet.getRange(23, evalCol + 1).setValue(data.section2Total);
    sheet.getRange(23, evalCol + 1).setBackground('#ffff00').setFontWeight('bold');
    
    // Section 3: Interpersonal/Team Fit
    const s3Map = [
      { row: 26, id: 'q3a' }, { row: 27, id: 'q3b' }, { row: 28, id: 'q3c' }
    ];
    s3Map.forEach(m => {
      sheet.getRange(m.row, evalCol).setValue(data[m.id] || '');
      sheet.getRange(m.row, evalCol + 1).setValue(getPoints(m.id, data[m.id]));
    });
    sheet.getRange(29, evalCol + 1).setValue(data.section3Total);
    sheet.getRange(29, evalCol + 1).setBackground('#ffff00').setFontWeight('bold');
    
    // Section 4: Commitment
    sheet.getRange(32, evalCol).setValue(data.q4 || '');
    sheet.getRange(32, evalCol + 1).setValue(data.section4Total);
    sheet.getRange(32, evalCol + 1).setBackground('#ffff00').setFontWeight('bold');
    
    // Grand total
    sheet.getRange(34, evalCol + 1).setValue(data.totalPoints);
    sheet.getRange(34, evalCol + 1).setBackground('#ff6666').setFontWeight('bold').setFontSize(12);
    
    // Comment (row 36)
    if (data.comment) {
      sheet.getRange(36, evalCol).setValue(data.comment);
      sheet.getRange(36, evalCol).setWrap(true);
    }
    
    // Timestamp
    sheet.getRange(37, evalCol).setValue(new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
    sheet.getRange(37, evalCol).setFontSize(8).setFontColor('#999999');
    
    // Auto-resize
    sheet.autoResizeColumns(evalCol, 2);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildTemplate(sheet, interviewDate, candidateName) {
  // Column widths
  sheet.setColumnWidth(1, 250);  // Questions
  sheet.setColumnWidth(2, 120);  // Options
  sheet.setColumnWidth(3, 80);   // Scoring range
  sheet.setColumnWidth(4, 80);   // Max Points
  
  // Row 1: Date
  sheet.getRange('A1').setValue(interviewDate);
  sheet.getRange('A1').setFontWeight('bold').setFontSize(12).setFontColor('#cc0000');
  
  // Row 2: Candidate name
  sheet.getRange('A2').setValue(candidateName);
  sheet.getRange('A2').setFontWeight('bold').setFontSize(14);
  
  // Row 3: Evaluator header
  sheet.getRange('A3').setValue('');
  
  // Row 5: Section 1 header
  const sec1Color = '#cc0000';
  sheet.getRange('A5').setValue('1. Angiographic Knowledge Evaluation');
  sheet.getRange('A5').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('B5').setValue('');
  sheet.getRange('C5').setValue('Scoring Range').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('D5').setValue('Max Points').setFontWeight('bold').setBackground('#e0e0e0');
  
  // Section 1 questions
  const s1 = [
    { row: 7, q: '(a) Can the candidate identify the study name correctly?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 8, q: '(b) Can the candidate identify pertinent anatomy?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 9, q: '(c) Can the candidate identify abnormal finding(s)?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 10, q: '(d) Can the candidate list differential diagnosis or diagnosis?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 11, q: '(e) Did the candidate ask for getting another injection or another study to support his/her diagnosis?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 12, q: '(f) Can the candidate explain natural history of the diagnosis?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 13, q: '(g) Can the candidate contemplate management options?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 14, q: '(h) Were his/her answers coherent, organized, and thoughtful?', opts: 'Yes/Sort of/No', range: '0-6', max: 6 },
  ];
  s1.forEach(item => {
    sheet.getRange(item.row, 1).setValue(item.q);
    sheet.getRange(item.row, 2).setValue(item.opts);
    sheet.getRange(item.row, 3).setValue(item.range);
    sheet.getRange(item.row, 4).setValue(item.max);
  });
  sheet.getRange(15, 4).setValue(20).setBackground('#ffff00').setFontWeight('bold');
  
  // Row 17: Section 2 header
  sheet.getRange('A17').setValue('2. Teachability / Humility').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('C17').setValue('Scoring Range').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('D17').setValue('Max Points').setFontWeight('bold').setBackground('#e0e0e0');
  
  const s2 = [
    { row: 18, q: '(a) Does he/she overstate himself/herself?', opts: 'No/Sort of/Yes', range: '0-2', max: 2 },
    { row: 19, q: '(b) Does he/she recognize uncertainty?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 20, q: '(c) Is he/she teachable?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 21, q: '(d) Does he/she think safely?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
    { row: 22, q: '(e) Does he/she show humility and compliance?', opts: 'Yes/Sort of/No', range: '0-2', max: 2 },
  ];
  s2.forEach(item => {
    sheet.getRange(item.row, 1).setValue(item.q);
    sheet.getRange(item.row, 2).setValue(item.opts);
    sheet.getRange(item.row, 3).setValue(item.range);
    sheet.getRange(item.row, 4).setValue(item.max);
  });
  sheet.getRange(23, 4).setValue(10).setBackground('#ffff00').setFontWeight('bold');
  
  // Row 25: Section 3 header
  sheet.getRange('A25').setValue('3. Interpersonal / Team Fit').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('C25').setValue('Scoring Range').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('D25').setValue('Max Points').setFontWeight('bold').setBackground('#e0e0e0');
  
  const s3 = [
    { row: 26, q: '(a) Do you think he/she will work with other fellow/PA/NP/Nurse/Techs well?', opts: 'Yes/Likely/Possible/Unlikely/No', range: '0-5', max: 5 },
    { row: 27, q: '(b) Do you think he/she will follow your instructions and guidance well?', opts: 'Yes/Likely/Possible/Unlikely/No', range: '0-5', max: 5 },
    { row: 28, q: '(c) Do you see any potential issues for having him/her as your assistant for a complex case?', opts: 'No concerns/Unlikely/Possible/Likely/Yes', range: '0-5', max: 5 },
  ];
  s3.forEach(item => {
    sheet.getRange(item.row, 1).setValue(item.q);
    sheet.getRange(item.row, 2).setValue(item.opts);
    sheet.getRange(item.row, 3).setValue(item.range);
    sheet.getRange(item.row, 4).setValue(item.max);
  });
  sheet.getRange(29, 4).setValue(15).setBackground('#ffff00').setFontWeight('bold');
  
  // Row 31: Section 4 header
  sheet.getRange('A31').setValue('4. Commitment to Neurointervention').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange('D31').setValue('Max Points').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(32, 1).setValue('Highly motivated (5) / Motivated but moderate (3) / Neutral (1) / No reliable sign (0)');
  sheet.getRange(32, 4).setValue(5);
  
  // Row 34: Total
  sheet.getRange('A34').setValue('TOTAL POINTS').setFontWeight('bold').setFontSize(12).setBackground('#cc0000').setFontColor('#ffffff');
  sheet.getRange('D34').setValue(50).setBackground('#ff6666').setFontWeight('bold').setFontSize(12);
  
  // Row 35: Timestamp label
  // Comment section
  sheet.getRange('A36').setValue('Comments:').setFontWeight('bold').setBackground('#e0e0e0');
  
  sheet.getRange('A37').setValue('Submitted at:').setFontSize(8).setFontColor('#999999');
  
  // Evaluator column headers (row 6)
  sheet.getRange(6, 1).setValue('').setBackground('#e0e0e0');
}

function findNextEvaluatorColumn(sheet) {
  // Evaluator columns start at column 5 (E), each evaluator takes 2 columns (Description + Points)
  // Check row 3 for evaluator names
  let col = 5;
  while (sheet.getRange(3, col).getValue() !== '') {
    col += 2;
  }
  
  // Add sub-headers for this evaluator
  sheet.getRange(5, col).setValue('Description').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(5, col + 1).setValue('Points').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(17, col).setValue('Description').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(17, col + 1).setValue('Points').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(25, col).setValue('Description').setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(25, col + 1).setValue('Points').setFontWeight('bold').setBackground('#e0e0e0');
  
  return col;
}

function getPoints(qId, label) {
  if (!label) return 0;
  
  // Yes/Sort of/No questions (max 2)
  const yesNo2 = ['q1a','q1b','q1c','q1d','q1e','q1f','q1g','q2b','q2c','q2d','q2e'];
  if (yesNo2.includes(qId)) {
    if (label === 'Yes') return 2;
    if (label === 'Sort of') return 1;
    if (label === 'No') return 0;
  }
  
  // q1h (max 6)
  if (qId === 'q1h') {
    if (label === 'Yes') return 6;
    if (label === 'Sort of') return 3;
    if (label === 'No') return 0;
  }
  
  // q2a is reversed (No = good)
  if (qId === 'q2a') {
    if (label === 'No') return 2;
    if (label === 'Sort of') return 1;
    if (label === 'Yes') return 0;
  }
  
  // Section 3 (max 5)
  if (['q3a','q3b'].includes(qId)) {
    const map = {'Yes':5, 'Likely':4, 'Possible':3, 'Unlikely':1, 'No':0};
    return map[label] || 0;
  }
  if (qId === 'q3c') {
    const map = {'No concerns':5, 'Unlikely':4, 'Possible':3, 'Likely':1, 'Yes, concerns':0};
    return map[label] || 0;
  }
  
  // Section 4
  if (qId === 'q4') {
    const map = {'Highly motivated':5, 'Motivated but moderate':3, 
                 'Neutral, can do other fellowships if opportunity provided':1, 
                 'No reliable sign of motivation':0};
    return map[label] || 0;
  }
  
  return 0;
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Interview Eval API v2 is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName('Interview Evaluations');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create('Interview Evaluations');
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  return ss;
}
