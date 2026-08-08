/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, Submission, AttendanceRecord, User, SchoolClass, Student } from '../types';

/**
 * Utility to generate and trigger download of CSV report
 */
export const downloadAdminReportCSV = (
  school: School | null,
  submissions: Submission[],
  attendance: AttendanceRecord[],
  users: User[],
  classes: SchoolClass[],
  students: Student[]
) => {
  const exportDate = new Date().toLocaleString();
  const schoolName = school?.name || 'School Management System';

  // Helper to escape CSV fields
  const escapeCsv = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvRows: string[] = [];

  // Header Section: Metadata
  csvRows.push(`=== ${schoolName.toUpperCase()} ACADEMIC EXECUTIVE REPORT ===`);
  csvRows.push(`Export Date,${escapeCsv(exportDate)}`);
  csvRows.push(`Academic Session,${escapeCsv(school?.academicSession || 'N/A')}`);
  csvRows.push(`Academic Term,${escapeCsv(school?.academicTerm || 'N/A')}`);
  csvRows.push(`Total Teachers,${users.filter(u => u.role === 'TEACHER').length}`);
  csvRows.push(`Total Classes,${classes.length}`);
  csvRows.push(`Total Students Enrolled,${students.length}`);
  csvRows.push(''); // Blank line

  // Section 1: Submissions Overview
  csvRows.push('=== ACADEMIC SUBMISSIONS SUMMARY ===');
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const revisionSubmissions = submissions.filter(s => s.status === 'REVISION_REQUESTED').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED').length;
  const approvalRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 100;

  csvRows.push(`Total Submissions,${totalSubmissions}`);
  csvRows.push(`Approved Submissions,${approvedSubmissions}`);
  csvRows.push(`Pending Review,${pendingSubmissions}`);
  csvRows.push(`Revisions / Rejected,${revisionSubmissions + rejectedSubmissions}`);
  csvRows.push(`Approval Rate,${approvalRate}%`);
  csvRows.push('');

  // Submissions Detail Table
  csvRows.push('=== SUBMISSIONS DETAIL LIST ===');
  csvRows.push([
    'Submission ID',
    'Date Submitted',
    'Teacher Name',
    'Class',
    'Subject',
    'Document Type',
    'Title / Topic',
    'Status',
    'Reviewed Date',
    'Admin Feedback'
  ].map(escapeCsv).join(','));

  submissions.forEach(sub => {
    csvRows.push([
      sub.id,
      sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A',
      sub.teacherName,
      sub.className,
      sub.subject,
      sub.type,
      sub.title,
      sub.status,
      sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : 'N/A',
      sub.adminFeedback || 'N/A'
    ].map(escapeCsv).join(','));
  });

  csvRows.push(''); // Blank line

  // Section 2: Attendance Summary & Logs
  csvRows.push('=== ATTENDANCE SUMMARY & LOGS ===');
  
  let totalRecords = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalExcused = 0;

  attendance.forEach(att => {
    att.records.forEach(r => {
      totalRecords++;
      if (r.status === 'PRESENT') totalPresent++;
      else if (r.status === 'ABSENT') totalAbsent++;
      else if (r.status === 'LATE') totalLate++;
      else if (r.status === 'EXCUSED') totalExcused++;
    });
  });

  const overallAttendanceRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 100;

  csvRows.push(`Total Attendance Log Entries,${attendance.length}`);
  csvRows.push(`Total Student Register Checks,${totalRecords}`);
  csvRows.push(`Present Marks,${totalPresent}`);
  csvRows.push(`Late Marks,${totalLate}`);
  csvRows.push(`Absent Marks,${totalAbsent}`);
  csvRows.push(`Excused Marks,${totalExcused}`);
  csvRows.push(`Overall Attendance Rate,${overallAttendanceRate}%`);
  csvRows.push('');

  // Attendance Detail Table
  csvRows.push('=== ATTENDANCE SESSION BREAKDOWN ===');
  csvRows.push([
    'Attendance ID',
    'Date',
    'Class',
    'Subject',
    'Marked By Teacher',
    'Total Students',
    'Present Count',
    'Late Count',
    'Absent Count',
    'Excused Count',
    'Class Attendance Rate %'
  ].map(escapeCsv).join(','));

  attendance.forEach(att => {
    const present = att.records.filter(r => r.status === 'PRESENT').length;
    const late = att.records.filter(r => r.status === 'LATE').length;
    const absent = att.records.filter(r => r.status === 'ABSENT').length;
    const excused = att.records.filter(r => r.status === 'EXCUSED').length;
    const total = att.records.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    csvRows.push([
      att.id,
      att.date,
      att.className,
      att.subject || 'General Register',
      att.teacherName,
      total,
      present,
      late,
      absent,
      excused,
      `${rate}%`
    ].map(escapeCsv).join(','));
  });

  // Create CSV Blob and trigger download link
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizeFilename = (schoolName || 'school').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${sanitizeFilename}_academic_report_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Utility to generate and trigger download of filtered submissions CSV report
 */
export const downloadSubmissionsCSV = (
  submissions: Submission[],
  filenamePrefix: string = 'submissions_report'
) => {
  const exportDate = new Date().toLocaleString();

  const escapeCsv = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvRows: string[] = [];

  // Header Metadata
  csvRows.push(`=== ACADEMIC SUBMISSIONS EXPORT ===`);
  csvRows.push(`Export Date,${escapeCsv(exportDate)}`);
  csvRows.push(`Total Records Exported,${submissions.length}`);
  csvRows.push(''); // Blank line

  // Header Row
  csvRows.push([
    'Submission ID',
    'Date Submitted',
    'Timestamp',
    'Teacher Name',
    'Class',
    'Subject',
    'Document Type',
    'Title / Topic',
    'Quality Score',
    'Status',
    'Reviewed Date',
    'Admin Feedback'
  ].map(escapeCsv).join(','));

  submissions.forEach(sub => {
    const createdDate = sub.createdAt ? new Date(sub.createdAt) : null;
    const reviewedDate = sub.reviewedAt ? new Date(sub.reviewedAt) : null;

    csvRows.push([
      sub.id,
      createdDate ? createdDate.toLocaleDateString() : 'N/A',
      createdDate ? createdDate.toLocaleTimeString() : 'N/A',
      sub.teacherName,
      sub.className,
      sub.subject,
      sub.type,
      sub.title,
      sub.qualityScore !== undefined ? `${sub.qualityScore}%` : 'N/A',
      sub.status,
      reviewedDate ? reviewedDate.toLocaleString() : 'N/A',
      sub.adminFeedback || 'N/A'
    ].map(escapeCsv).join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStamp = new Date().toISOString().split('T')[0];
  const cleanPrefix = filenamePrefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${cleanPrefix}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
