/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Submission, School, StudentAttendanceItem, Student, StudentReportCard, SchoolClass } from '../types';

export function generateAttendancePDF(
  className: string,
  date: string,
  teacherName: string,
  items: StudentAttendanceItem[],
  school?: School | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  // Header Banner
  const drawHeader = () => {
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(school?.name || 'TeXora Academic Platform', pageWidth / 2, 11, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(school?.motto || 'Excellence, Character & Innovation', pageWidth / 2, 17, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${school?.academicSession || '2025/2026 Academic Session'}  •  ${school?.academicTerm || 'First Term'}`, pageWidth / 2, 22, { align: 'center' });
  };

  drawHeader();
  y = 34;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL DAILY ATTENDANCE REGISTER', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Summary Metadata Box
  const total = items.length;
  const present = items.filter(i => i.status === 'PRESENT').length;
  const late = items.filter(i => i.status === 'LATE').length;
  const absent = items.filter(i => i.status === 'ABSENT').length;
  const excused = items.filter(i => i.status === 'EXCUSED').length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Class: ${className}`, 18, y + 6);
  doc.text(`Date: ${date}`, 75, y + 6);
  doc.text(`Recorded By: ${teacherName}`, 135, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Enrolled: ${total} | Present: ${present} | Late: ${late} | Absent: ${absent} | Excused: ${excused}`, 18, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`Attendance Rate: ${rate}%`, 18, y + 18);

  y += 28;

  // Table Header
  const colX = { sn: 16, name: 30, status: 110, remarks: 145 };
  const drawTableHeader = (curY: number) => {
    doc.setFillColor(226, 232, 240); // Slate 200
    doc.rect(14, curY, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text('S/N', colX.sn, curY + 5.5);
    doc.text('STUDENT NAME', colX.name, curY + 5.5);
    doc.text('STATUS', colX.status, curY + 5.5);
    doc.text('REMARKS / REASON', colX.remarks, curY + 5.5);
  };

  drawTableHeader(y);
  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    if (y > pageHeight - 45) {
      doc.addPage();
      drawHeader();
      y = 34;
      drawTableHeader(y);
      y += 8;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 7, pageWidth - 14, y + 7);

    doc.setTextColor(71, 85, 105);
    doc.text(String(index + 1), colX.sn, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.studentName, colX.name, y + 5);

    if (item.status === 'PRESENT') doc.setTextColor(16, 185, 129);
    else if (item.status === 'LATE') doc.setTextColor(245, 158, 11);
    else if (item.status === 'ABSENT') doc.setTextColor(225, 29, 72);
    else doc.setTextColor(2, 132, 199);

    doc.text(item.status, colX.status, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const remarkText = item.note || '-';
    const truncatedRemark = doc.splitTextToSize(remarkText, 45)[0] || '-';
    doc.text(truncatedRemark, colX.remarks, y + 5);

    y += 7;
  });

  // Footer & Filing Signatures
  y += 10;
  if (y > pageHeight - 35) {
    doc.addPage();
    drawHeader();
    y = 40;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PHYSICAL FILING & AUTHORIZATION', 14, y);
  y += 15;

  doc.line(14, y, 75, y);
  doc.line(130, y, 190, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Class Teacher Signature & Date', 14, y + 4);
  doc.text('School Head / Principal Signature & Stamp', 130, y + 4);

  doc.setFontSize(7);
  doc.text(`Generated on ${new Date().toLocaleString()}  •  Official School Archive Copy`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const filename = `Attendance_${className.replace(/\s+/g, '_')}_${date}.pdf`;
  doc.save(filename);
}

export function generateSubmissionPDF(submission: Submission, school?: School | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner / School Info
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(school?.name || 'TeXora Academic System', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(school?.motto || 'Excellence, Character & Innovation', pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${school?.academicSession || '2025/2026'} - ${school?.academicTerm || 'First Term'}`, pageWidth / 2, 23, { align: 'center' });

  y = 36;

  // Document Title & Metadata Box
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 22, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(submission.type.replace('_', ' ') + ': ' + submission.title, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Teacher: ${submission.teacherName}   |   Class: ${submission.className}   |   Subject: ${submission.subject}`, 18, y + 14);
  doc.text(`Status: ${submission.status}   |   Submitted: ${new Date(submission.createdAt).toLocaleDateString()}`, 18, y + 19);

  y += 28;

  // Render specific content
  if (submission.type === 'LESSON_NOTE' && submission.lessonNoteContent) {
    const note = submission.lessonNoteContent;

    // Overview Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Week ${note.weekNumber}  •  Duration: ${note.durationMinutes} Mins`, 14, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Topic: ', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(note.topic + (note.subTopic ? ` (${note.subTopic})` : ''), 30, y);
    y += 8;

    // Behavioral Objectives
    doc.setFillColor(238, 242, 255); // Indigo light
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('BEHAVIORAL OBJECTIVES', 18, y + 4.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    note.behavioralObjectives.forEach((obj, idx) => {
      doc.text(`${idx + 1}. ${obj}`, 18, y);
      y += 5;
    });

    y += 3;

    // Instructional Materials
    doc.setFillColor(238, 242, 255);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('INSTRUCTIONAL MATERIALS & TEACHING AIDS', 18, y + 4.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text(note.instructionalMaterials.join(', '), 18, y);
    y += 8;

    // Content Steps
    doc.setFillColor(238, 242, 255);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('TEACHING METHODOLOGY & PRESENTATION STEPS', 18, y + 4.5);
    y += 9;

    note.coreContentSteps.forEach((step) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${step.title}`, 18, y);
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Teacher Activity: ', 22, y);
      doc.setFont('helvetica', 'normal');
      const teacherLines = doc.splitTextToSize(step.teacherActivity, pageWidth - 60);
      doc.text(teacherLines, 50, y);
      y += teacherLines.length * 4 + 2;

      doc.setFont('helvetica', 'bold');
      doc.text('Student Activity: ', 22, y);
      doc.setFont('helvetica', 'normal');
      const studentLines = doc.splitTextToSize(step.studentActivity, pageWidth - 60);
      doc.text(studentLines, 50, y);
      y += studentLines.length * 4 + 4;
    });

    // Evaluation & Assignment
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(238, 242, 255);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('EVALUATION & ASSIGNMENT', 18, y + 4.5);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Evaluation Questions:', 18, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    note.evaluationQuestions.forEach((q, i) => {
      doc.text(`Q${i + 1}: ${q}`, 22, y);
      y += 5;
    });

    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Assignment / Homework:', 18, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(note.assignment, 22, y);
    y += 8;

  } else if (submission.type === 'LESSON_PLAN' && submission.lessonPlanContent) {
    const plan = submission.lessonPlanContent;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Week ${plan.weekNumber} Lesson Plan`, 14, y);
    y += 8;

    doc.text('Learning Objectives:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    plan.learningObjectives.forEach((obj, idx) => {
      doc.text(`• ${obj}`, 18, y);
      y += 5;
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Teaching Strategies:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.teachingStrategies.join(', '), 50, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Differentiation Plan:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.differentiationPlan, 18, y + 5);
    y += 12;

  } else if (submission.type === 'WEEKLY_DIARY' && submission.weeklyDiaryContent) {
    const diary = submission.weeklyDiaryContent;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Weekly Teaching Diary - Week ${diary.weekNumber}`, 14, y);
    y += 8;

    doc.text(`Period: ${diary.startDate} to ${diary.endDate}`, 14, y);
    doc.text(`Estimated Comprehension Rate: ${diary.comprehensionRatePercent}%`, 110, y);
    y += 8;

    doc.text('Topics Covered:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    diary.topicsCovered.forEach(t => {
      doc.text(`• ${t}`, 18, y);
      y += 5;
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Challenges Encountered:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(diary.challengesEncountered || 'None recorded', 18, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Remedial Action Taken:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(diary.remedialActions || 'None needed', 18, y);
    y += 10;
  }

  // Admin Approval & Signature Footer
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('ADMINISTRATIVE REVIEW & STAMP', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${submission.status}`, 14, y);
  doc.text(`Admin Remarks: ${submission.adminFeedback || 'No additional remarks.'}`, 14, y + 5);

  y += 18;
  doc.line(14, y, 70, y);
  doc.line(130, y, 186, y);
  doc.text('Teacher Signature & Date', 14, y + 4);
  doc.text('School Principal / VP Academic', 130, y + 4);

  // Save PDF
  const filename = `${submission.type}_${submission.className.replace(' ', '_')}_${submission.subject.replace(' ', '_')}.pdf`;
  doc.save(filename);
}

export function generateAdmissionLetterPDF(
  student: Student,
  schoolClass?: SchoolClass | null,
  school?: School | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(school?.name || 'TeXora Academic Platform', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(school?.motto || 'Excellence, Character & Innovation', pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${school?.address || '14 Academic Crest Way'}  •  Session: ${school?.academicSession || '2025/2026'}`, pageWidth / 2, 24, { align: 'center' });

  y = 40;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL PROVISIONAL ADMISSION LETTER', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Ref & Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref No: ${student.admissionNo}`, 14, y);
  doc.text(`Date of Issue: ${student.dateAdmitted || new Date().toISOString().split('T')[0]}`, pageWidth - 14, y, { align: 'right' });
  y += 10;

  // Salutation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`To: Parent / Guardian of ${student.fullName}`, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Guardian Contact: ${student.guardianName} (${student.guardianPhone})`, 14, y);
  y += 10;

  // Body Content
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const bodyText = `Dear Parent / Guardian,

We are pleased to inform you that your child/ward, ${student.fullName.toUpperCase()}, has been offered provisional admission into ${school?.name || 'our academy'} for the ${school?.academicSession || '2025/2026'} Academic Session.

Following a thorough evaluation of credentials and entry requirements, the Academic Advisory Board has assigned the student to the following class placement:`;

  const lines = doc.splitTextToSize(bodyText, pageWidth - 28);
  doc.text(lines, 14, y);
  y += lines.length * 5 + 4;

  // Student Particulars Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`STUDENT FULL NAME:`, 18, y + 8);
  doc.text(`OFFICIAL ADMISSION NO:`, 18, y + 16);
  doc.text(`ASSIGNED CLASS:`, 18, y + 24);
  doc.text(`GENDER & DOB:`, 18, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.fullName}`, 75, y + 8);
  doc.text(`${student.admissionNo}`, 75, y + 16);
  doc.text(`${schoolClass ? schoolClass.name : 'Primary / Secondary'} ${schoolClass?.arm || ''}`, 75, y + 24);
  doc.text(`${student.gender}  •  ${student.dob || 'N/A'}`, 75, y + 32);

  y += 48;

  // Parent Portal Access Code Box (Prominent Security Card)
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(99, 102, 241); // Indigo 500
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text('SECURE PARENT PORTAL ACCESS CREDENTIALS', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Use this unique access code to link your child on the Parent Portal to view terminal report cards, homework, and attendance:', 18, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`PARENT ACCESS CODE: ${student.accessCode}`, 18, y + 22);

  y += 34;

  // Closing terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const closingText = `Please note that this offer is subject to strict adherence to school regulations, prompt settlement of term tuition, and submission of verified medical records to the school clinic upon resumption.

Congratulations on this milestone! We look forward to a fruitful academic journey with your family.`;

  const closingLines = doc.splitTextToSize(closingText, pageWidth - 28);
  doc.text(closingLines, 14, y);
  y += closingLines.length * 5 + 12;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 70, y);
  doc.line(130, y, 186, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Eleanor Vance', 14, y + 4);
  doc.text('School Admissions Board', 130, y + 4);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Principal / Academic Registrar', 14, y + 8);
  doc.text('Official Stamp & Verification', 130, y + 8);

  doc.save(`Admission_Letter_${student.admissionNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function generateReportCardPDF(
  reportCard: StudentReportCard,
  school?: School | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(school?.name || 'TeXora Academic Platform', pageWidth / 2, 9, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(school?.motto || 'Excellence, Character & Innovation', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`OFFICIAL TERMINAL ACADEMIC REPORT CARD  •  ${reportCard.academicTerm.toUpperCase()} (${reportCard.academicSession})`, pageWidth / 2, 21, { align: 'center' });

  y = 32;

  // Student Particulars Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, y, pageWidth - 24, 22, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Student Name: ${reportCard.studentName}`, 16, y + 6);
  doc.text(`Admission No: ${reportCard.admissionNo}`, 16, y + 12);
  doc.text(`Class: ${reportCard.className}`, 16, y + 17);

  doc.text(`Grand Total: ${reportCard.grandTotal}`, 110, y + 6);
  doc.text(`Class Average: ${reportCard.averageScore}%`, 110, y + 12);
  doc.text(`Class Position: ${reportCard.positionInClass} / ${reportCard.totalStudentsInClass}`, 110, y + 17);

  doc.setTextColor(16, 185, 129);
  doc.text(`Overall Grade: ${reportCard.overallGrade}`, 160, y + 6);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attendance: ${reportCard.attendanceSummary.daysPresent}/${reportCard.attendanceSummary.totalDays} Days`, 160, y + 12);

  y += 26;

  // Table Header
  doc.setFillColor(226, 232, 240);
  doc.rect(12, y, pageWidth - 24, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  doc.text('SUBJECT', 14, y + 5);
  doc.text('ASS (10)', 65, y + 5);
  doc.text('CW (10)', 80, y + 5);
  doc.text('PRJ (10)', 95, y + 5);
  doc.text('TST (20)', 110, y + 5);
  doc.text('EXM (50)', 125, y + 5);
  doc.text('TOTAL', 142, y + 5);
  doc.text('GRD', 158, y + 5);
  doc.text('POS', 170, y + 5);
  doc.text('REMARK', 182, y + 5);

  y += 7;

  // Subject rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  reportCard.subjectScores.forEach((s, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, pageWidth - 24, 6, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(s.subject.substring(0, 24), 14, y + 4.5);
    doc.text(String(s.assignment), 67, y + 4.5);
    doc.text(String(s.classwork), 82, y + 4.5);
    doc.text(String(s.project), 97, y + 4.5);
    doc.text(String(s.test), 112, y + 4.5);
    doc.text(String(s.exam), 127, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(String(s.total), 143, y + 4.5);

    // Color grade
    if (s.grade === 'A' || s.grade === 'B') doc.setTextColor(16, 185, 129);
    else if (s.grade === 'C' || s.grade === 'D') doc.setTextColor(217, 119, 6);
    else doc.setTextColor(225, 29, 72);

    doc.text(s.grade, 160, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${s.position}`, 172, y + 4.5);
    doc.text((s.teacherRemark || 'Satisfactory').substring(0, 16), 182, y + 4.5);

    y += 6;
  });

  y += 6;

  // Remarks section
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, pageWidth - 24, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CLASS TEACHER REMARKS:', 16, y + 6);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`"${reportCard.teacherRemarks}"`, 16, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PRINCIPAL / HEAD TEACHER REMARKS:', 16, y + 19);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`"${reportCard.principalRemarks}"`, 16, y + 24);

  y += 34;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 70, y);
  doc.line(130, y, 186, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Class Teacher Signature & Date', 14, y + 4);
  doc.text('Principal Stamp & Signature', 130, y + 4);

  doc.save(`ReportCard_${reportCard.studentName.replace(' ', '_')}_${reportCard.academicTerm.replace(' ', '_')}.pdf`);
}

export function generatePromotionCertificatePDF(
  student: Student,
  fromClass: SchoolClass | undefined,
  toClass: SchoolClass | undefined,
  school: School | null | undefined,
  academicSession: string,
  status: 'PROMOTED' | 'REPEATED' | 'GRADUATED' = 'PROMOTED',
  remarks?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Outer Fancy Border
  doc.setLineWidth(1.5);
  doc.setDrawColor(79, 70, 229); // Indigo 600
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setLineWidth(0.5);
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Background tint
  doc.setFillColor(250, 250, 255);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'F');

  let y = 24;

  // School Header
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(school?.name || 'TeXora International School', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(school?.motto || 'Moulding Leaders of Tomorrow through Excellence & Integrity', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(school?.address || 'Lagos, Nigeria', pageWidth / 2, y, { align: 'center' });

  y += 12;

  // Title Banner
  doc.setFillColor(79, 70, 229);
  doc.rect(30, y, pageWidth - 60, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleText = status === 'PROMOTED'
    ? 'OFFICIAL CERTIFICATE OF CLASS PROMOTION'
    : status === 'GRADUATED'
    ? 'OFFICIAL CERTIFICATE OF GRADUATION'
    : 'OFFICIAL ACADEMIC PROGRESS NOTICE';
  doc.text(titleText, pageWidth / 2, y + 9.5, { align: 'center' });

  y += 24;

  // Body text
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('This is to officially certify that', pageWidth / 2, y, { align: 'center' });

  y += 10;

  // Student Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(student.fullName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Admission Number: ${student.admissionNo}  |  Parent Code: ${student.accessCode}`, pageWidth / 2, y, { align: 'center' });

  y += 12;

  // Promotion details block
  const fromName = fromClass ? `${fromClass.name} ${fromClass.arm || ''}`.trim() : 'Previous Class';
  const toName = toClass ? `${toClass.name} ${toClass.arm || ''}`.trim() : (status === 'GRADUATED' ? 'Graduated Alumni' : 'Next Level');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  if (status === 'PROMOTED') {
    doc.text(`Having successfully satisfied the academic requirements for the ${academicSession} session, is hereby`, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`PROMOTED FROM ${fromName.toUpperCase()} TO ${toName.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  } else if (status === 'GRADUATED') {
    doc.text(`Having successfully completed the curriculum requirements for ${fromName}, is hereby officially declared as`, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(79, 70, 229);
    doc.text(`GRADUATED ALUMNI OF ${school?.name || 'THE INSTITUTION'}`, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.text(`Has completed the ${academicSession} session in ${fromName} and will be repeating the class to strengthen core foundations.`, pageWidth / 2, y, { align: 'center' });
  }

  y += 14;

  if (remarks) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`"Remarks: ${remarks}"`, pageWidth / 2, y, { align: 'center' });
    y += 10;
  }

  // Signatures
  y = pageHeight - 35;

  doc.setDrawColor(148, 163, 184);
  doc.line(35, y, 95, y);
  doc.line(pageWidth - 95, y, pageWidth - 35, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Form Teacher / Registrar', 65, y + 5, { align: 'center' });
  doc.text('Principal / Head of School', pageWidth - 65, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Issued Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, pageHeight - 14, { align: 'center' });

  doc.save(`Promotion_Certificate_${student.fullName.replace(/\s+/g, '_')}.pdf`);
}

