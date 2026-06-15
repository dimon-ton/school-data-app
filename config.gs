/**
 * config.gs - Configuration constants
 * Uses Script Properties for sensitive data
 */

function getConfig() {
  return {
    SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '1hB7KnJG10LIt2QLiDb48xyuIerSySTEOZdsokocBKHU',
    SHEETS: {
      SCHOOL: 'SchoolData',
      STAFF: 'StaffData',
      STUDENT: 'StudentData',
      NEW_STAFF: 'NewStaffData'
    },
    ALLOWED_EXPORT_SHEETS: ['SchoolData', 'StaffData', 'StudentData', 'NewStaffData'],
    ADMIN_PASSWORD_KEY: 'ADMIN_PASSWORD',
    TOTAL_SCHOOLS_KEY: 'TOTAL_SCHOOLS'
  };
}

/**
 * Initialize Script Properties (run once during setup)
 */
function initializeScriptProperties(spreadsheetId, adminPassword, totalSchools) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', spreadsheetId);
  props.setProperty('ADMIN_PASSWORD', adminPassword || 'roei2admin2026');
  if (totalSchools !== undefined && totalSchools !== null && totalSchools !== '') {
    props.setProperty('TOTAL_SCHOOLS', String(totalSchools));
  } else {
    props.deleteProperty('TOTAL_SCHOOLS');
  }
}

/**
 * Initialize spreadsheet sheets with headers (run once)
 */
function initializeSheets() {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);

  // SchoolData headers
  var schoolSheet = ss.getSheetByName(config.SHEETS.SCHOOL);
  if (!schoolSheet) {
    schoolSheet = ss.insertSheet(config.SHEETS.SCHOOL);
    schoolSheet.appendRow([
      'Timestamp', 'School ID', 'School Name', 'Center No', 'District',
      'Director Name', 'Director Phone',
      'Deputy 1 Name', 'Deputy 1 Phone',
      'Deputy 2 Name', 'Deputy 2 Phone',
      'Total Staff', 'Total Male Students', 'Total Female Students', 'Grand Total Students',
      'Submitter Name', 'Submitter Phone', 'Has New Staff'
    ]);
    schoolSheet.getRange(1, 1, 1, 18).setFontWeight('bold');
  } else {
    var schoolHeaders = schoolSheet.getRange(1, 1, 1, 18).getValues()[0];
    if (!schoolHeaders[15]) {
      schoolSheet.getRange(1, 16).setValue('Submitter Name');
    }
    if (!schoolHeaders[16]) {
      schoolSheet.getRange(1, 17).setValue('Submitter Phone');
    }
    if (!schoolHeaders[17]) {
      schoolSheet.getRange(1, 18).setValue('Has New Staff');
    }
    schoolSheet.getRange(1, 1, 1, 18).setFontWeight('bold');
  }

  // StaffData headers
  var staffSheet = ss.getSheetByName(config.SHEETS.STAFF);
  if (!staffSheet) {
    staffSheet = ss.insertSheet(config.SHEETS.STAFF);
    staffSheet.appendRow([
      'Timestamp', 'School ID', 'School Name', 'Position Name', 'Count', 'Detail'
    ]);
    staffSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  // StudentData headers
  var studentSheet = ss.getSheetByName(config.SHEETS.STUDENT);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(config.SHEETS.STUDENT);
    studentSheet.appendRow([
      'Timestamp', 'School ID', 'School Name', 'Level', 'Male', 'Female', 'Total'
    ]);
    studentSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }

  // NewStaffData headers
  var newStaffSheet = ss.getSheetByName(config.SHEETS.NEW_STAFF);
  if (!newStaffSheet) {
    newStaffSheet = ss.insertSheet(config.SHEETS.NEW_STAFF);
    newStaffSheet.appendRow([
      'Timestamp', 'School ID', 'School Name', 'Name', 'Position'
    ]);
    newStaffSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // Remove default Sheet1 if exists
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  return 'Sheets initialized successfully';
}
