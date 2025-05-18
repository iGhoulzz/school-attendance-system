import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Get saved language from local storage or default to English
const savedLanguage = typeof window !== 'undefined' ? 
  localStorage.getItem('language') || 'en' : 'en';

// Set document direction for RTL support
if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
}

const resources = {en: {
    translation: {      
      "welcomeMessage": "Welcome to Our School",
      "description": "A brief description about the school and its values goes here.",
      "contactUs": "Contact us",
      "address": "Address",
      "logo": "[Logo]",
      "emailPlaceholder": "Email",
      "passwordPlaceholder": "Password",
      "loginButton": "Login",
      "loggingIn": "Logging in...",
      "loginError": "Login failed. Please check your credentials and try again.",
      "forgotPassword": "Forgot Password?",
      
      // Home page content
      "schoolAttendanceSystem": "School Attendance System",
      "modernSchoolAttendanceSystem": "Modern School Attendance System",
      "homeHeroSubtitle": "Streamline attendance tracking, generate insightful reports, and improve communication with parents, all in one powerful platform.",
      "getStarted": "Get Started",
      "learnMore": "Learn More",
      "designedForModernEducation": "Designed for Modern Education",
      "attendanceSystemHelps": "Our attendance system helps schools streamline operations and improve student outcomes.",
      "realTimeAttendance": "Real-time Attendance",
      "realTimeAttendanceDesc": "Record and monitor attendance in real-time with our intuitive interface, designed for quick and accurate tracking.",
      "automatedNotifications": "Automated Notifications",
      "automatedNotificationsDesc": "Send automatic alerts to parents when students are absent, improving communication and reducing administrative workload.",
      "comprehensiveReports": "Comprehensive Reports",
      "comprehensiveReportsDesc": "Generate detailed attendance reports and analytics to identify patterns and improve student attendance rates.",
      "easyManagement": "Easy Management",
      "easyManagementDesc": "Manage students, teachers, and classes all in one place with our user-friendly administrative dashboard.",

      // Dashboard related
      "Dashboard": "Dashboard",
      "todayAttendance": "Today's Attendance",
      "totalStudents": "Total Students",
      "absentToday": "Absent Today",
      "activeEnrollment": "Active Enrollment",
      "presentToday": "{{count}} Students Present",
      "absentCount": "Students Absent",
      "recentActivity": "Recent Activity",
      "noRecentActivity": "No recent activity",
      "attendanceRecordActivity": "Grade {{grade}} attendance recorded by {{teacher}} on {{date}} (Present: {{present}}, Absent: {{absent}})",

      "RecordAttendance": "Record Attendance",
      "AttendanceReports": "Attendance Reports",
      "StudentManagement": "Student Management",
      "TeacherManagement": "Teacher Management",
      "Settings": "Settings",
      "Logout": "Logout",
      "User": "User",
      "WelcomeUser": "Welcome, {{userName}}",

      // Additional keys for internal pages (generic terms)
      "adjustPreferences": "Adjust your preferences below:",
      "FirstName": "First Name",
      "Surname": "Surname",
      "Name": "Name",
      "ParentName": "Parent Name",
      "ParentEmail": "Parent Email",
      "ParentPhone": "Parent Phone",
      "Grade": "Grade",      "attendanceStatus": {
        "present": "Present",
        "absent": "Absent",
        "late": "Late"
      },

      // Teacher Management page keys
      "AddTeacherButton": "Add Teacher",
      "TeachersList": "Teachers List",
      "teacherCreatedSuccessfully": "Teacher created successfully",
      "teacherDeletedSuccessfully": "Teacher deleted successfully",
      "errorFetchingTeachers": "Error fetching teachers",
      "errorCreatingTeacher": "Error creating teacher",
      "errorDeletingTeacher": "Error deleting teacher",
      "noTeachersFound": "No teachers found",
      "Loading": "Loading...",
      "Adding": "Adding...",
      "Deleting": "Deleting...",
      "Delete": "Delete",

      // Student Management page keys
      "SearchStudentsPlaceholder": "Search students by name or ID...",
      "errorFetchingStudents": "Error fetching students",
      "studentCreatedSuccessfully": "Student created successfully",
      "errorCreatingStudent": "Error creating student",
      "studentDeletedSuccessfully": "Student deleted successfully",
      "errorDeletingStudent": "Error deleting student",
      "noStudentsFound": "No students found",

      // Attendance Reports page keys
      "TotalStudents": "Total Students",
      "AbsentStudents": "Absent Students",
      "Date": "Date",
      "SelectDate": "Select Date:",
      "Present": "Present",
      "Absent": "Absent",
      "RecordedBy": "Recorded by",
      "StudentName": "Student Name",
      "Status": "Status",
      "DownloadPDF": "Download PDF",
      "SendAlertEmails": "Send Alert Emails",
      "ClearAttendanceRecords": "Clear Attendance Records",
      "mustBeLoggedInToViewReports": "You must be logged in to view attendance reports.",
      "noAttendanceRecordsFoundForDate": "No attendance records found for this date.",
      "errorFetchingAttendanceRecords": "Error fetching attendance records.",
      "errorFetchingStudentDetails": "Error fetching student details.",
      "confirmDeleteAllAttendanceForDate": "Are you sure you want to delete all attendance records for this date?",
      "mustBeLoggedInToPerformAction": "You must be logged in to perform this action.",
      "attendanceRecordsDeletedSuccessfully": "Attendance records deleted successfully.",
      "errorDeletingAttendanceRecords": "Error deleting attendance records.",
      "confirmSendEmailAlerts": "Are you sure you want to send email alerts to parents of absent students?",
      "alertEmailsSentSuccessfully": "Alert emails sent successfully.",
      "errorSendingAlertEmails": "Error sending alert emails.",
      "YourSchoolName": "Your School Name",
      "AttendanceReportFor": "Attendance Report for",
      "AuthorizedSignature": "Authorized Signature",

      // Record Attendance page keys
      "SelectGrade": "Select Grade:",
      "selectAGrade": "Select a grade",
      "MarkAllPresent": "Mark All Present",
      "MarkAllAbsent": "Mark All Absent",
      "MarkAllLate": "Mark All Late",
      "SubmitAttendance": "Submit Attendance",
      "attendanceRecordedSuccessfully": "Attendance recorded successfully.",      "errorRecordingAttendance": "Error recording attendance.",
      "errorFetchingGrades": "Error fetching grades.",
      "UnknownStudent": "Unknown Student",

      // StudentDetail keys
      "editStudent": "Edit Student",
      "errorFetchingStudentData": "Error fetching student data.",
      "studentUpdatedSuccessfully": "Student updated successfully.",
      "errorUpdatingStudent": "Error updating student.",
      "loading": "Loading",
      "ID": "ID",
      "dateAdded": "Date Added",
      "saving": "Saving...",
      "save": "Save",
      "cancel": "Cancel",      // Access Denied
      "accessDeniedOnlyAdmins": "Access Denied: Only admins can manage teachers.",
      "welcomeToDashboard": "Welcome to the Dashboard!",

      // Admin Management
      "adminManagement": "Admin Management",
      "addNewAdmin": "Add New Admin",
      "confirmPassword": "Confirm Password",
      "passwordsDoNotMatch": "Passwords do not match",
      "adminCreatedSuccessfully": "Admin created successfully",
      "adminDeletedSuccessfully": "Admin deleted successfully",
      "errorCreatingAdmin": "Error creating admin",
      "errorDeletingAdmin": "Error deleting admin",
      "errorFetchingAdmins": "Error fetching admins",
      "noAdminsFound": "No admins found",
      "deleteAdmin": "Delete Admin",
      "creating": "Creating...",
      "create": "Create",
      "actions": "Actions",      // Reset Password
      "resetPassword": "Reset Password",
      "forgotPassword": "Forgot Password?",
      "newPassword": "New Password",
      "confirmPassword": "Confirm Password",
      "passwordsDoNotMatch": "Passwords do not match",
      "resetLinkSent": "Password reset link has been sent to your email",
      "errorRequestingReset": "Error requesting password reset",
      "errorResettingPassword": "Error resetting password",
      "passwordResetSuccess": "Password has been reset successfully",
      "sendResetLink": "Send Reset Link",
      "backToLogin": "Back to Login",
      "email": "Email",

      // Language key
      "Language": "Language"
    }
  },  ar: {
    translation: {
      "welcomeMessage": "مرحبًا بكم في مدرستنا",
      "description": "وصف موجز عن المدرسة وقيمها يذهب هنا.",
      "contactUs": "تواصل معنا",
      "address": "العنوان",
      "logo": "[شعار]",
      "emailPlaceholder": "البريد الإلكتروني",
      "passwordPlaceholder": "كلمة المرور",
      "loginButton": "تسجيل الدخول",
      
      // Home page content
      "schoolAttendanceSystem": "نظام حضور المدرسة",
      "modernSchoolAttendanceSystem": "نظام حضور المدرسة الحديث",
      "homeHeroSubtitle": "تبسيط تتبع الحضور، وإنشاء تقارير مفيدة، وتحسين التواصل مع أولياء الأمور، كل ذلك في منصة واحدة قوية.",
      "getStarted": "ابدأ الآن",
      "learnMore": "اعرف المزيد",
      "designedForModernEducation": "مصمم للتعليم الحديث",
      "attendanceSystemHelps": "يساعد نظام الحضور لدينا المدارس على تبسيط العمليات وتحسين نتائج الطلاب.",
      "realTimeAttendance": "حضور في الوقت الحقيقي",
      "realTimeAttendanceDesc": "سجل وراقب الحضور في الوقت الحقيقي مع واجهتنا البديهية، المصممة للتتبع السريع والدقيق.",
      "automatedNotifications": "إشعارات آلية",
      "automatedNotificationsDesc": "أرسل تنبيهات تلقائية للوالدين عندما يكون الطلاب غائبين، وتحسين الاتصال وتقليل عبء العمل الإداري.",
      "comprehensiveReports": "تقارير شاملة",
      "comprehensiveReportsDesc": "أنشئ تقارير حضور مفصلة وتحليلات لتحديد الأنماط وتحسين معدلات حضور الطلاب.",
      "easyManagement": "إدارة سهلة",
      "easyManagementDesc": "إدارة الطلاب والمعلمين والفصول الدراسية في مكان واحد باستخدام لوحة الإدارة سهلة الاستخدام.",
      
      // Footer content
      "quickLinks": "روابط سريعة",
      "support": "الدعم",
      "helpCenter": "مركز المساعدة",
      "faq": "الأسئلة الشائعة",
      "privacyPolicy": "سياسة الخصوصية",
      "termsConditions": "الشروط والأحكام",
      "features": "الميزات",
      "about": "عن النظام",
      "home": "الرئيسية",
      "contact": "اتصل بنا",
      "login": "تسجيل الدخول",
      "allRightsReserved": "جميع الحقوق محفوظة",
      "footerDescription": "نظام سهل الاستخدام لتسجيل الحضور وإدارة الطلاب وإنشاء التقارير.",

      // Dashboard related
      "Dashboard": "لوحة التحكم",
      "todayAttendance": "حضور اليوم",
      "totalStudents": "إجمالي الطلاب",
      "absentToday": "غائبون اليوم",
      "activeEnrollment": "التحاق نشط",
      "presentToday": "{{count}} طالب حاضر",
      "absentCount": "الطلاب الغائبون",
      "recentActivity": "نشاطات حديثة",
      "noRecentActivity": "لا توجد نشاطات حديثة",
      "attendanceRecordActivity": "تم تسجيل حضور الصف {{grade}} بواسطة {{teacher}} في {{date}} (حاضر: {{present}}, غائب: {{absent}})",

      "RecordAttendance": "تسجيل الحضور",
      "AttendanceReports": "تقارير الحضور",
      "StudentManagement": "إدارة الطلاب",
      "TeacherManagement": "إدارة المعلمين",
      "Settings": "الإعدادات",
      "Logout": "تسجيل خروج",
      "User": "مستخدم",
      "WelcomeUser": "مرحباً, {{userName}}",

      // Additional keys for internal pages (generic terms)
      "adjustPreferences": "قم بضبط تفضيلاتك أدناه:",
      "FirstName": "الاسم",
      "Surname": "اللقب",
      "Name": "الاسم",
      "ParentName": "اسم ولي الأمر",
      "ParentEmail": "بريد ولي الأمر الإلكتروني",
      "ParentPhone": "هاتف ولي الأمر",
      "Grade": "الصف",      "attendanceStatus": {
        "present": "حاضر",
        "absent": "غائب",
        "late": "متأخر"
      },

      // Teacher Management page keys
      "AddTeacherButton": "إضافة معلم",
      "TeachersList": "قائمة المعلمين",
      "teacherCreatedSuccessfully": "تم إنشاء المعلم بنجاح",
      "teacherDeletedSuccessfully": "تم حذف المعلم بنجاح",
      "errorFetchingTeachers": "خطأ في جلب المعلمين",
      "errorCreatingTeacher": "خطأ في إنشاء المعلم",
      "errorDeletingTeacher": "خطأ في حذف المعلم",
      "noTeachersFound": "لم يتم العثور على معلمين",
      "Loading": "جاري التحميل...",
      "Adding": "جاري الإضافة...",
      "Deleting": "جاري الحذف...",
      "Delete": "حذف",

      // Student Management page keys
      "SearchStudentsPlaceholder": "ابحث عن الطلاب بالاسم أو الرقم...",
      "errorFetchingStudents": "خطأ في جلب الطلاب",
      "studentCreatedSuccessfully": "تم إنشاء الطالب بنجاح",
      "errorCreatingStudent": "خطأ في إنشاء الطالب",
      "studentDeletedSuccessfully": "تم حذف الطالب بنجاح",
      "errorDeletingStudent": "خطأ في حذف الطالب",
      "noStudentsFound": "لم يتم العثور على طلاب",

      // Attendance Reports page keys
      "TotalStudents": "إجمالي الطلاب",
      "AbsentStudents": "الطلاب الغائبون",
      "Date": "التاريخ",
      "RecordedBy": "تم التسجيل بواسطة",
      "StudentName": "اسم الطالب",
      "Status": "الحالة",
      "SelectDate": "اختر التاريخ:",
      "Present": "حاضر",
      "Absent": "غائب",
      "DownloadPDF": "تحميل PDF",
      "SendAlertEmails": "إرسال تنبيهات بالبريد الإلكتروني",
      "ClearAttendanceRecords": "مسح سجلات الحضور",
      "mustBeLoggedInToViewReports": "يجب تسجيل الدخول لعرض تقارير الحضور.",
      "noAttendanceRecordsFoundForDate": "لم يتم العثور على سجلات حضور لهذا التاريخ.",
      "errorFetchingAttendanceRecords": "خطأ في جلب سجلات الحضور.",
      "errorFetchingStudentDetails": "خطأ في جلب تفاصيل الطالب.",
      "confirmDeleteAllAttendanceForDate": "هل أنت متأكد أنك تريد حذف جميع سجلات الحضور لهذا التاريخ؟",
      "mustBeLoggedInToPerformAction": "يجب تسجيل الدخول للقيام بهذا الإجراء.",
      "attendanceRecordsDeletedSuccessfully": "تم حذف سجلات الحضور بنجاح.",
      "errorDeletingAttendanceRecords": "خطأ في حذف سجلات الحضور.",
      "confirmSendEmailAlerts": "هل أنت متأكد أنك تريد إرسال تنبيهات بالبريد الإلكتروني لأولياء أمور الطلاب الغائبين؟",
      "alertEmailsSentSuccessfully": "تم إرسال تنبيهات البريد الإلكتروني بنجاح.",
      "errorSendingAlertEmails": "خطأ في إرسال تنبيهات البريد الإلكتروني.",
      "YourSchoolName": "مدرستك",
      "AttendanceReportFor": "تقرير الحضور عن",
      "AuthorizedSignature": "توقيع معتمد",

      // Record Attendance page keys
      "SelectGrade": "اختر الصف:",
      "selectAGrade": "اختر صفاً",
      "MarkAllPresent": "وضع الجميع حاضر",
      "MarkAllAbsent": "وضع الجميع غائب",
      "MarkAllLate": "وضع الجميع متأخر",
      "SubmitAttendance": "تسجيل الحضور",
      "attendanceRecordedSuccessfully": "تم تسجيل الحضور بنجاح.",
      "errorRecordingAttendance": "خطأ في تسجيل الحضور.",
      "UnknownStudent": "طالب غير معروف",

      // StudentDetail keys
      "editStudent": "تعديل الطالب",
      "errorFetchingStudentData": "خطأ في جلب بيانات الطالب.",
      "studentUpdatedSuccessfully": "تم تحديث الطالب بنجاح.",
      "errorUpdatingStudent": "خطأ في تحديث بيانات الطالب.",
      "loading": "جارٍ التحميل",
      "ID": "المعرف",
      "dateAdded": "تاريخ الإضافة",
      "saving": "جارٍ الحفظ...",
      "save": "حفظ",
      "cancel": "إلغاء",      // Access Denied
      "accessDeniedOnlyAdmins": "الوصول مرفوض: يمكن للمسؤولين فقط إدارة المعلمين.",
      "welcomeToDashboard": "مرحباً في لوحة التحكم!",
      
      // Admin Management
      "AdminManagement": "إدارة المسؤولين",
      "adminManagement": "إدارة المسؤولين",
      "addNewAdmin": "إضافة مسؤول جديد",
      "confirmPassword": "تأكيد كلمة المرور",
      "passwordsDoNotMatch": "كلمات المرور غير متطابقة",
      "adminCreatedSuccessfully": "تم إنشاء المسؤول بنجاح",
      "adminDeletedSuccessfully": "تم حذف المسؤول بنجاح",
      "errorCreatingAdmin": "خطأ في إنشاء المسؤول",
      "errorDeletingAdmin": "خطأ في حذف المسؤول",
      "errorFetchingAdmins": "خطأ في جلب المسؤولين",
      "noAdminsFound": "لم يتم العثور على مسؤولين",
      "deleteAdmin": "حذف المسؤول",
      "creating": "جاري الإنشاء...",
      "create": "إنشاء",
      "actions": "إجراءات",

      // Language key
      "Language": "اللغة"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // Use saved language or default to 'en'
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;




