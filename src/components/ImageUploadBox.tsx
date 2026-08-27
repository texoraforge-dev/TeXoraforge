/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Camera,
  Link as LinkIcon,
  User as UserIcon,
  Eye,
  Trash2
} from 'lucide-react';
import { UserRole } from '../types';

export interface ImageUploadBoxProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  rolePreset?: UserRole | 'STUDENT' | 'PARENT' | 'DRIVER' | 'PROPRIETOR' | 'PRINCIPAL' | 'SCHOOL_ADMIN' | 'TEACHER';
  aspectRatio?: 'square' | 'wide';
  className?: string;
  idPrefix?: string;
}

// Curated high quality avatars for instant selection by role
const PRESET_AVATARS: Record<string, { label: string; url: string }[]> = {
  PROPRIETOR: [
    { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { label: 'Executive Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    { label: 'Senior Leader', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Academic Director', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&q=80' },
  ],
  PRINCIPAL: [
    { label: 'Headmaster Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
    { label: 'Headmistress Female', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Senior Principal', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Dean Female', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
  ],
  SCHOOL_ADMIN: [
    { label: 'Admin Officer Male', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
    { label: 'Admin Officer Female', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { label: 'Operations Lead', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80' },
    { label: 'Registrar', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
  ],
  TEACHER: [
    { label: 'Science Teacher', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80' },
    { label: 'Math Teacher', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80' },
    { label: 'English Teacher', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
    { label: 'Primary Teacher', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80' },
  ],
  DRIVER: [
    { label: 'Bus Driver A', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
    { label: 'Bus Driver B', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
    { label: 'Shuttle Captain', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Fleet Specialist', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
  ],
  PARENT: [
    { label: 'Guardian Father', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Guardian Mother', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
    { label: 'Parent Male', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
    { label: 'Parent Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  ],
  STUDENT: [
    { label: 'Student Boy A', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
    { label: 'Student Girl A', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    { label: 'Student Boy B', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
    { label: 'Student Girl B', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  ],
};

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  value,
  onChange,
  label = 'Account Profile Photo / Picture',
  helperText = 'Upload a clear headshot photo (JPG, PNG, WebP) or choose a preset photo.',
  rolePreset = 'PROPRIETOR',
  aspectRatio = 'square',
  className = '',
  idPrefix = 'photo_upload'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'URL' | 'PRESETS'>('UPLOAD');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Process file upload and convert to base64 DataURL
  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('File size exceeds 4MB limit. Please upload a smaller image.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        setUrlInput(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file. Please try again.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentPresets = PRESET_AVATARS[rolePreset] || PRESET_AVATARS.PROPRIETOR;

  return (
    <div id={`${idPrefix}_container`} className={`space-y-3 ${className}`}>
      
      {/* Header Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-indigo-500" />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'UPLOAD'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PRESETS')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PRESETS'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('URL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'URL'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Main Upload Box Content */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
        
        {/* Photo Avatar Preview */}
        <div className="relative shrink-0 group">
          <div
            className={`overflow-hidden border-2 shadow-md bg-white dark:bg-slate-900 flex items-center justify-center ${
              aspectRatio === 'square' ? 'w-24 h-24 rounded-2xl' : 'w-32 h-24 rounded-2xl'
            } ${value ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-dashed border-slate-300 dark:border-slate-600'}`}
          >
            {value ? (
              <img
                src={value}
                alt="Account Avatar Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                }}
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <UserIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                <span className="text-[10px] font-semibold block">No Picture</span>
              </div>
            )}
          </div>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-all cursor-pointer"
              title="Remove Picture"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Controls based on Tab */}
        <div className="flex-1 w-full space-y-2">
          
          {/* TAB 1: File Upload / Drag & Drop */}
          {activeTab === 'UPLOAD' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleFileInputChange}
                className="hidden"
                id={`${idPrefix}_file_input`}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <UploadCloud className="h-6 w-6 mx-auto text-indigo-500 mb-1" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isProcessing ? 'Processing image...' : 'Click to browse or drag & drop photograph'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  PNG, JPG, WebP up to 4MB • Fast device/camera upload
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Quick Presets */}
          {activeTab === 'PRESETS' && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Click any portrait below to apply for this {rolePreset.replace('_', ' ')}:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {currentPresets.map((preset, idx) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(preset.url);
                        setUrlInput(preset.url);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/50'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate w-full">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: URL Direct Input */}
          {activeTab === 'URL' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Set URL
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Paste any publicly accessible HTTPS image link.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 animate-in fade-in">
              {errorMsg}
            </p>
          )}

        </div>

      </div>

    </div>
  );
};
