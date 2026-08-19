/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  Printer,
  Sliders,
  Layers,
  GraduationCap,
  Atom,
  TestTube,
  Calculator,
  Languages,
  Dna,
  FileText,
  Share2,
  Check,
  X
} from 'lucide-react';
import { COMPLETE_DIGITAL_TEXTBOOKS, DigitalTextbook, TextbookChapter } from '../data/textbooksData';
import { useAppStore } from '../storage';

interface DigitalTextbookLibraryProps {
  initialBookId?: string;
  initialChapterId?: string;
  onBackToDashboard?: () => void;
}

export const DigitalTextbookLibrary: React.FC<DigitalTextbookLibraryProps> = ({
  initialBookId,
  initialChapterId,
  onBackToDashboard
}) => {
  const { currentUser } = useAppStore();

  const [selectedBookId, setSelectedBookId] = useState<string | null>(initialBookId || null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Reader Customization State
  const [fontSize, setFontSize] = useState<'SM' | 'MD' | 'LG'>('MD');
  const [readerTheme, setReaderTheme] = useState<'AUTO' | 'WARM' | 'NIGHT'>('AUTO');
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('texora_bookmarked_chapters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quiz state for current chapter
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  const toggleBookmark = (chapterId: string) => {
    setBookmarkedChapters(prev => {
      const next = prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId];
      try {
        localStorage.setItem('texora_bookmarked_chapters', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const selectedBook = useMemo(() => {
    return COMPLETE_DIGITAL_TEXTBOOKS.find(b => b.id === selectedBookId) || null;
  }, [selectedBookId]);

  const selectedChapter = useMemo(() => {
    if (!selectedBook) return null;
    if (selectedChapterId) {
      return selectedBook.chapters.find(c => c.id === selectedChapterId) || selectedBook.chapters[0];
    }
    return selectedBook.chapters[0];
  }, [selectedBook, selectedChapterId]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return COMPLETE_DIGITAL_TEXTBOOKS.filter(book => {
      const matchSubject = subjectFilter === 'ALL' || book.subject.toLowerCase() === subjectFilter.toLowerCase();
      const matchGrade = gradeFilter === 'ALL' || book.gradeLevels.includes(gradeFilter);
      const matchSearch =
        searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.chapters.some(c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.keyConcepts.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      return matchSubject && matchGrade && matchSearch;
    });
  }, [searchQuery, gradeFilter, subjectFilter]);

  const handleSelectBook = (bookId: string, chapterId?: string) => {
    setSelectedBookId(bookId);
    if (chapterId) {
      setSelectedChapterId(chapterId);
    } else {
      const bk = COMPLETE_DIGITAL_TEXTBOOKS.find(b => b.id === bookId);
      setSelectedChapterId(bk?.chapters[0]?.id || null);
    }
    setUserAnswers({});
    setRevealedSolutions({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextChapter = () => {
    if (!selectedBook || !selectedChapter) return;
    const currentIndex = selectedBook.chapters.findIndex(c => c.id === selectedChapter.id);
    if (currentIndex < selectedBook.chapters.length - 1) {
      setSelectedChapterId(selectedBook.chapters[currentIndex + 1].id);
      setUserAnswers({});
      setRevealedSolutions({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (!selectedBook || !selectedChapter) return;
    const currentIndex = selectedBook.chapters.findIndex(c => c.id === selectedChapter.id);
    if (currentIndex > 0) {
      setSelectedChapterId(selectedBook.chapters[currentIndex - 1].id);
      setUserAnswers({});
      setRevealedSolutions({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrintChapter = () => {
    window.print();
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'biology':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'chemistry':
        return <TestTube className="w-5 h-5 text-cyan-400" />;
      case 'physics':
        return <Atom className="w-5 h-5 text-violet-400" />;
      case 'general mathematics':
      case 'mathematics':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'english language':
      case 'english':
        return <Languages className="w-5 h-5 text-rose-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <BookOpen className="w-80 h-80 text-indigo-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL NATIONAL CURRICULUM E-LIBRARY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Official Digital Curriculum Textbooks
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Complete, full-edition secondary school textbooks spanning Modern Biology, New School Chemistry, New School Physics, General Mathematics (JSS 1 - SSS 3), and Complete English (JSS 1 - SSS 3) with interactive chapter study notes, worked examples, formulas, and self-assessment quizzes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedBook && (
              <button
                onClick={() => { setSelectedBookId(null); setSelectedChapterId(null); }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Textbooks Library</span>
              </button>
            )}

            {onBackToDashboard && !selectedBook && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Library Grid vs Chapter Reader */}
      {!selectedBook ? (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics, formulas, chapters or authors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Sliders className="w-3.5 h-3.5" />
                <span className="font-bold">Level:</span>
              </div>
              <select
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Levels (JSS 1 - SSS 3)</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 1">SSS 1</option>
                <option value="SSS 2">SSS 2</option>
                <option value="SSS 3">SSS 3</option>
                <option value="Senior Secondary (SSS 1-3)">Senior Secondary (SSS 1-3)</option>
              </select>

              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All 5 Subject Curricula</option>
                <option value="Biology">Biology (Modern Biology)</option>
                <option value="Chemistry">Chemistry (New School)</option>
                <option value="Physics">Physics (New School)</option>
                <option value="General Mathematics">General Mathematics (JSS1-SSS3)</option>
                <option value="English Language">English Language (JSS1-SSS3)</option>
              </select>
            </div>
          </div>

          {/* Quick Curriculum Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COMPLETE_DIGITAL_TEXTBOOKS.map(b => {
              const Icon = getSubjectIcon(b.subject);
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBook(b.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                      {Icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {b.chapters.length} Units
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {b.subject} • {b.gradeLevels.length > 2 ? 'JSS 1 - SSS 3' : 'Senior Secondary'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Book Header Visual Banner */}
                <div className={`p-6 bg-gradient-to-br ${book.coverColor} text-white relative`}>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                      {book.curriculum}
                    </span>
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white">
                      {getSubjectIcon(book.subject)}
                    </div>
                  </div>

                  <h3 className="text-lg font-black mt-4 line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    By {book.author}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {book.gradeLevels.map((lvl, idx) => (
                      <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/15 text-slate-200">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Book Body & Chapters Overview */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>

                  {/* Chapters List preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Curriculum Units & Chapters</span>
                      <span>{book.chapters.length} Modules</span>
                    </div>

                    <div className="space-y-1.5">
                      {book.chapters.slice(0, 3).map(chap => (
                        <button
                          key={chap.id}
                          onClick={() => handleSelectBook(book.id, chap.id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <span className="truncate pr-2 font-medium">
                            <strong className="text-indigo-600 dark:text-indigo-400 mr-1.5">Unit {chap.chapterNumber}:</strong>
                            {chap.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </button>
                      ))}
                      {book.chapters.length > 3 && (
                        <p className="text-[11px] text-slate-400 italic pl-2">
                          + {book.chapters.length - 3} more curriculum chapters available...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectBook(book.id)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Complete Textbook</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CHAPTER READER VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table of Contents Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {selectedBook.subject}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {selectedBook.title}
                  </h3>
                </div>
                <button
                  onClick={() => { setSelectedBookId(null); setSelectedChapterId(null); }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-bold"
                  title="Switch Book"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Chapters Accordion/List */}
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {selectedBook.chapters.map(chap => {
                  const isCurrent = chap.id === selectedChapter?.id;
                  const isMarked = bookmarkedChapters.includes(chap.id);

                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        setSelectedChapterId(chap.id);
                        setUserAnswers({});
                        setRevealedSolutions({});
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            Unit {chap.chapterNumber}
                          </span>
                          {chap.gradeLevel && (
                            <span className={`text-[10px] font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {chap.gradeLevel}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold line-clamp-2 leading-snug">
                          {chap.title}
                        </p>
                      </div>

                      {isMarked && (
                        <Bookmark className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Main Chapter Reading Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedChapter && (
              <div className={`rounded-3xl border shadow-sm transition-all duration-200 ${
                readerTheme === 'WARM'
                  ? 'bg-amber-50/70 border-amber-200 text-slate-900'
                  : readerTheme === 'NIGHT'
                  ? 'bg-slate-950 border-slate-800 text-slate-100'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}>
                {/* Chapter Toolbar */}
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                      UNIT {selectedChapter.chapterNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {selectedChapter.estimatedReadTime} Read • {selectedChapter.gradeLevel || 'Secondary Level'}
                    </span>
                  </div>

                  {/* Font Size & Bookmark & Print */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleBookmark(selectedChapter.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        bookmarkedChapters.includes(selectedChapter.id)
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                      title="Bookmark this unit"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarkedChapters.includes(selectedChapter.id) ? 'fill-amber-500' : ''}`} />
                      <span className="hidden sm:inline">Bookmark</span>
                    </button>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                      {(['SM', 'MD', 'LG'] as const).map(sz => (
                        <button
                          key={sz}
                          onClick={() => setFontSize(sz)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors ${
                            fontSize === sz
                              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {sz === 'SM' ? 'A-' : sz === 'MD' ? 'A' : 'A+'}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handlePrintChapter}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Print or Export Study Notes PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chapter Title & Summary Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 space-y-3">
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                    {selectedChapter.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    "{selectedChapter.summary}"
                  </p>
                </div>

                {/* Key Concepts Box */}
                {selectedChapter.keyConcepts && selectedChapter.keyConcepts.length > 0 && (
                  <div className="p-6 sm:p-8 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Essential Core Concepts (NERDC / WAEC / JAMB Focus)
                    </h4>
                    <ul className="space-y-2">
                      {selectedChapter.keyConcepts.map((kc, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{kc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Formulas & Rules Sheet if present */}
                {selectedChapter.formulasOrRules && selectedChapter.formulasOrRules.length > 0 && (
                  <div className="p-6 sm:p-8 bg-amber-50/50 dark:bg-amber-950/20 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Key Mathematical Equations & Scientific Laws
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedChapter.formulasOrRules.map((rule, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Chapter Content Sections */}
                <div className={`p-6 sm:p-8 space-y-8 ${
                  fontSize === 'SM' ? 'text-xs leading-relaxed' : fontSize === 'LG' ? 'text-base leading-loose' : 'text-sm leading-relaxed'
                }`}>
                  {selectedChapter.contentSections.map((sec, sIdx) => (
                    <section key={sIdx} className="space-y-4">
                      <div className="border-l-4 border-indigo-600 pl-4 py-0.5">
                        <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                          {sec.heading}
                        </h3>
                        {sec.subheading && (
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {sec.subheading}
                          </p>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                        {sec.body}
                      </p>

                      {sec.keyTakeaway && (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                          💡 <strong>Key Takeaway:</strong> {sec.keyTakeaway}
                        </div>
                      )}

                      {/* Worked Examples */}
                      {sec.workedExamples && sec.workedExamples.length > 0 && (
                        <div className="space-y-4 mt-4">
                          {sec.workedExamples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-600 text-white">
                                  Standard Worked Example {exIdx + 1}
                                </span>
                              </div>

                              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {ex.problem}
                              </p>

                              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step-by-Step Solution:</span>
                                {ex.stepByStepSolution.map((step, stIdx) => (
                                  <p key={stIdx} className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                                    {step}
                                  </p>
                                ))}
                              </div>

                              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Final Answer: {ex.answer}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

                {/* Chapter End Review & Practice Quiz */}
                {selectedChapter.reviewQuestions && selectedChapter.reviewQuestions.length > 0 && (
                  <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Self Assessment & WAEC Exam Drills
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          End of Chapter Review Questions
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {selectedChapter.reviewQuestions.length} Questions
                      </span>
                    </div>

                    <div className="space-y-4">
                      {selectedChapter.reviewQuestions.map((q, qIdx) => {
                        const selectedOption = userAnswers[qIdx];
                        const isSolutionShown = revealedSolutions[qIdx];
                        const isCorrect = selectedOption === q.correctAnswer;

                        return (
                          <div
                            key={qIdx}
                            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                          >
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              Q{qIdx + 1}. {q.question}
                            </p>

                            {/* Multiple Choice Options */}
                            {q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {q.options.map((opt, optIdx) => {
                                  const isOptionChosen = selectedOption === opt;
                                  let btnClass = 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                                  if (isSolutionShown) {
                                    if (opt === q.correctAnswer) {
                                      btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                                    } else if (isOptionChosen && !isCorrect) {
                                      btnClass = 'bg-rose-500/20 border-rose-500 text-rose-400';
                                    }
                                  } else if (isOptionChosen) {
                                    btnClass = 'bg-indigo-600 text-white font-bold border-indigo-600';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        setUserAnswers(prev => ({ ...prev, [qIdx]: opt }));
                                        setRevealedSolutions(prev => ({ ...prev, [qIdx]: true }));
                                      }}
                                      className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Short Answer / Explanation Button */}
                            {!q.options && (
                              <button
                                onClick={() => setRevealedSolutions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                              >
                                {isSolutionShown ? 'Hide Model Answer' : 'Show Model Answer & Scheme'}
                              </button>
                            )}

                            {/* Explanation Reveal */}
                            {isSolutionShown && (
                              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1">
                                <p className="font-bold text-indigo-900 dark:text-indigo-300">
                                  Correct Answer: <span className="text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chapter Bottom Navigation Bar */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <button
                    onClick={handlePrevChapter}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Unit</span>
                  </button>

                  <button
                    onClick={handleNextChapter}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Next Unit</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
