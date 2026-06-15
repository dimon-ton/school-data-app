/**
 * Code.gs - Backend for ระบบรวบรวมข้อมูลสถานศึกษา
 */

function setupSpreadsheet() {
  var config = getConfig();
  var ssId = config.SPREADSHEET_ID;
  
  var ss = SpreadsheetApp.openById(ssId);
  
  // Rename first sheet to SchoolData
  var sheets = ss.getSheets();
  var schoolSheet = sheets[0];
  schoolSheet.setName('SchoolData');
  
  // Add headers
  schoolSheet.getRange(1, 1, 1, 17).setValues([[
    'timestamp', 'schoolId', 'schoolName', 'centerNo', 'district',
    'directorName', 'directorPhone', 'deputy1Name', 'deputy1Phone',
    'deputy2Name', 'deputy2Phone', 'totalStaff',
    'totalMaleStudents', 'totalFemaleStudents', 'grandTotalStudents',
    'submitterName', 'submitterPhone'
  ]]);
  
  // Create Staff sheet
  var staffSheet = ss.insertSheet('StaffData');
  staffSheet.getRange(1, 1, 1, 7).setValues([[
    'timestamp', 'schoolId', 'schoolName', 'type', 'position', 'count', 'detail'
  ]]);
  
  // Create Student sheet
  var studentSheet = ss.insertSheet('StudentData');
  studentSheet.getRange(1, 1, 1, 7).setValues([[
    'timestamp', 'schoolId', 'schoolName', 'level', 'male', 'female', 'total'
  ]]);
  
  // Delete default Sheet1 if still exists
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
  
  Logger.log('Spreadsheet setup complete: ' + ssId);
  return ssId;
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบรวบรวมข้อมูลสถานศึกษา')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function generateSchoolId() {
  var timestamp = new Date().getTime();
  var random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return 'SCH-' + timestamp.toString(36).toUpperCase() + '-' + random;
}

function saveFormData(data) {
  try {
    if (!data || !data.school) {
      return { success: false, message: 'ข้อมูลไม่ถึง' };
    }

    // Check for duplicate
    var existing = checkDuplicateSchool(data.school.schoolName, data.school.centerNo);

    if (existing.found && !data.forceUpdate) {
      return {
        success: false,
        duplicate: true,
        message: 'พบข้อมูลของโรงเรียนนี้ในระบบแล้ว ต้องการอัปเดตข้อมูลเดิมหรือไม่?',
        existingData: existing.data
      };
    }

    var config = getConfig();
    var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
    var schoolId = existing.found ? existing.data.schoolId : generateSchoolId();
    var timestamp = new Date();

    if (existing.found && data.forceUpdate) {
      // Update existing record
      updateSchoolData(ss, data, schoolId, timestamp);
    } else {
      // Save new record
      saveSchoolData(data, schoolId, timestamp);
      saveStaffData(data.staff || [], schoolId, data.school.schoolName, timestamp);
      saveStudentData(data.students || [], schoolId, data.school.schoolName, timestamp);
    }

    return {
      success: true,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      schoolId: schoolId
    };
  } catch (error) {
    return { success: false, message: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง\n' + error.message };
  }
}

function checkDuplicateSchool(schoolName, centerNo) {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == schoolName && data[i][3] == centerNo) {
      return {
        found: true,
        data: {
          schoolId: data[i][1],
          row: i + 1,
          timestamp: data[i][0]
        }
      };
    }
  }
  return { found: false };
}

function saveSchoolData(data, schoolId, timestamp) {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  ensureSchoolDataHeaders(sheet);

  sheet.appendRow([
    timestamp,
    schoolId,
    data.school.schoolName,
    data.school.centerNo,
    data.school.district,
    data.administrators.directorName,
    data.administrators.directorPhone,
    data.administrators.deputy1Name || '',
    data.administrators.deputy1Phone || '',
    data.administrators.deputy2Name || '',
    data.administrators.deputy2Phone || '',
    data.summary.totalStaff || 0,
    data.summary.totalMaleStudents || 0,
    data.summary.totalFemaleStudents || 0,
    data.summary.grandTotalStudents || 0,
    data.submitter ? data.submitter.submitterName || '' : '',
    data.submitter ? data.submitter.submitterPhone || '' : ''
  ]);
}

function updateSchoolData(ss, data, schoolId, timestamp) {
  var config = getConfig();

  // Find and update SchoolData row
  var schoolSheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  ensureSchoolDataHeaders(schoolSheet);
  var schoolRows = schoolSheet.getDataRange().getValues();
  var schoolRowNum = -1;

  for (var i = 1; i < schoolRows.length; i++) {
    if (schoolRows[i][1] == schoolId) {
      schoolRowNum = i + 1;
      break;
    }
  }

  if (schoolRowNum > 0) {
    schoolSheet.getRange(schoolRowNum, 1, 1, 17).setValues([[
      timestamp, schoolId,
      data.school.schoolName, data.school.centerNo, data.school.district,
      data.administrators.directorName, data.administrators.directorPhone,
      data.administrators.deputy1Name || '', data.administrators.deputy1Phone || '',
      data.administrators.deputy2Name || '', data.administrators.deputy2Phone || '',
      data.summary.totalStaff || 0,
      data.summary.totalMaleStudents || 0,
      data.summary.totalFemaleStudents || 0,
      data.summary.grandTotalStudents || 0,
      data.submitter ? data.submitter.submitterName || '' : '',
      data.submitter ? data.submitter.submitterPhone || '' : ''
    ]]);
  }

  // Delete old staff and student data for this school
  var staffSheet = ss.getSheetByName(config.SHEETS.STAFF);
  var staffRows = staffSheet.getDataRange().getValues();
  for (var i = staffRows.length - 1; i >= 1; i--) {
    if (staffRows[i][1] == schoolId) {
      staffSheet.deleteRow(i + 1);
    }
  }

  var studentSheet = ss.getSheetByName(config.SHEETS.STUDENT);
  var studentRows = studentSheet.getDataRange().getValues();
  for (var i = studentRows.length - 1; i >= 1; i--) {
    if (studentRows[i][1] == schoolId) {
      studentSheet.deleteRow(i + 1);
    }
  }

  // Save new staff and student data
  saveStaffData(data.staff || [], schoolId, data.school.schoolName, timestamp);
  saveStudentData(data.students || [], schoolId, data.school.schoolName, timestamp);
}

function ensureSchoolDataHeaders(sheet) {
  if (!sheet) return;

  var headers = sheet.getRange(1, 1, 1, 17).getValues()[0];
  if (!headers[15]) {
    sheet.getRange(1, 16).setValue('Submitter Name');
  }
  if (!headers[16]) {
    sheet.getRange(1, 17).setValue('Submitter Phone');
  }
  sheet.getRange(1, 1, 1, 17).setFontWeight('bold');
}

function saveStaffData(staffArray, schoolId, schoolName, timestamp) {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.SHEETS.STAFF);

  for (var i = 0; i < staffArray.length; i++) {
    var item = staffArray[i];
    sheet.appendRow([
      timestamp,
      schoolId,
      schoolName,
      item.type || 'standard',
      item.position || '',
      parseInt(item.count) || 0,
      item.detail || ''
    ]);
  }
}

function saveStudentData(studentArray, schoolId, schoolName, timestamp) {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.SHEETS.STUDENT);

  for (var i = 0; i < studentArray.length; i++) {
    var item = studentArray[i];
    sheet.appendRow([
      timestamp,
      schoolId,
      schoolName,
      item.level || '',
      parseInt(item.male) || 0,
      parseInt(item.female) || 0,
      parseInt(item.total) || 0
    ]);
  }
}

function verifyDownloadPassword(password) {
  var config = getConfig();
  var storedPassword = PropertiesService.getScriptProperties().getProperty(config.ADMIN_PASSWORD_KEY);
  return password === storedPassword;
}

function getWorkbookData(password) {
  if (!verifyDownloadPassword(password)) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var result = {};

  for (var i = 0; i < config.ALLOWED_EXPORT_SHEETS.length; i++) {
    var sheetName = config.ALLOWED_EXPORT_SHEETS[i];
    // Only allow specific sheets
    if (config.ALLOWED_EXPORT_SHEETS.indexOf(sheetName) === -1) continue;

    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      if (sheetName === config.SHEETS.SCHOOL) {
        ensureSchoolDataHeaders(sheet);
      }
      var data = normalizeWorkbookDataForClient(sheet.getDataRange().getValues());
      result[sheetName] = data;
    }
  }

  return { success: true, data: result };
}

function normalizeWorkbookDataForClient(data) {
  return data.map(function(row) {
    return row.map(function(cell) {
      if (cell instanceof Date) {
        return Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      }
      if (cell === null || cell === undefined) {
        return '';
      }
      return cell;
    });
  });
}

function getSubmittedSchools() {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  var data = sheet.getDataRange().getValues();

  var schools = [];
  for (var i = 1; i < data.length; i++) {
    schools.push({
      schoolId: data[i][1],
      schoolName: data[i][2],
      centerNo: data[i][3],
      district: data[i][4],
      timestamp: data[i][0] ? new Date(data[i][0]).toLocaleString('th-TH') : ''
    });
  }

  return {
    totalSubmitted: schools.length,
    totalSchools: null,
    schools: schools
  };
}

function getAdminSubmittedSchools(password) {
  if (!verifyDownloadPassword(password)) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  var result = getSubmittedSchools();
  result.success = true;
  return result;
}

function getSchoolSubmissionDetail(password, schoolId) {
  if (!verifyDownloadPassword(password)) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var schoolSheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  var staffSheet = ss.getSheetByName(config.SHEETS.STAFF);
  var studentSheet = ss.getSheetByName(config.SHEETS.STUDENT);
  var schoolRows = schoolSheet.getDataRange().getValues();
  var schoolRow = null;

  for (var i = 1; i < schoolRows.length; i++) {
    if (String(schoolRows[i][1]) === String(schoolId)) {
      schoolRow = schoolRows[i];
      break;
    }
  }

  if (!schoolRow) {
    return { success: false, message: 'ไม่พบข้อมูลโรงเรียนที่เลือก' };
  }

  var staff = [];
  if (staffSheet) {
    var staffRows = staffSheet.getDataRange().getValues();
    for (var s = 1; s < staffRows.length; s++) {
      if (String(staffRows[s][1]) === String(schoolId)) {
        staff.push({
          type: staffRows[s][3] || '',
          position: staffRows[s][4] || '',
          count: parseInt(staffRows[s][5]) || 0,
          detail: staffRows[s][6] || ''
        });
      }
    }
  }

  var students = [];
  if (studentSheet) {
    var studentRows = studentSheet.getDataRange().getValues();
    for (var st = 1; st < studentRows.length; st++) {
      if (String(studentRows[st][1]) === String(schoolId)) {
        students.push({
          level: studentRows[st][3] || '',
          male: parseInt(studentRows[st][4]) || 0,
          female: parseInt(studentRows[st][5]) || 0,
          total: parseInt(studentRows[st][6]) || 0
        });
      }
    }
  }

  return {
    success: true,
    school: {
      schoolId: schoolRow[1],
      schoolName: schoolRow[2],
      centerNo: schoolRow[3],
      district: schoolRow[4],
      timestamp: schoolRow[0] ? new Date(schoolRow[0]).toLocaleString('th-TH') : ''
    },
    administrators: {
      directorName: schoolRow[5] || '',
      directorPhone: schoolRow[6] || '',
      deputy1Name: schoolRow[7] || '',
      deputy1Phone: schoolRow[8] || '',
      deputy2Name: schoolRow[9] || '',
      deputy2Phone: schoolRow[10] || ''
    },
    summary: {
      totalStaff: parseInt(schoolRow[11]) || 0,
      totalMaleStudents: parseInt(schoolRow[12]) || 0,
      totalFemaleStudents: parseInt(schoolRow[13]) || 0,
      grandTotalStudents: parseInt(schoolRow[14]) || 0
    },
    submitter: {
      submitterName: schoolRow[15] || '',
      submitterPhone: schoolRow[16] || ''
    },
    staff: staff,
    students: students
  };
}
