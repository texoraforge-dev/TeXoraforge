/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Download,
  Key,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
  Sparkles,
  Brain,
  MessageSquare,
  HelpCircle,
  Loader2,
  Send,
  Laptop,
  AlertTriangle,
  FolderLock,
  CreditCard,
  Building2,
  CheckCircle,
  XCircle,
  Edit3,
  Receipt,
  UploadCloud,
  Check,
  X,
  Users
} from 'lucide-react';
import { useAppStore } from '../storage';
import { Student, StudentReportCard, PaymentTransaction, SchoolBankAccountDetails } from '../types';
import { generateReportCardPDF, generatePromotionCertificatePDF } from '../lib/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ParentPortalProps {
  initialTab?: string;
  onNavigate?: (view: string) => void;
}

export function ParentPortal({ initialTab, onNavigate }: ParentPortalProps) {
  const {
    currentUser,
    students,
    classes,
    homework,
    school,
    actions,
    cbtExams,
    remedialPackages,
    schoolDocuments,
    financialRecords,
    paymentTransactions
  } = useAppStore();

  const [linkAccessCodeInput, setLinkAccessCodeInput] = useState('');
  const [linkStatusMsg, setLinkStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Parent's linked students
  const parentAccessCodes = currentUser?.linkedStudentAccessCodes || [];
  const linkedStudents = students.filter(s => parentAccessCodes.includes(s.accessCode));

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    linkedStudents[0]?.id || students[0]?.id || ''
  );

  const activeStudent = students.find(s => s.id === selectedStudentId) || linkedStudents[0] || students[0];
  const activeClass = classes.find(c => c.id === activeStudent?.classId);

  // Compute live report card for active student
  const reportCard: StudentReportCard | null = activeStudent ? actions.computeReportCard(activeStudent.id) : null;
  const activeHomework = activeStudent ? homework.filter(h => h.classId === activeStudent.classId) : [];
  const activeTimetable = activeStudent ? actions.getTimetableForClass(activeStudent.classId) : null;

  // Active student's financials & payments
  const activeStudentFinancial = financialRecords.find(f => f.studentId === activeStudent?.id);
  const activeStudentPayments = paymentTransactions.filter(p => p.studentId === activeStudent?.id || (currentUser && p.parentUserId === currentUser.id));

  // Multi-child aggregate calculations
  const familyStudents = linkedStudents.length > 0 ? linkedStudents : (activeStudent ? [activeStudent] : []);
  const familyFinancials = financialRecords.filter(f => familyStudents.some(st => st.id === f.studentId));
  const totalFamilyFees = familyFinancials.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFamilyPaid = familyFinancials.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFamilyBalance = Math.max(0, totalFamilyFees - totalFamilyPaid);

  const [activeTab, setActiveTab] = useState<'FEES_AND_PAYMENTS' | 'AI_ASSISTANT' | 'OVERVIEW' | 'REPORT_CARD' | 'SCORES' | 'HOMEWORK' | 'TIMETABLE'>(
    (initialTab as any) || 'FEES_AND_PAYMENTS'
  );

  // Payment Submission Modal State
  const [isSubmitPaymentModalOpen, setIsSubmitPaymentModalOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState<string>(activeStudent?.id || '');
  const [payFeeTitle, setPayFeeTitle] = useState<string>(activeStudentFinancial?.feeTitle || 'First Term Tuition Fee');
  const [payAmount, setPayAmount] = useState<number>(activeStudentFinancial ? Math.max(0, activeStudentFinancial.totalAmount - activeStudentFinancial.paidAmount) || 50000 : 50000);
  const [payMethod, setPayMethod] = useState<'BANK_TRANSFER' | 'POS' | 'CASH' | 'ONLINE'>('BANK_TRANSFER');
  const [payReference, setPayReference] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');
  const [paymentSubmitSuccess, setPaymentSubmitSuccess] = useState(false);

  // Bank Details Edit Modal (Proprietor Only)
  const isProprietor = currentUser?.role === 'PROPRIETOR' || currentUser?.role === 'SCHOOL_ADMIN';
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const defaultBank: SchoolBankAccountDetails = school?.bankAccountDetails || {
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0123456789',
    accountName: 'Apex Horizon Academy Official Account',
    sortCodeOrBranch: 'Victoria Island Branch, Lagos',
    paymentInstructions: 'Please include your Child’s Full Name and Admission Number in the bank transfer remarks / narration.',
    currencySymbol: '₦'
  };

  const [bankName, setBankName] = useState(defaultBank.bankName);
  const [accountNumber, setAccountNumber] = useState(defaultBank.accountNumber);
  const [accountName, setAccountName] = useState(defaultBank.accountName);
  const [sortCodeOrBranch, setSortCodeOrBranch] = useState(defaultBank.sortCodeOrBranch || '');
  const [paymentInstructions, setPaymentInstructions] = useState(defaultBank.paymentInstructions || '');

  // AI Parent Assistant State
  const [aiSubject, setAiSubject] = useState<string>('Mathematics');
  const [aiTopic, setAiTopic] = useState<string>('Quadratic Equations & Homework Guidance');
  const [aiMode, setAiMode] = useState<'EXPLAIN' | 'QUIZ' | 'REAL_WORLD'>('EXPLAIN');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !payReference.trim() || !currentUser) {
      alert('Please enter the amount and transaction reference / teller number.');
      return;
    }

    const targetStudent = students.find(s => s.id === payStudentId) || activeStudent;
    const targetClass = classes.find(c => c.id === targetStudent?.classId);
    const targetFin = financialRecords.find(f => f.studentId === targetStudent?.id);

    const newTx: PaymentTransaction = {
      id: 'pay_tx_' + Date.now(),
      schoolId: school?.id || 'school_apex',
      financialRecordId: targetFin?.id,
      studentId: targetStudent?.id || '',
      studentName: targetStudent?.fullName || 'Student',
      className: targetClass?.name || 'Secondary',
      parentUserId: currentUser.id,
      parentName: currentUser.name,
      feeTitle: payFeeTitle,
      amountPaid: Number(payAmount),
      paymentMethod: payMethod,
      paymentReference: payReference.trim(),
      paymentDate: payDate,
      notes: payNotes,
      status: 'PENDING_CONFIRMATION',
      createdAt: new Date().toISOString()
    };

    actions.savePaymentTransaction(newTx);
    setPaymentSubmitSuccess(true);
    setTimeout(() => {
      setPaymentSubmitSuccess(false);
      setIsSubmitPaymentModalOpen(false);
      setPayReference('');
      setPayNotes('');
    }, 1500);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    actions.updateSchoolBankAccount({
      bankName,
      accountNumber,
      accountName,
      sortCodeOrBranch,
      paymentInstructions,
      currencySymbol: '₦'
    });
    setIsEditBankModalOpen(false);
    alert('School Bank Account details updated successfully.');
  };

  const handleConfirmTx = (txId: string) => {
    if (!currentUser) return;
    actions.confirmPaymentTransaction(txId, currentUser.id, currentUser.name);
  };

  const handleRejectTx = (txId: string) => {
    if (!currentUser) return;
    const reason = prompt('Please provide a reason for rejecting this payment submission:', 'Proof of payment was invalid or transfer not received.');
    if (reason) {
      actions.rejectPaymentTransaction(txId, reason, currentUser.id, currentUser.name);
    }
  };

  const handleAskAITutor = async () => {
    setIsAiThinking(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: activeClass?.name || 'SS 3',
          subject: aiSubject,
          topic: aiTopic,
          subTopic: `Parent Homework Assistant Mode: ${aiMode}`,
          prompt: `You are TeXora AI Parent Assistant. A parent is asking for help to guide their child in ${aiSubject} on topic "${aiTopic}". Mode: ${aiMode}. Provide clear, friendly, step-by-step explanation or practice questions with answers.`
        })
      });

      const data = await response.json();
      const resText = data.suggestions?.summary || data.data?.summary || `Here is guidance for ${aiTopic} in ${aiSubject}:\n\n1. Break the problem into small, manageable parts.\n2. Practice with 2-3 similar examples.\n3. Verify the final answer step by step.`;
      setAiResponse(resText);
    } catch (err) {
      setAiResponse('TeXora AI Tutor encountered a network issue. Please retry.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkAccessCodeInput.trim() || !currentUser) return;

    const res = actions.linkStudentToParent(currentUser.id, linkAccessCodeInput.trim());
    setLinkStatusMsg({ success: res.success, text: res.message });
    if (res.success && res.student) {
      setSelectedStudentId(res.student.id);
      setLinkAccessCodeInput('');
    }
  };

  const handleDownloadPDF = () => {
    if (reportCard) {
      generateReportCardPDF(reportCard, school);
    } else {
      alert('Report card not generated yet.');
    }
  };

  const handleDownloadPromotionCert = () => {
    if (!activeStudent) return;
    const latestProm = activeStudent.promotionHistory?.[0];
    const fromCls = classes.find(c => c.id === latestProm?.fromClassId) || activeClass;
    const toCls = classes.find(c => c.id === (latestProm?.toClassId || activeStudent.classId));
    generatePromotionCertificatePDF(
      activeStudent,
      fromCls,
      toCls,
      school,
      latestProm?.academicSession || '2026/2027',
      activeStudent.promotionStatus || 'PROMOTED',
      latestProm?.remarks || 'Officially transitioned to the next academic level.'
    );
  };

  // Prepare chart data for subject performance
  const chartData = (reportCard?.subjectScores || []).map(s => ({
    subject: s.subject.length > 12 ? s.subject.substring(0, 12) + '...' : s.subject,
    score: s.total,
    grade: s.grade
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <ShieldCheck className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIAL PARENT PORTAL (READ ONLY)</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentUser?.name || 'Parent / Guardian'}
            </h2>
            <p className="text-sm text-indigo-200 max-w-xl">
              Monitor your child’s live academic continuous assessments, report cards, attendance records, homework assignments, and teacher notes in real-time.
            </p>
          </div>

          {/* Child Selector & Link Form */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
              <span>Select Child Profile:</span>
              <span>{linkedStudents.length} Linked</span>
            </div>

            {linkedStudents.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/90 text-white border border-indigo-400/40 text-xs font-bold focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                {linkedStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.admissionNo})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-300">
                No child linked yet. Enter the Parent Access Code from your child’s admission letter below.
              </p>
            )}

            {/* Quick Link Form */}
            <form onSubmit={handleLinkChild} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Access Code (e.g. PAR-2026-1049)"
                value={linkAccessCodeInput}
                onChange={(e) => setLinkAccessCodeInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs font-mono focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Link
              </button>
            </form>

            {linkStatusMsg && (
              <p className={`text-[11px] font-medium ${linkStatusMsg.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                {linkStatusMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {activeStudent && (
        <>
          {/* Student Profile Card Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={activeStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={activeStudent.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                  ENROLLED
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeStudent.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Admission No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeStudent.admissionNo}</span>
                  {' • '} Class: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeClass?.name} {activeClass?.arm}</span>
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {activeStudent.gender}
                  </span>
                  <span>Parent Code: <strong className="font-mono text-emerald-600">{activeStudent.accessCode}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Terminal Avg</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{reportCard?.averageScore || 0}%</span>
              </div>
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Class Rank</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">#{reportCard?.positionInClass || 1}</span>
              </div>
              <div className="p-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {reportCard ? Math.round((reportCard.attendanceSummary.daysPresent / reportCard.attendanceSummary.totalDays) * 100) : 95}%
                </span>
              </div>
            </div>
          </div>

          {/* Academic Promotion & Transition Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    ACADEMIC TRANSITION
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    Status: {activeStudent.promotionStatus || 'PROMOTED'}
                  </span>
                </div>
                <h4 className="text-base font-extrabold mt-0.5">
                  {activeStudent.fullName} is Enrolled in {activeClass?.name} {activeClass?.arm ? `(${activeClass.arm})` : ''}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeStudent.promotionHistory && activeStudent.promotionHistory.length > 0
                    ? `Transition Record: Promoted from ${activeStudent.promotionHistory[0].fromClassName} to ${activeStudent.promotionHistory[0].toClassName} (${activeStudent.promotionHistory[0].academicSession})`
                    : `Active academic status verified for session ${school?.academicSession || '2025/2026'}.`}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPromotionCert}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Promotion Certificate</span>
            </button>
          </div>
        </>
      )}

      {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
            {[
              { id: 'FEES_AND_PAYMENTS', label: 'Fees & Payments Tracker', icon: CreditCard },
              { id: 'AI_ASSISTANT', label: 'AI Parent & Tutor Assistant', icon: Sparkles },
              { id: 'OVERVIEW', label: 'Overview & Charts', icon: TrendingUp },
              { id: 'REPORT_CARD', label: 'Terminal Report Card', icon: Award },
              { id: 'SCORES', label: 'Assessment Breakdowns', icon: FileText },
              { id: 'HOMEWORK', label: 'Homework & Tasks', icon: CheckCircle2 },
              { id: 'TIMETABLE', label: 'Class Timetable', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 0: Fees & Payments Tracker */}
          {activeTab === 'FEES_AND_PAYMENTS' && (
            <div className="space-y-6">
              {/* Multi-Child Family Fee Summary (If parent has multiple children) */}
              {familyStudents.length > 1 && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                          FAMILY ACCOUNT CONSOLIDATION
                        </span>
                        <h3 className="text-lg font-bold">Aggregate Fees for {familyStudents.length} Children</h3>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-200 bg-white/10 px-3 py-1 rounded-full font-medium">
                      Linked: {familyStudents.map(s => s.fullName.split(' ')[0]).join(', ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-indigo-500/20">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-xs font-bold text-indigo-300 block mb-1">Total Family Billed</span>
                      <span className="text-2xl font-black">₦{totalFamilyFees.toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">Total Family Paid</span>
                      <span className="text-2xl font-black text-emerald-300">₦{totalFamilyPaid.toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-xs font-bold text-rose-400 block mb-1">Total Balance Left to Pay</span>
                      <span className="text-2xl font-black text-rose-300">₦{totalFamilyBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Children Breakdown Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-indigo-300 font-bold uppercase">
                          <th className="py-2 px-3">Child</th>
                          <th className="py-2 px-3">Class</th>
                          <th className="py-2 px-3">Total Fee</th>
                          <th className="py-2 px-3">Amount Paid</th>
                          <th className="py-2 px-3">Balance Left</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {familyStudents.map(st => {
                          const fin = financialRecords.find(f => f.studentId === st.id);
                          const cls = classes.find(c => c.id === st.classId);
                          const total = fin?.totalAmount || 180000;
                          const paid = fin?.paidAmount || 0;
                          const bal = Math.max(0, total - paid);
                          return (
                            <tr key={st.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-white">{st.fullName}</td>
                              <td className="py-2.5 px-3 text-slate-300">{cls?.name || 'N/A'}</td>
                              <td className="py-2.5 px-3 font-semibold">₦{total.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-emerald-400 font-semibold">₦{paid.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-rose-400 font-bold">₦{bal.toLocaleString()}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  bal === 0 ? 'bg-emerald-500/20 text-emerald-300' : paid > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {bal === 0 ? 'COMPLETED' : paid > 0 ? 'PARTIAL' : 'OUTSTANDING'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => setSelectedStudentId(st.id)}
                                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors"
                                >
                                  Select View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Active Child Fee Card & Bank Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Student Fee Balance Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        OFFICIAL FEES LEDGER
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activeStudent?.fullName}’s Term Fee Summary
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Academic Session: {school?.academicSession || '2025/2026'} • Term: First Term
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setPayStudentId(activeStudent?.id || '');
                        setPayFeeTitle(activeStudentFinancial?.feeTitle || 'First Term Tuition Fee');
                        setPayAmount(activeStudentFinancial ? Math.max(0, activeStudentFinancial.totalAmount - activeStudentFinancial.paidAmount) || 50000 : 50000);
                        setIsSubmitPaymentModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Submit Payment Proof / Teller</span>
                    </button>
                  </div>

                  {/* Big Number Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Total Amount Billed
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ₦{(activeStudentFinancial?.totalAmount || 180000).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-1">Tuition, ICT & Lab Fees</span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                        Total Amount Paid
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₦{(activeStudentFinancial?.paidAmount || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 block mt-1">
                        {activeStudentFinancial?.paidAmount ? 'Verified by Proprietor' : 'No payments confirmed yet'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                        Balance Left to Pay
                      </span>
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        ₦{Math.max(0, (activeStudentFinancial?.totalAmount || 180000) - (activeStudentFinancial?.paidAmount || 0)).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 block mt-1">
                        {(activeStudentFinancial?.totalAmount || 180000) <= (activeStudentFinancial?.paidAmount || 0) ? 'Cleared / No Outstanding' : 'Payment Due'}
                      </span>
                    </div>
                  </div>

                  {/* Fee Items Breakdown */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                      Approved Fee Schedule Breakdown
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        <span>Tuition & Instructional Materials</span>
                        <span className="font-bold">₦120,000</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        <span>Science & Computer Laboratory Levy</span>
                        <span className="font-bold">₦35,000</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        <span>CBT Examination & Continuous Assessment Portal</span>
                        <span className="font-bold">₦15,000</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Sports, Library & Health Care</span>
                        <span className="font-bold">₦10,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Bank Account Details Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-md flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                        <Building2 className="w-3.5 h-3.5" />
                        OFFICIAL SCHOOL ACCOUNT
                      </span>

                      {isProprietor && (
                        <button
                          onClick={() => {
                            setBankName(school?.bankAccountDetails?.bankName || 'Guaranty Trust Bank (GTBank)');
                            setAccountNumber(school?.bankAccountDetails?.accountNumber || '0123456789');
                            setAccountName(school?.bankAccountDetails?.accountName || 'Apex Horizon Academy Official Account');
                            setSortCodeOrBranch(school?.bankAccountDetails?.sortCodeOrBranch || 'Victoria Island Branch, Lagos');
                            setPaymentInstructions(school?.bankAccountDetails?.paymentInstructions || 'Please include your Child’s Full Name and Admission Number in the bank transfer remarks / narration.');
                            setIsEditBankModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-indigo-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                          title="Proprietor: Edit School Bank Account Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">Edit Details</span>
                        </button>
                      )}
                    </div>

                    <h4 className="text-lg font-extrabold text-white mb-4">
                      Direct Bank Transfer Details
                    </h4>

                    <div className="space-y-3 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <span className="text-[11px] text-indigo-300 block font-semibold">Bank Name:</span>
                        <span className="font-bold text-sm text-white">
                          {school?.bankAccountDetails?.bankName || 'Guaranty Trust Bank (GTBank)'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-indigo-300 block font-semibold">Account Number:</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-lg text-emerald-400 tracking-wider">
                            {school?.bankAccountDetails?.accountNumber || '0123456789'}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(school?.bankAccountDetails?.accountNumber || '0123456789');
                              alert('Account Number copied to clipboard!');
                            }}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded text-white transition-all cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-indigo-300 block font-semibold">Account Name:</span>
                        <span className="font-semibold text-slate-200">
                          {school?.bankAccountDetails?.accountName || 'Apex Horizon Academy Official Account'}
                        </span>
                      </div>

                      {school?.bankAccountDetails?.sortCodeOrBranch && (
                        <div>
                          <span className="text-[11px] text-indigo-300 block font-semibold">Branch / Sort Code:</span>
                          <span className="text-slate-300">
                            {school?.bankAccountDetails?.sortCodeOrBranch}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                    <strong>Payment Instruction:</strong>{' '}
                    {school?.bankAccountDetails?.paymentInstructions ||
                      'Please include your child’s Admission Number and Full Name in the narration when making transfer. Upload your teller/reference for Proprietor confirmation.'}
                  </div>
                </div>
              </div>

              {/* Payment History & Proprietor Confirmation Log Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Payment History & Verification Status
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      All submitted payments are verified and confirmed by the School Proprietor.
                    </p>
                  </div>

                  {isProprietor && (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      Proprietor Mode: You can confirm or reject pending payments below
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-3">Student Name</th>
                        <th className="py-3 px-3">Fee Title</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Method & Reference</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Proprietor Action / Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activeStudentPayments.length > 0 ? (
                        activeStudentPayments.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {tx.paymentDate}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {tx.studentName} ({tx.className})
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                              {tx.feeTitle}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                              ₦{tx.amountPaid.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 block font-bold">
                                {tx.paymentReference}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{tx.paymentMethod}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : tx.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}>
                                {tx.status === 'CONFIRMED' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                {tx.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                                {tx.status === 'PENDING_CONFIRMATION' && <Clock className="w-3 h-3 text-amber-600" />}
                                <span>{tx.status.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {tx.status === 'CONFIRMED' ? (
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <span>Confirmed by: {tx.confirmedByProprietorName || 'Proprietor'}</span>
                                  {tx.confirmedAt && (
                                    <span className="block text-[10px] text-slate-400 font-normal">
                                      {new Date(tx.confirmedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ) : tx.status === 'REJECTED' ? (
                                <div className="text-[11px] text-rose-600 dark:text-rose-400">
                                  <span>Rejected: {tx.rejectionReason || 'Invalid proof'}</span>
                                </div>
                              ) : isProprietor ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleConfirmTx(tx.id)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 cursor-pointer transition-colors"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Confirm</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectTx(tx.id)}
                                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 cursor-pointer transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                                  Awaiting Proprietor verification
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                            No payment transactions recorded yet. Click "Submit Payment Proof / Teller" above to submit a payment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Overview & Analytics */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Performance Bar Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                  Subject Score Distribution
                </h3>
                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.score >= 70 ? '#10b981' : entry.score >= 50 ? '#6366f1' : '#f59e0b'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    No approved subject scores uploaded for this term yet.
                  </p>
                )}
              </div>

              {/* Remarks Summary */}
              {reportCard && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider mb-2">
                      Class Teacher Remarks
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                      "{reportCard.teacherRemarks}"
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider mb-2">
                      Principal Remarks
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                      "{reportCard.principalRemarks}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Terminal Report Card */}
          {activeTab === 'REPORT_CARD' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Official Terminal Report Card ({reportCard?.academicTerm || 'First Term'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified and issued by {school?.name || 'School Principal'}
                  </p>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report Card PDF</span>
                </button>
              </div>

              {reportCard && reportCard.subjectScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Ass (10)</th>
                        <th className="py-3 px-3 text-center">CW (10)</th>
                        <th className="py-3 px-3 text-center">Prj (10)</th>
                        <th className="py-3 px-3 text-center">Test (20)</th>
                        <th className="py-3 px-3 text-center">Exam (50)</th>
                        <th className="py-3 px-3 text-center">Total</th>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-4">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {(reportCard?.subjectScores || []).map((s) => (
                        <tr key={s.subject} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.assignment}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.classwork}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.project}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.test}</td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{s.exam}</td>
                          <td className="py-3 px-3 text-center font-extrabold text-slate-900 dark:text-white">{s.total}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-black ${
                              s.grade === 'A' || s.grade === 'B'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {s.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 italic">{s.teacherRemark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Scores for this term are currently being evaluated and will appear once approved by the academic board.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Continuous Assessment Breakdowns */}
          {activeTab === 'SCORES' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Real-Time Assessment Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(reportCard?.subjectScores || []).map(s => (
                  <div key={s.subject} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{s.subject}</span>
                      <span className="font-extrabold text-indigo-600 text-sm">{s.total}/100 ({s.grade})</span>
                    </div>
                    <div className="grid grid-cols-5 text-center text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block">Ass</span>
                        <span className="font-bold">{s.assignment}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">CW</span>
                        <span className="font-bold">{s.classwork}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Prj</span>
                        <span className="font-bold">{s.project}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Test</span>
                        <span className="font-bold">{s.test}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Exam</span>
                        <span className="font-bold">{s.exam}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Homework & Projects */}
          {activeTab === 'HOMEWORK' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Assigned Homework & Class Projects ({activeHomework.length})
              </h3>
              {activeHomework.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No active homework posted for this class.</p>
              ) : (
                <div className="space-y-3">
                  {activeHomework.map(hw => (
                    <div key={hw.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{hw.subject}</span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{hw.title}</h4>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                          Due: {hw.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{hw.description}</p>
                      <p className="text-[11px] text-slate-400">Assigned by: {hw.teacherName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: AI Parent & Student Assistant */}
          {activeTab === 'AI_ASSISTANT' && (
            <div className="space-y-6">
              {/* AI Banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
                      <Sparkles className="w-7 h-7 animate-pulse text-indigo-300" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-400/20">
                        GEMINI 3.6 FLASH POWERED
                      </span>
                      <h3 className="text-xl font-black mt-1">TeXora AI Parent & Homework Assistant</h3>
                      <p className="text-xs text-indigo-200">
                        Instant step-by-step guidance for homework, CBT practice tests, and school documents.
                      </p>
                    </div>
                  </div>

                  {/* Voice Assistant Shortcut */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-300" />
                      <span>Voice Assistant Active (Floating Bottom-Right)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Feature Launchers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onNavigate && onNavigate('early_warning')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-amber-300 mb-1">
                      <AlertTriangle className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-xs text-white">Child Risk & Remedials</div>
                    <div className="text-[10px] text-slate-300">View personalized AI remedial packages & weaknesses for {activeStudent?.fullName || 'your child'}</div>
                  </button>

                  <button
                    onClick={() => onNavigate && onNavigate('document_vault')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all hover:scale-[1.01] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-emerald-300 mb-1">
                      <FolderLock className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-xs text-white">Vault & Fee Receipts</div>
                    <div className="text-[10px] text-slate-300">Access official school letters, syllabi, and fee records</div>
                  </button>
                </div>
              </div>

              {/* Interactive Homework Tutor */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Interactive AI Homework & Tutor Assistant</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Helping parents guide student learning for <strong className="text-slate-800 dark:text-slate-200">{activeStudent?.fullName} ({activeClass?.name})</strong>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                    Online & Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="English Language">English Language</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Civic Education">Civic Education</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assistance Goal
                    </label>
                    <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setAiMode('EXPLAIN')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'EXPLAIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Step-by-Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiMode('QUIZ')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'QUIZ' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Practice Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiMode('REAL_WORLD')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          aiMode === 'REAL_WORLD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Real Examples
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Homework Topic or Question
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Simultaneous Equations,Photosynthesis, Shakespeare's Macbeth..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAskAITutor}
                      disabled={isAiThinking || !aiTopic.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
                    >
                      {isAiThinking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Consulting AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Ask AI Tutor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Response Output Container */}
                {aiResponse && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        AI Parent Guidance Output
                      </span>
                      <button
                        onClick={() => setAiResponse(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
                      >
                        Clear Response
                      </button>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Class Timetable */}
          {activeTab === 'TIMETABLE' && activeTimetable && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Weekly Class Schedule — {activeClass?.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-3">Period 1</th>
                      <th className="py-3 px-3">Period 2</th>
                      <th className="py-3 px-3">Period 3</th>
                      <th className="py-3 px-3">Period 4</th>
                      <th className="py-3 px-3">Period 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {activeTimetable.map((day: any) => (
                      <tr key={day.day}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{day.day}</td>
                        {day.slots.map((s: any, idx: number) => (
                          <td key={idx} className="py-3 px-3">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{s.subject}</span>
                            <span className="text-[10px] text-slate-400 block">{s.time}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!activeStudent && activeTab !== 'AI_ASSISTANT' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center space-y-4 border border-slate-200 dark:border-slate-800">
              <Key className="w-12 h-12 text-indigo-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Student Linked Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Please enter your child’s Parent Access Code (found on their admission letter or ID badge) in the top form to link their account.
              </p>
            </div>
          )}

      {/* Modal 1: Submit Payment Proof / Teller */}
      {isSubmitPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Submit Fee Payment Proof
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proprietor will review & confirm your transaction
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSubmitSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  Payment Proof Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  The Proprietor has been notified and will verify your transaction shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Child / Student:
                  </label>
                  <select
                    value={payStudentId}
                    onChange={(e) => setPayStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {familyStudents.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.admissionNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Fee Type / Description:
                    </label>
                    <input
                      type="text"
                      value={payFeeTitle}
                      onChange={(e) => setPayFeeTitle(e.target.value)}
                      placeholder="e.g. First Term Tuition Fee"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Paid (₦):
                    </label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      placeholder="e.g. 180000"
                      min={1000}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method:
                    </label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer / Mobile App</option>
                      <option value="POS">POS Terminal</option>
                      <option value="CASH">Cash at Bursary</option>
                      <option value="ONLINE">Online Portal / Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Date:
                    </label>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Reference / Teller / Transaction ID:
                  </label>
                  <input
                    type="text"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. GTB-TRF-20260218-994821 or Teller #40291"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Notes (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Paid via GTBank Mobile App by Chief Olumide"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsSubmitPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    Submit for Confirmation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Edit School Bank Details (Proprietor Only) */}
      {isEditBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Edit School Bank Account Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proprietor Control: Updates bank info displayed to all parents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditBankModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name:
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Guaranty Trust Bank (GTBank)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Number:
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0123456789"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Name:
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Apex Horizon Academy Official Account"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch / Sort Code (Optional):
                </label>
                <input
                  type="text"
                  value={sortCodeOrBranch}
                  onChange={(e) => setSortCodeOrBranch(e.target.value)}
                  placeholder="e.g. Victoria Island Branch, Lagos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Instructions for Parents:
                </label>
                <textarea
                  rows={3}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="e.g. Please include your Child's Full Name and Admission Number in the bank transfer remarks."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
