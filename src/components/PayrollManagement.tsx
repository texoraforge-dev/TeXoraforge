import React, { useState } from 'react';
import { 
  DollarSign, Calculator, Lock, CheckCircle, AlertTriangle, FileText, 
  Settings, UserCheck, ChevronRight, Edit3, Plus, ShieldCheck, Printer, 
  TrendingDown, TrendingUp, Download, Eye, Award, Check
} from 'lucide-react';
import { User, SalaryProfile, DeductionRule, PayrollRecord, StaffPayrollItem, StaffAttendanceRecord } from '../types';
import { AppStorage } from '../storage';

interface PayrollManagementProps {
  currentUser: User | null;
  users: User[];
  salaryProfiles: SalaryProfile[];
  deductionRules: DeductionRule[];
  payrollRecords: PayrollRecord[];
  staffAttendance: StaffAttendanceRecord[];
  onRefresh?: () => void;
}

export const PayrollManagement: React.FC<PayrollManagementProps> = ({
  currentUser,
  users,
  salaryProfiles,
  deductionRules,
  payrollRecords,
  staffAttendance,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'PAYROLL_PERIODS' | 'SALARY_PROFILES' | 'DEDUCTION_RULES'>('PAYROLL_PERIODS');
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(payrollRecords[0] || null);
  
  // Salary Profile Modal State
  const [editingProfile, setEditingProfile] = useState<SalaryProfile | null>(null);
  const [profileBaseSalary, setProfileBaseSalary] = useState<number>(150000);
  const [profileAllowances, setProfileAllowances] = useState<{ title: string; amount: number }[]>([
    { title: 'Housing Allowance', amount: 20000 },
    { title: 'Transport Allowance', amount: 15000 }
  ]);
  const [bankName, setBankName] = useState<string>('First Bank of Nigeria');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');

  // Deduction Rule Modal State
  const [editingRule, setEditingRule] = useState<DeductionRule | null>(null);
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleTrigger, setRuleTrigger] = useState<DeductionRule['triggerType']>('LATE_ARRIVAL');
  const [ruleValue, setRuleValue] = useState<number>(500);
  const [ruleType, setRuleType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');

  // Payslip Modal State
  const [payslipItem, setPayslipItem] = useState<StaffPayrollItem | null>(null);

  const isProprietor = currentUser?.role === 'PROPRIETOR';

  // Calculate & Generate New Payroll Period for current month
  const handleGeneratePayrollPeriod = () => {
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const periodId = 'pay_rec_' + Date.now();

    const staffItems: StaffPayrollItem[] = salaryProfiles.map(prof => {
      // Auto-compute attendance deductions based on active rules & staff attendance logs
      const staffLogs = staffAttendance.filter(a => a.staffId === prof.staffId);
      
      const deductionsBreakdown: { title: string; amount: number; reason: string; approved: boolean }[] = [];

      // Late arrival rule check
      const lateRule = deductionRules.find(r => r.active && r.triggerType === 'LATE_ARRIVAL');
      if (lateRule) {
        const lateCount = staffLogs.filter(a => a.signInStatus === 'LATE').length;
        if (lateCount > 0) {
          const totalLatePenalty = lateRule.deductionType === 'FIXED' 
            ? lateRule.value * lateCount 
            : (prof.baseSalary * (lateRule.value / 100)) * lateCount;

          deductionsBreakdown.push({
            title: `Late Arrival Penalty (${lateCount} occurrences)`,
            amount: totalLatePenalty,
            reason: `Staff logged late arrival ${lateCount} time(s) during period`,
            approved: true
          });
        }
      }

      // Absence rule check
      const absenceRule = deductionRules.find(r => r.active && r.triggerType === 'ABSENCE');
      if (absenceRule) {
        const absentCount = staffLogs.filter(a => a.signInStatus === 'ABSENT').length;
        if (absentCount > 0) {
          const totalAbsencePenalty = absenceRule.deductionType === 'FIXED' 
            ? absenceRule.value * absentCount 
            : (prof.baseSalary * (absenceRule.value / 100)) * absentCount;

          deductionsBreakdown.push({
            title: `Unexcused Absence Penalty (${absentCount} days)`,
            amount: totalAbsencePenalty,
            reason: `Unexcused absence recorded for ${absentCount} day(s)`,
            approved: true
          });
        }
      }

      const totalAllowances = prof.allowances.reduce((acc, curr) => acc + curr.amount, 0);
      const totalDeductions = deductionsBreakdown.reduce((acc, curr) => acc + (curr.approved ? curr.amount : 0), 0);
      const netSalary = prof.baseSalary + totalAllowances - totalDeductions;

      return {
        staffId: prof.staffId,
        staffName: prof.staffName,
        role: prof.role,
        department: prof.department,
        baseSalary: prof.baseSalary,
        allowancesBreakdown: prof.allowances,
        totalAllowances,
        deductionsBreakdown,
        totalDeductions,
        netSalary,
        paymentStatus: 'UNPAID',
        payslipId: 'ps_' + prof.staffId + '_' + Date.now()
      };
    });

    const totalBase = staffItems.reduce((a, b) => a + b.baseSalary, 0);
    const totalAllowances = staffItems.reduce((a, b) => a + b.totalAllowances, 0);
    const totalDeductions = staffItems.reduce((a, b) => a + b.totalDeductions, 0);
    const netPayroll = totalBase + totalAllowances - totalDeductions;

    const newPayroll: PayrollRecord = {
      id: periodId,
      schoolId: currentUser?.schoolId || 'school_apex',
      periodName: currentMonthName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      staffPayrollItems: staffItems,
      totalPayroll: totalBase,
      totalAllowances,
      totalDeductions,
      netPayroll,
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    AppStorage.savePayrollRecord(newPayroll);
    setSelectedPayroll(newPayroll);
    if (onRefresh) onRefresh();
  };

  // Save updated salary profile
  const handleSaveSalaryProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updatedProfile: SalaryProfile = {
      ...editingProfile,
      baseSalary: profileBaseSalary,
      allowances: profileAllowances,
      bankDetails: {
        bankName,
        accountNumber,
        accountName
      },
      updatedAt: new Date().toISOString()
    };

    AppStorage.saveSalaryProfile(updatedProfile);
    setEditingProfile(null);
    if (onRefresh) onRefresh();
  };

  // Save new or updated deduction rule
  const handleSaveDeductionRule = (e: React.FormEvent) => {
    e.preventDefault();
    const ruleId = editingRule?.id || 'ded_rule_' + Date.now();

    const rule: DeductionRule = {
      id: ruleId,
      schoolId: currentUser?.schoolId || 'school_apex',
      name: ruleName,
      triggerType: ruleTrigger,
      active: true,
      deductionType: ruleType,
      value: ruleValue,
      maxDeductionPerPeriod: ruleValue * 10,
      requiresManualApproval: true,
      description: `Rule for ${ruleTrigger}: ${ruleType === 'FIXED' ? '₦' + ruleValue : ruleValue + '%'}`
    };

    AppStorage.saveDeductionRule(rule);
    setEditingRule(null);
    if (onRefresh) onRefresh();
  };

  // Approve & Lock Payroll
  const handleApprovePayroll = (payrollId: string) => {
    if (!isProprietor) return;
    AppStorage.updatePayrollStatus(payrollId, 'APPROVED', currentUser?.name || 'Proprietor');
    if (onRefresh) onRefresh();
  };

  const currentActivePayroll = selectedPayroll || payrollRecords[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
              <DollarSign className="w-4 h-4" /> Proprietor Payroll & Salary Engine
            </div>
            <h1 className="text-2xl font-bold mt-1">Payroll & Deduction Management</h1>
            <p className="text-slate-300 text-sm mt-1">
              Transparent, proprietor-approved staff compensation with automated geofence attendance deductions and audit compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('PAYROLL_PERIODS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'PAYROLL_PERIODS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-1.5" /> Payroll Periods
            </button>
            <button
              onClick={() => setActiveTab('SALARY_PROFILES')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'SALARY_PROFILES'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-1.5" /> Salary Profiles
            </button>
            <button
              onClick={() => setActiveTab('DEDUCTION_RULES')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'DEDUCTION_RULES'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1.5" /> Deduction Rules
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PAYROLL PERIODS */}
      {activeTab === 'PAYROLL_PERIODS' && (
        <div className="space-y-6">
          {/* Quick Metrics & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Gross Staff Salaries</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₦{(currentActivePayroll?.totalPayroll || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Base monthly total</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Allowances</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> ₦{(currentActivePayroll?.totalAllowances || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Housing & Transport</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Deductions Applied</div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <TrendingDown className="w-5 h-5" /> ₦{(currentActivePayroll?.totalDeductions || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Attendance & late penalties</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Net Payable Payroll</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                ₦{(currentActivePayroll?.netPayroll || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Final proprietor commitment</div>
            </div>
          </div>

          {/* Payroll Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Payroll Sheet: {currentActivePayroll?.periodName || 'August 2026'}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentActivePayroll?.status === 'APPROVED' || currentActivePayroll?.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {currentActivePayroll?.status || 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Verified salary calculations for {currentActivePayroll?.staffPayrollItems.length || 0} active staff members.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGeneratePayrollPeriod}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Recalculate / New Period
                </button>

                {isProprietor && currentActivePayroll?.status !== 'APPROVED' && (
                  <button
                    onClick={() => currentActivePayroll && handleApprovePayroll(currentActivePayroll.id)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" /> Approve & Lock Payroll
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Staff Member</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Base Salary</th>
                    <th className="p-3.5">Allowances</th>
                    <th className="p-3.5">Deductions</th>
                    <th className="p-3.5">Net Salary</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentActivePayroll?.staffPayrollItems.map(item => (
                    <tr key={item.staffId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {item.staffName}
                        <div className="text-[11px] font-normal text-slate-500">{item.role}</div>
                      </td>
                      <td className="p-3.5">{item.department}</td>
                      <td className="p-3.5 font-medium">₦{item.baseSalary.toLocaleString()}</td>
                      <td className="p-3.5 text-emerald-600 font-medium">+₦{item.totalAllowances.toLocaleString()}</td>
                      <td className="p-3.5 text-amber-600 font-medium">
                        -₦{item.totalDeductions.toLocaleString()}
                        {item.deductionsBreakdown.length > 0 && (
                          <div className="text-[10px] text-slate-400">{item.deductionsBreakdown.length} rule(s) triggered</div>
                        )}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">₦{item.netSalary.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setPayslipItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY PROFILES */}
      {activeTab === 'SALARY_PROFILES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Staff Base Salary Profiles</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure baseline monthly wages, allowances, and banking details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaryProfiles.map(prof => (
              <div key={prof.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{prof.staffName}</h3>
                      <p className="text-xs text-slate-500">{prof.role} • {prof.department}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-md">
                      {prof.employmentType}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Salary:</span>
                      <strong className="text-slate-900 dark:text-white">₦{prof.baseSalary.toLocaleString()}/mo</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Allowances Total:</span>
                      <strong className="text-emerald-600">
                        +₦{prof.allowances.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Account:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{prof.bankDetails?.bankName || 'Not Set'}</strong>
                    </div>
                  </div>
                </div>

                {isProprietor && (
                  <button
                    onClick={() => {
                      setEditingProfile(prof);
                      setProfileBaseSalary(prof.baseSalary);
                      setProfileAllowances(prof.allowances);
                      setBankName(prof.bankDetails?.bankName || 'First Bank of Nigeria');
                      setAccountNumber(prof.bankDetails?.accountNumber || '');
                      setAccountName(prof.bankDetails?.accountName || '');
                    }}
                    className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Salary & Allowances
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEDUCTION RULES */}
      {activeTab === 'DEDUCTION_RULES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configurable Deduction Rules</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Proprietor policy rules triggered by geofenced staff attendance events.</p>
            </div>

            {isProprietor && (
              <button
                onClick={() => {
                  setEditingRule({
                    id: '',
                    schoolId: currentUser?.schoolId || 'school_apex',
                    name: 'New Custom Rule',
                    triggerType: 'LATE_ARRIVAL',
                    active: true,
                    deductionType: 'FIXED',
                    value: 500,
                    description: ''
                  });
                  setRuleName('');
                  setRuleTrigger('LATE_ARRIVAL');
                  setRuleValue(500);
                  setRuleType('FIXED');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Deduction Rule
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deductionRules.map(rule => (
              <div key={rule.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-md">
                    Trigger: {rule.triggerType}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {rule.deductionType === 'FIXED' ? `₦${rule.value.toLocaleString()} flat` : `${rule.value}% base salary`}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{rule.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{rule.description}</p>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Proprietor Approval Required: <strong>Yes</strong></span>
                  <span className="text-emerald-600 font-semibold">Active Policy</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYSLIP MODAL */}
      {payslipItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Official Staff Payslip</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{payslipItem.staffName}</h3>
                <p className="text-xs text-slate-500">{payslipItem.role} • Period: August 2026</p>
              </div>
              <button onClick={() => setPayslipItem(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Breakdown */}
            <div className="space-y-4 text-xs">
              {/* Earnings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 dark:text-white border-b pb-1">Earnings & Allowances</div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Base Monthly Salary:</span>
                  <strong className="text-slate-900 dark:text-white">₦{payslipItem.baseSalary.toLocaleString()}</strong>
                </div>
                {payslipItem.allowancesBreakdown.map((all, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-500">{all.title}:</span>
                    <strong className="text-emerald-600">+₦{all.amount.toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              {/* Deductions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 dark:text-white border-b pb-1">Attendance Deductions</div>
                {payslipItem.deductionsBreakdown.length === 0 ? (
                  <p className="text-slate-400 text-xs">No deductions applied for this period.</p>
                ) : (
                  payslipItem.deductionsBreakdown.map((ded, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-amber-700 dark:text-amber-400">
                        <span>{ded.title}</span>
                        <span>-₦{ded.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{ded.reason}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Net Pay Total */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">Net Take-Home Pay</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400">Proprietor verified & authorized</div>
                </div>
                <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">
                  ₦{payslipItem.netSalary.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
              <button
                type="button"
                onClick={() => setPayslipItem(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SALARY PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Salary Profile: {editingProfile.staffName}</h3>
              <button onClick={() => setEditingProfile(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveSalaryProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Monthly Salary (₦)</label>
                <input
                  type="number"
                  value={profileBaseSalary}
                  onChange={(e) => setProfileBaseSalary(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Salary Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEDUCTION RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure Deduction Rule</h3>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveDeductionRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Unexcused Late Arrival Penalty"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trigger Event</label>
                <select
                  value={ruleTrigger}
                  onChange={(e) => setRuleTrigger(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                >
                  <option value="LATE_ARRIVAL">LATE_ARRIVAL (Arrived after grace period)</option>
                  <option value="ABSENCE">ABSENCE (Unexcused daily absence)</option>
                  <option value="MISSING_SIGN_OUT">MISSING_SIGN_OUT (Failed to sign out)</option>
                  <option value="EARLY_DEPARTURE">EARLY_DEPARTURE (Left before closing)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deduction Type</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  >
                    <option value="FIXED">FIXED (Flat Amount ₦)</option>
                    <option value="PERCENTAGE">PERCENTAGE (% Base Salary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    value={ruleValue}
                    onChange={(e) => setRuleValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Deduction Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
