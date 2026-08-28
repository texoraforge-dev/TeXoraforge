/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileCheck2,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../storage';
import { uploadAppFile } from '../../lib/supabaseStorage';
import { isSupabaseConfigured } from '../../lib/supabase';

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({ isOpen, onClose }) => {
  const { school, currentUser, classes, actions } = useAppStore();

  const availableClasses = classes;
  const [classId, setClassId] = useState(classes[0]?.id || '');

  const selectedClass = classes.find(c => c.id === classId);
  const classSubjects = classId ? actions.getClassSubjects(classId) : [];
  const schoolSubs = school?.subjects && school.subjects.length > 0 ? school.subjects : ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Civic Education', 'Agricultural Science', 'Economics'];
  const userAssigned = currentUser?.assignedSubjects || [];
  
  const allSubjects = Array.from(new Set([...classSubjects, ...(selectedClass?.subjects || []), ...schoolSubs, ...userAssigned]));

  const [subject, setSubject] = useState(allSubjects[0] || 'Mathematics');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !currentUser || !school) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFileDataUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (!title) {
      setTitle(file.name.replace('.pdf', ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      setErrorMsg('Please choose a PDF file and title.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      let storagePath = '';
      let activeUrl = fileDataUrl;

      // Upload to Supabase Storage bucket "app-files" under ${auth.uid()}/submissions/...
      if (isSupabaseConfigured()) {
        const uploadRes = await uploadAppFile({
          featureName: 'submissions',
          itemId: classId || 'general',
          file: selectedFile,
          customFileName: selectedFile.name
        });

        if (uploadRes.error) {
          console.warn('Supabase storage upload failed, using local buffer fallback:', uploadRes.error);
        } else {
          storagePath = uploadRes.filePath;
          activeUrl = uploadRes.signedUrl;
        }
      }

      const targetClassObj = classes.find(c => c.id === classId);

      actions.createSubmission({
        schoolId: school.id,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        classId,
        className: targetClassObj?.name || 'Class',
        subject,
        type: 'LESSON_NOTE',
        title: title + ' (PDF Attachment)',
        pdfAttachment: {
          id: storagePath || ('file_' + Date.now()),
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / 1024).toFixed(1) + ' KB',
          fileType: selectedFile.type,
          dataUrl: activeUrl
        },
        lessonNoteContent: {
          weekNumber: 1,
          durationMinutes: 80,
          topic: title,
          subTopic: 'Attached PDF Document',
          behavioralObjectives: ['Review attached PDF document.'],
          instructionalMaterials: ['Uploaded PDF Note'],
          introduction: 'PDF lesson note uploaded directly by teacher.',
          coreContentSteps: [
            {
              stepNumber: 1,
              title: 'Attached PDF Material',
              teacherActivity: 'Refer to uploaded PDF document.',
              studentActivity: 'Study PDF document.'
            }
          ],
          summary: 'PDF note attachment.',
          evaluationQuestions: ['See attached PDF.'],
          assignment: 'See attached PDF.'
        }
      });

      setIsUploading(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit PDF:', err);
      setErrorMsg(err?.message || 'Failed to upload PDF note.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Upload PDF Lesson Note
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class Level *</label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {allSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lesson Note Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Newton's Laws of Motion PDF Note"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          {/* PDF Drag & Drop Zone */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select PDF File *</label>
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-2 hover:border-indigo-500 transition-colors">
              <FileText className="h-8 w-8 text-indigo-500 mx-auto" />
              {selectedFile ? (
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB • PDF Document</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Click to browse or drag PDF file here</p>
                  <p className="text-[10px] text-slate-400">PDF documents up to 20MB supported</p>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-file-input"
              />
              <label
                htmlFor="pdf-file-input"
                className="inline-block px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-500 transition-colors"
              >
                Choose PDF File
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              <span>{isUploading ? 'Uploading to Storage...' : 'Upload & Submit PDF'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
