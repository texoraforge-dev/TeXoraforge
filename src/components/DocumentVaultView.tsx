/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  Bus,
  Plus,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAppStore } from '../storage';
import { SchoolDocument, FinancialRecord, SchoolEvent, TransportRoute } from '../types';

export const DocumentVaultView: React.FC = () => {
  const { school, schoolDocuments, financialRecords, schoolEvents, transportRoutes, actions, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'FINANCE' | 'EVENTS' | 'TRANSPORT'>('DOCUMENTS');

  const isAdmin = currentUser?.role === 'PROPRIETOR' || currentUser?.role === 'VICE_PRINCIPAL' || currentUser?.role === 'SCHOOL_ADMIN';

  // Secure Guard: General School Vault & school-wide fee ledgers are strictly restricted to administrative staff and NOT teachers, parents, or students
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-800 rounded-3xl p-8 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/60 rounded-full flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Access Restricted: Administrative Staff Only
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            The General School Vault, administrative policies, internal exam banks, and school-wide fee ledgers are strictly restricted to school administrative personnel (Proprietor, Vice Principal, and School Admin).
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Please use your role dashboard to access the specific academic, attendance, and assessment tools assigned to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Document Upload Form State
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<SchoolDocument['category']>('ACADEMIC');

  // Finance Filter State
  const [financeSearch, setFinanceSearch] = useState<string>('');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: SchoolDocument = {
      id: `doc_${Date.now()}`,
      schoolId: school?.id || 'school_apex',
      title: docTitle,
      category: docCategory,
      fileName: `${docTitle.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      uploadedByName: currentUser?.name || 'School Admin',
      uploadedByRole: currentUser?.role || 'SCHOOL_ADMIN',
      accessRoles: ['PROPRIETOR', 'VICE_PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER'],
      createdAt: new Date().toISOString()
    };

    actions.saveSchoolDocument(newDoc);
    setDocTitle('');
  };

  const handleUpdatePayment = (recordId: string, status: FinancialRecord['status']) => {
    const record = financialRecords.find(f => f.id === recordId);
    if (!record) return;

    const updated: FinancialRecord = {
      ...record,
      status,
      paidAmount: status === 'PAID' ? record.totalAmount : status === 'PARTIAL' ? record.totalAmount / 2 : 0,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    actions.saveFinancialRecord(updated);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Vault, Financials & Operations Hub</h1>
          <p className="text-slate-300 text-sm mt-1">
            Centralized repository for documents, fee tracking, academic calendar, and transport operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'DOCUMENTS' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Document Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'FINANCE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Tuition & Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'EVENTS' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Event Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSPORT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'TRANSPORT' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Bus className="h-4 w-4" />
            <span>Transport Routes</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Document Vault */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          {/* Upload Form */}
          <form onSubmit={handleAddDocument} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>Upload Document to Secure School Vault</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="Document Title e.g. First Term Examination Policy"
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100"
              />

              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value as SchoolDocument['category'])}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ACADEMIC">Academic & Scheme of Work</option>
                <option value="POLICY">School Policy & Guidelines</option>
                <option value="FINANCE">Financial Statements</option>
                <option value="EXAM_PAPER">Examination Question Papers</option>
              </select>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition-all"
              >
                Upload Document
              </button>
            </div>
          </form>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolDocuments.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {doc.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{doc.title}</h3>
                  <p className="text-xs text-slate-500">{doc.fileName} ({doc.fileSize})</p>
                  <p className="text-[10px] text-slate-400">Uploaded by: {doc.uploadedByName}</p>
                </div>

                <button className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Financial Fee Tracker */}
      {activeTab === 'FINANCE' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">School Tuition & Fee Records</h2>
            <input
              type="text"
              placeholder="Search student or class..."
              value={financeSearch}
              onChange={e => setFinanceSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {financialRecords.filter(f => f.studentName.toLowerCase().includes(financeSearch.toLowerCase())).map(f => (
              <div key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{f.studentName} ({f.className})</h3>
                  <p className="text-xs text-slate-500">{f.feeTitle}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    Amount: ₦{f.paidAmount.toLocaleString()} / ₦{f.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <select
                      value={f.status}
                      onChange={e => handleUpdatePayment(f.id, e.target.value as FinancialRecord['status'])}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                        f.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : f.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="PAID">PAID FULL</option>
                      <option value="PARTIAL">PARTIAL PAYMENT</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        f.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : f.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {f.status === 'PAID' ? 'PAID FULL' : f.status === 'PARTIAL' ? 'PARTIAL PAYMENT' : 'UNPAID'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Events Calendar */}
      {activeTab === 'EVENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolEvents.map(evt => (
            <div key={evt.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {evt.category}
                </span>
                <span className="text-xs font-bold text-slate-500">{evt.eventDate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{evt.title}</h3>
              <p className="text-xs text-slate-500">{evt.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Transport Routes */}
      {activeTab === 'TRANSPORT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transportRoutes.map(tr => (
            <div key={tr.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Bus className="h-4 w-4 text-indigo-600" />
                  <span>{tr.routeName}</span>
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                  {tr.vehicleNo}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p><strong>Driver:</strong> {tr.driverName} ({tr.driverPhone})</p>
                <p><strong>Pickup Stops:</strong> {tr.pickupLocations.join(' → ')}</p>
                <p><strong>Assigned Students:</strong> {tr.assignedStudentIds.length} / {tr.capacity} capacity</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
