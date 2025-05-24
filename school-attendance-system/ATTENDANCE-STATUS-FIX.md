# Attendance Status Selection Fix

## Problem
When selecting attendance status for students (Present, Absent, Late), the status selections would revert back to "Present" when:

1. The component refreshed data automatically (polling)
2. The component became visible after being in a background tab
3. Any action that triggered a re-fetch of student data

## Root Cause
The root cause was in the `fetchStudents` function, which was always setting every student's status to "Present" when:
- Loading students from cache
- Fetching students from the API

```javascript
// Problematic code - always defaulting to "Present"
const studentsWithAttendance = cachedStudents.map(student => ({
  ...student,
  status: 'Present' // Default status for EVERY student
}));
```

## Solution
The fix preserves existing attendance status selections by:

1. Capturing current selections before refreshing data
2. Applying them back to students after fetching
3. Only defaulting to "Present" for students without existing selections

```javascript
// Create a map of current selections
const currentAttendanceMap = {};
attendanceRecords.forEach(record => {
  currentAttendanceMap[record.studentId] = record.status;
});

// Preserve existing status when mapping students
const studentsWithAttendance = studentsData.map(student => ({
  ...student,
  status: currentAttendanceMap[student.id] || 'Present' // Use existing or default to Present
}));
```

## Additional Improvements
1. Added debug logging to track status changes
2. Updated dependencies to include `attendanceRecords` for the `fetchStudents` callback
3. Added a console message when auto-refreshing student data

## Testing
To verify the fix:
1. Select a grade
2. Change some students' statuses to "Absent" or "Late" 
3. Confirm the statuses stay selected after:
   - The polling interval (5 minutes)
   - Switching tabs and coming back
   - Other actions that refresh the data
