/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Brain,
  User,
  ShieldAlert,
  Loader2,
  FileText,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAppStore } from '../storage';
import { StudentRiskProfile, RemedialPackage } from '../types';

export const StudentEarlyWarningSystem: React.FC = () => {
  const { school, studentRiskProfiles, remedialPackages, actions, students, currentUser } = useAppStore();
  const isStudent = currentUser?.role === 'STUDENT';

  // Filter profiles and remedials for student role
  const effectiveProfiles = isStudent
    ? studentRiskProfiles.filter(p => p.studentId === currentUser?.id || p.studentName.toLowerCase().includes(currentUser?.name?.toLowerCase() || ''))
    : studentRiskProfiles;

  const [selectedProfile, setSelectedProfile] = useState<StudentRiskProfile | null>(effectiveProfiles[0] || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [targetSubject, setTargetSubject] = useState<string>('Mathematics');
  const [targetTopic, setTargetTopic] = useState<string>('Fractions & Algebraic Operations');

  const handleGenerateAIRemedial = async () => {
    if (!selectedProfile) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedProfile.className,
          subject: targetSubject,
          topic: targetTopic,
          subTopic: '1-on-1 Remedial Explanation & Step-by-Step Guidance',
          prompt: `Create a 1-on-1 remedial package for student ${selectedProfile.studentName} who is struggling in ${targetTopic}.`
        })
      });

      const data = await response.json();
      const ai = data.suggestions || {};

      const newPackage: RemedialPackage = {
        id: `rem_${Date.now()}`,
        schoolId: school?.id || 'school_apex',
        studentId: selectedProfile.studentId,
        studentName: selectedProfile.studentName,
        className: selectedProfile.className,
        subject: targetSubject,
        topic: targetTopic,
        explanation: ai.summary || `Personalized learning explanation for ${selectedProfile.studentName} focusing on step-by-step breakdown of ${targetTopic}.`,
        workedExamples: [
          {
            title: `Step-by-Step Example 1: ${targetTopic}`,
            problem: `Calculate or solve fundamental exercise in ${targetTopic}.`,
            solution: ai.keyPoints?.[0] || '1. Identify given terms. 2. Apply core rule. 3. Simplify result.'
          },
          {
            title: `Step-by-Step Example 2: Intermediate Problem`,
            problem: `Solve multi-step exercise in ${targetTopic}.`,
            solution: ai.keyPoints?.[1] || 'Break problem into smaller sub-problems and calculate step by step.'
          }
        ],
        practiceQuestions: [
          {
            id: `rq_${Date.now()}`,
            type: 'MULTIPLE_CHOICE',
            questionText: `Practice Question for ${selectedProfile.studentName} on ${targetTopic}:`,
            options: ['A. Option 1', 'B. Correct Answer', 'C. Option 3', 'D. Option 4'],
            correctAnswer: 'B. Correct Answer',
            marks: 10
          }
        ],
        completed: false,
        createdAt: new Date().toISOString()
      };

      actions.saveRemedialPackage(newPackage);
    } catch (err) {
      console.error('Failed to generate AI remedial package:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-amber-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-rose-700/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Brain className="h-4 w-4" />
              <span>Phases 10 & 11: Early Warning Radar & AI Remedial Learning</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Student Risk Radar & AI Remedials</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Detect students at risk of academic failure or attendance drop, and generate personalized 1-on-1 AI remedial learning packages automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <ShieldAlert className="h-8 w-8 text-rose-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase">At-Risk Students</p>
              <p className="text-2xl font-black text-rose-300">{studentRiskProfiles.length} Identified</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Student Roster */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>Flagged Risk Profiles</span>
            </h2>
          </div>

          <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
            {effectiveProfiles.length > 0 ? (
              effectiveProfiles.map(p => {
                const isSelected = selectedProfile?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfile(p)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{p.studentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.riskLevel} RISK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{p.className}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                {isStudent
                  ? 'No risk flags on your account. Outstanding academic performance!'
                  : 'No student risk profiles flagged.'}
              </div>
            )}
          </div>
        </div>

        {/* Risk Details & AI Remedial Generator */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProfile ? (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedProfile.studentName}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Class: {selectedProfile.className}</p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {selectedProfile.riskLevel} RISK RADAR
                </span>
              </div>

              {/* Reasons */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Identified Risk Triggers</p>
                <div className="space-y-1">
                  {selectedProfile.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Remedial Generator (Teachers / Admin only) */}
              {!isStudent && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span>Generate AI 1-on-1 Remedial Package</span>
                    </h3>
                    <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                      Gemini AI
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={targetSubject}
                      onChange={e => setTargetSubject(e.target.value)}
                      placeholder="Subject e.g. Mathematics"
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={targetTopic}
                      onChange={e => setTargetTopic(e.target.value)}
                      placeholder="Topic e.g. Fractions & Decimals"
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAIRemedial}
                    disabled={isGenerating}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>Generate Remedial Package for {selectedProfile.studentName}</span>
                  </button>
                </div>
              )}

              {/* Remedial Packages List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Assigned Remedial Packages</h3>
                {remedialPackages.filter(r => r.studentName === selectedProfile.studentName).map(pkg => (
                  <div key={pkg.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{pkg.subject} • {pkg.topic}</span>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ACTIVE REMEDIAL
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{pkg.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Select an at-risk student from the radar list to view triggers and generate remedial guidance.</div>
          )}
        </div>
      </div>
    </div>
  );
};
