# ระบบรวบรวมข้อมูลสถานศึกษา - Full Specification

This is a Google Apps Script web app for school data collection (ระบบรวบรวมข้อมูลสถานศึกษา).

## Requirements:
- Web app form built with Google Apps Script
- Google Sheets as database (3 sheets: SchoolData, StaffData, StudentData)
- Bootstrap 5 + SweetAlert2 + SheetJS (XLSX.js) for frontend
- Responsive design (mobile-first)
- School info form, admin info form, staff form (with dynamic positions), student count form
- Auto-calculate totals
- Password-protected admin data viewer with Excel download inside the viewer modal
- Check submitted schools feature
- Duplicate submission check with update option

## File Structure:
- Code.gs - Backend: doGet, include, saveFormData, getWorkbookData, verifyDownloadPassword, getSubmittedSchools, getAdminSubmittedSchools, getSchoolSubmissionDetail
- config.gs - Constants: SPREADSHEET_ID, sheet names, allowed sheets for export
- index.html - Main HTML with Bootstrap, SweetAlert2, SheetJS
- css.html - Custom CSS
- js.html - Client-side JavaScript

## Data Structure:
SchoolData sheet columns: Timestamp, School ID, School Name, Center No, District, Director Name, Director Phone, Deputy 1 Name, Deputy 1 Phone, Deputy 2 Name, Deputy 2 Phone, Total Staff, Total Male Students, Total Female Students, Grand Total Students, Submitter Name, Submitter Phone

StaffData sheet columns: Timestamp, School ID, School Name, Position Type, Position Name, Count, Detail
Position Type values: standard, extra

StudentData sheet columns: Timestamp, School ID, School Name, Level, Male, Female, Total
Level values: อนุบาล, ประถมศึกษา, มัธยมศึกษาตอนต้น, รวมทั้งหมด

## JSON format sent from frontend:
```json
{
  "school": {"schoolName": "", "centerNo": "", "district": ""},
  "administrators": {"directorName": "", "directorPhone": "", "deputy1Name": "", "deputy1Phone": "", "deputy2Name": "", "deputy2Phone": ""},
  "submitter": {"submitterName": "", "submitterPhone": ""},
  "staff": [{"type": "standard/extra", "position": "", "count": 0, "detail": ""}],
  "students": [{"level": "", "male": 0, "female": 0, "total": 0}],
  "summary": {"totalStaff": 0, "totalMaleStudents": 0, "totalFemaleStudents": 0, "grandTotalStudents": 0}
}
```

## Standard Staff Positions:
- ข้าราชการครูผู้สอน
- พนักงานราชการ
- ครูอัตราจ้าง
- ครูพี่เลี้ยงเด็กพิการ
- นักการภารโรง
- ธุรการ

## Student Levels:
- อนุบาล (Kindergarten)
- ประถมศึกษา (Primary)
- มัธยมศึกษาตอนต้น (Lower Secondary)

## Frontend Cards:
1. Header: ระบบรวบรวมข้อมูลสถานศึกษา
2. Admin data viewer button (password protected, includes Excel download)
3. Check submitted schools button
4. School info card (school name, center no, district, submitter name, submitter phone)
5. Administrator card (director, phone, deputy 1&2)
6. Staff card (one combined position table with fixed positions and add-position rows)
7. Student count card (kindergarten, primary, secondary with male/female/total)
8. Footer: Save + Clear buttons

## SweetAlert2 notifications:
- Incomplete form: กรุณากรอกข้อมูลให้ครบถ้วน
- Confirm save: ยืนยันการบันทึกข้อมูลหรือไม่?
- Save success: บันทึกข้อมูลเรียบร้อยแล้ว
- Save error: ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง
- Admin viewer password prompt
- Wrong password: รหัสผ่านไม่ถูกต้อง
- Submitted schools list
- Submitted school detail viewer

## Backend Functions (Code.gs):
- doGet() - render web app
- include(filename) - include HTML files  
- generateSchoolId() - generate unique school ID
- saveFormData(data) - main save function
- saveSchoolData(data, schoolId, timestamp)
- saveStaffData(staffArray, schoolId, schoolName, timestamp)
- saveStudentData(studentArray, schoolId, schoolName, timestamp)
- verifyDownloadPassword(password)
- getWorkbookData(password) - returns data for Excel generation
- getSubmittedSchools()
- getAdminSubmittedSchools(password) - password-protected submitted school list for admin viewer
- getSchoolSubmissionDetail(password, schoolId) - password-protected submitted data detail for one school

## Security:
- Password stored in Script Properties (ADMIN_PASSWORD)
- SPREADSHEET_ID stored in Script Properties
- Exact total school count is not required; submitted-school status shows the submitted count only
- Password verification on server side only
- Only allowed sheets for export (SchoolData, StaffData, StudentData)

## Duplicate Check:
When saving, check if school name + center no already exists
If found, show SweetAlert: พบข้อมูลของโรงเรียนนี้ในระบบแล้ว ต้องการอัปเดตข้อมูลเดิมหรือไม่?
Options: อัปเดตข้อมูลเดิม / ยกเลิก

## UI Theme:
- Primary: #0d6efd
- Success: #198754
- Warning: #ffc107
- Danger: #dc3545
- Card: Shadow, Rounded Corner 12px border-radius
- Mobile-first responsive (col-12 col-md-6 col-lg-4)
- Loading state: กำลังบันทึกข้อมูล... with spinner
- Success state: บันทึกข้อมูลเรียบร้อยแล้ว with กรอกข้อมูลใหม่ button

## Client Functions (js.html):
- addExtraStaffRow()
- removeExtraStaffRow(rowId)
- calculateStaffTotal()
- calculateStudentTotal()
- collectFormData()
- collectStaffData()
- collectStudentData()
- validateFormData()
- submitForm()
- resetForm()
- openAdminDataViewer()
- loadAdminSubmittedSchools()
- showSchoolSubmissionDetail(schoolId)
- downloadExcel()
- createWorkbook()
- showSubmittedSchools()
- searchSubmittedSchool()

## Validation:
Required: schoolName, centerNo, district, submitterName, submitterPhone, directorName, directorPhone
Numbers must be >= 0
Phone: 9-10 digits
Extra positions must have a name if count is provided
Details/notes can be empty
Deputy fields can be empty

## Deployment:
- Execute As: Me
- Who Has Access: Anyone with the link
