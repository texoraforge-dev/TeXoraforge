/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  Plus,
  Trash2,
  RefreshCw,
  Wand2,
  AlertCircle,
  BookPlus,
  Compass,
  DollarSign,
  Landmark,
  Cpu,
  Feather,
  User,
  Tag,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { COMPLETE_DIGITAL_TEXTBOOKS, DigitalTextbook, TextbookChapter } from '../data/textbooksData';
import { useAppStore } from '../storage';
import { UserRole } from '../types';

interface DigitalTextbookLibraryProps {
  initialBookId?: string;
  initialChapterId?: string;
  initialRole?: UserRole | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  onNavigate?: (view: string) => void;
  onBackToDashboard?: () => void;
}

const COVER_THEMES = [
  { label: 'Deep Indigo', value: 'from-indigo-900 via-indigo-800 to-slate-900', accent: '#6366f1' },
  { label: 'Emerald Nature', value: 'from-emerald-950 via-teal-900 to-slate-900', accent: '#10b981' },
  { label: 'Cyan Science', value: 'from-cyan-950 via-sky-900 to-slate-900', accent: '#06b6d4' },
  { label: 'Violet Quantum', value: 'from-purple-950 via-violet-900 to-slate-900', accent: '#8b5cf6' },
  { label: 'Amber Mathematics', value: 'from-amber-950 via-yellow-900 to-slate-900', accent: '#f59e0b' },
  { label: 'Crimson Literature', value: 'from-rose-950 via-red-900 to-slate-900', accent: '#f43f5e' },
  { label: 'Dark Slate Premium', value: 'from-slate-950 via-slate-900 to-zinc-900', accent: '#64748b' }
];

export const DigitalTextbookLibrary: React.FC<DigitalTextbookLibraryProps> = ({
  initialBookId,
  initialChapterId,
  initialRole,
  onBackToDashboard
}) => {
  const { currentUser } = useAppStore();
  const userRole = currentUser?.role || (initialRole === 'ADMIN' ? 'SCHOOL_ADMIN' : initialRole);
  const canManageTextbooks = userRole === 'PROPRIETOR' || userRole === 'VICE_PRINCIPAL' || userRole === 'SCHOOL_ADMIN';

  // Custom added textbooks & deleted textbook IDs from localStorage
  const [customBooks, setCustomBooks] = useState<DigitalTextbook[]>(() => {
    try {
      const saved = localStorage.getItem('texora_custom_textbooks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deletedBookIds, setDeletedBookIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('texora_deleted_textbook_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active textbooks list
  const allTextbooks = useMemo(() => {
    const defaultAvailable = COMPLETE_DIGITAL_TEXTBOOKS.filter(b => !deletedBookIds.includes(b.id));
    const customAvailable = customBooks.filter(b => !deletedBookIds.includes(b.id));
    return [...defaultAvailable, ...customAvailable];
  }, [customBooks, deletedBookIds]);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(initialBookId || null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId || null);
  
  // Real-Time Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchField, setSearchField] = useState<'ALL' | 'TITLE' | 'AUTHOR' | 'SUBJECT' | 'CHAPTERS'>('ALL');
  const [disciplineFilter, setDisciplineFilter] = useState<'ALL' | 'SCIENCES' | 'MATHEMATICS' | 'LANGUAGES' | 'COMMERCIAL' | 'HUMANITIES'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'TITLE_ASC' | 'TITLE_DESC' | 'AUTHOR_ASC' | 'SUBJECT_ASC' | 'CHAPTERS_DESC'>('DEFAULT');

  // Modal States
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<DigitalTextbook | null>(null);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Book Form State
  const [newBookTitle, setNewBookTitle] = useState<string>('');
  const [newBookAuthor, setNewBookAuthor] = useState<string>('');
  const [newBookSubject, setNewBookSubject] = useState<string>('Biology');
  const [newBookCustomSubject, setNewBookCustomSubject] = useState<string>('');
  const [newBookEdition, setNewBookEdition] = useState<string>('Revised Curriculum Edition');
  const [newBookCurriculum, setNewBookCurriculum] = useState<string>('NERDC / WAEC / NECO Standard');
  const [newBookGradeLevels, setNewBookGradeLevels] = useState<string[]>(['SSS 1', 'SSS 2', 'SSS 3']);
  const [newBookDescription, setNewBookDescription] = useState<string>('');
  const [newBookCoverColor, setNewBookCoverColor] = useState<string>(COVER_THEMES[0].value);
  const [newBookAccentColor, setNewBookAccentColor] = useState<string>(COVER_THEMES[0].accent);

  // Initial Chapter Form for new book
  const [newChapterTitle, setNewChapterTitle] = useState<string>('Introduction to the Subject & Core Principles');
  const [newChapterSummary, setNewChapterSummary] = useState<string>('Fundamental concepts, core definitions, and initial exploration.');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    return allTextbooks.find(b => b.id === selectedBookId) || null;
  }, [allTextbooks, selectedBookId]);

  const selectedChapter = useMemo(() => {
    if (!selectedBook) return null;
    if (selectedChapterId) {
      return selectedBook.chapters.find(c => c.id === selectedChapterId) || selectedBook.chapters[0];
    }
    return selectedBook.chapters[0];
  }, [selectedBook, selectedChapterId]);

  // Discipline counts for quick navigation
  const disciplineCounts = useMemo(() => {
    const counts = {
      ALL: allTextbooks.length,
      SCIENCES: 0,
      MATHEMATICS: 0,
      LANGUAGES: 0,
      COMMERCIAL: 0,
      HUMANITIES: 0
    };

    allTextbooks.forEach(b => {
      const sub = b.subject.toLowerCase();
      if (['biology', 'chemistry', 'physics', 'science', 'agric', 'agricultural', 'basic science'].some(s => sub.includes(s))) {
        counts.SCIENCES++;
      } else if (['mathematics', 'math', 'algebra', 'calculus', 'further math', 'statistics'].some(s => sub.includes(s))) {
        counts.MATHEMATICS++;
      } else if (['english', 'literature', 'french', 'language', 'linguistics', 'yoruba', 'igbo', 'hausa'].some(s => sub.includes(s))) {
        counts.LANGUAGES++;
      } else if (['accounting', 'commerce', 'economics', 'finance', 'business', 'marketing', 'bookkeeping'].some(s => sub.includes(s))) {
        counts.COMMERCIAL++;
      } else if (['government', 'civic', 'geography', 'history', 'social', 'religious', 'crs', 'irs'].some(s => sub.includes(s))) {
        counts.HUMANITIES++;
      }
    });

    return counts;
  }, [allTextbooks]);

  // Real-Time Filtered and Sorted Textbooks List
  const filteredBooks = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

    const results = allTextbooks.filter(book => {
      // 1. Grade level filter
      const matchGrade = gradeFilter === 'ALL' || book.gradeLevels.some(g => 
        g.toLowerCase().includes(gradeFilter.toLowerCase()) || gradeFilter.toLowerCase().includes(g.toLowerCase())
      );
      
      // 2. Specific Subject filter
      const matchSubject = subjectFilter === 'ALL' || book.subject.toLowerCase() === subjectFilter.toLowerCase();

      // 3. Discipline / Subject Area filter
      let matchDiscipline = true;
      if (disciplineFilter !== 'ALL') {
        const sub = book.subject.toLowerCase();
        if (disciplineFilter === 'SCIENCES') {
          matchDiscipline = ['biology', 'chemistry', 'physics', 'science', 'agric', 'agricultural', 'basic science'].some(s => sub.includes(s));
        } else if (disciplineFilter === 'MATHEMATICS') {
          matchDiscipline = ['mathematics', 'math', 'algebra', 'calculus', 'further math', 'statistics'].some(s => sub.includes(s));
        } else if (disciplineFilter === 'LANGUAGES') {
          matchDiscipline = ['english', 'literature', 'french', 'language', 'linguistics', 'yoruba', 'igbo', 'hausa'].some(s => sub.includes(s));
        } else if (disciplineFilter === 'COMMERCIAL') {
          matchDiscipline = ['accounting', 'commerce', 'economics', 'finance', 'business', 'marketing', 'bookkeeping'].some(s => sub.includes(s));
        } else if (disciplineFilter === 'HUMANITIES') {
          matchDiscipline = ['government', 'civic', 'geography', 'history', 'social', 'religious', 'crs', 'irs'].some(s => sub.includes(s));
        }
      }

      // 4. Real-time Search query matching across chosen scope or all fields
      let matchSearch = true;
      if (queryTokens.length > 0) {
        if (searchField === 'TITLE') {
          matchSearch = queryTokens.every(token => 
            book.title.toLowerCase().includes(token) ||
            book.edition.toLowerCase().includes(token)
          );
        } else if (searchField === 'AUTHOR') {
          matchSearch = queryTokens.every(token => 
            book.author.toLowerCase().includes(token)
          );
        } else if (searchField === 'SUBJECT') {
          matchSearch = queryTokens.every(token => 
            book.subject.toLowerCase().includes(token)
          );
        } else if (searchField === 'CHAPTERS') {
          matchSearch = queryTokens.every(token => 
            book.chapters.some(c => 
              c.title.toLowerCase().includes(token) || 
              c.summary.toLowerCase().includes(token) ||
              c.keyConcepts.some(k => k.toLowerCase().includes(token)) ||
              (c.formulasOrRules && c.formulasOrRules.some(f => f.toLowerCase().includes(token)))
            )
          );
        } else {
          // ALL FIELDS: Intelligent combined real-time search
          matchSearch = queryTokens.every(token => {
            const inTitle = book.title.toLowerCase().includes(token);
            const inAuthor = book.author.toLowerCase().includes(token);
            const inSubject = book.subject.toLowerCase().includes(token);
            const inCurriculum = book.curriculum.toLowerCase().includes(token);
            const inEdition = book.edition.toLowerCase().includes(token);
            const inDescription = book.description.toLowerCase().includes(token);
            const inIsbn = book.isbn?.toLowerCase().includes(token);
            const inGrades = book.gradeLevels.some(g => g.toLowerCase().includes(token));
            const inChapters = book.chapters.some(c =>
              c.title.toLowerCase().includes(token) ||
              c.summary.toLowerCase().includes(token) ||
              c.keyConcepts.some(k => k.toLowerCase().includes(token)) ||
              (c.formulasOrRules && c.formulasOrRules.some(f => f.toLowerCase().includes(token)))
            );
            return inTitle || inAuthor || inSubject || inCurriculum || inEdition || inDescription || inIsbn || inGrades || inChapters;
          });
        }
      }

      return matchGrade && matchSubject && matchDiscipline && matchSearch;
    });

    // Apply Sorting
    return [...results].sort((a, b) => {
      if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
      if (sortBy === 'TITLE_DESC') return b.title.localeCompare(a.title);
      if (sortBy === 'AUTHOR_ASC') return a.author.localeCompare(b.author);
      if (sortBy === 'SUBJECT_ASC') return a.subject.localeCompare(b.subject);
      if (sortBy === 'CHAPTERS_DESC') return b.chapters.length - a.chapters.length;
      return 0;
    });
  }, [allTextbooks, searchQuery, searchField, gradeFilter, subjectFilter, disciplineFilter, sortBy]);

  const handleSelectBook = (bookId: string, chapterId?: string) => {
    setSelectedBookId(bookId);
    const bk = allTextbooks.find(b => b.id === bookId);
    if (chapterId) {
      setSelectedChapterId(chapterId);
    } else {
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

  // Remove a textbook from the library
  const handleConfirmDeleteBook = () => {
    if (!bookToDelete) return;
    if (!canManageTextbooks) {
      showToast('Permission denied: Only School Proprietors, Principals, and School Admins can remove textbooks.');
      setBookToDelete(null);
      return;
    }

    const id = bookToDelete.id;
    // Add to deleted IDs
    const nextDeleted = [...deletedBookIds, id];
    setDeletedBookIds(nextDeleted);
    try {
      localStorage.setItem('texora_deleted_textbook_ids', JSON.stringify(nextDeleted));
    } catch {}

    // If it was a custom book, also filter from customBooks
    const nextCustom = customBooks.filter(b => b.id !== id);
    setCustomBooks(nextCustom);
    try {
      localStorage.setItem('texora_custom_textbooks', JSON.stringify(nextCustom));
    } catch {}

    if (selectedBookId === id) {
      setSelectedBookId(null);
      setSelectedChapterId(null);
    }

    showToast(`"${bookToDelete.title}" was removed from the Library.`);
    setBookToDelete(null);
  };

  // Restore all removed textbooks to default
  const handleRestoreAllBooks = () => {
    if (!canManageTextbooks) {
      showToast('Permission denied: Only School Proprietors, Principals, and School Admins can restore textbooks.');
      return;
    }

    setDeletedBookIds([]);
    try {
      localStorage.removeItem('texora_deleted_textbook_ids');
    } catch {}
    showToast('All default curriculum textbooks have been restored to the library.');
  };

  // AI Generate Chapters for new book
  const handleAIGenerateNewBook = async () => {
    if (!canManageTextbooks) {
      alert('Permission denied: Only School Proprietors, Principals, and School Admins can author or add new textbooks.');
      return;
    }

    const subject = newBookSubject === 'Custom' ? newBookCustomSubject : newBookSubject;
    const title = newBookTitle.trim() || `Comprehensive ${subject} for Secondary Schools`;

    if (!subject) {
      alert('Please specify a subject first.');
      return;
    }

    setIsGeneratingWithAI(true);
    try {
      const response = await fetch('/api/ai/generate-textbook-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: title,
          subject: subject,
          chapterNumber: 1,
          chapterTitle: newChapterTitle || `Foundations and Principles of ${subject}`,
          gradeLevel: newBookGradeLevels.join(', ')
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate chapter content with AI.');
      }

      const generatedChapter: TextbookChapter = {
        id: `chap_${Date.now()}_1`,
        chapterNumber: 1,
        title: data.chapter.title || newChapterTitle || `Introduction to ${subject}`,
        gradeLevel: 'Senior Secondary (SSS 1-3)',
        estimatedReadTime: data.chapter.estimatedReadTime || '15 mins read',
        summary: data.chapter.summary || `Comprehensive overview and syllabus coverage of ${subject}.`,
        keyConcepts: data.chapter.keyConcepts || [`Core principles of ${subject}`, 'Key definitions', 'Syllabus standards'],
        formulasOrRules: data.chapter.formulasOrRules || [],
        contentSections: data.chapter.contentSections || [
          {
            heading: '1. Foundational Concepts',
            body: `This unit establishes the cornerstone of ${subject}, examining its scientific definitions and practical applications across secondary curriculum.`
          }
        ],
        reviewQuestions: data.chapter.reviewQuestions || []
      };

      // Create new full digital textbook
      const newBook: DigitalTextbook = {
        id: `tb_custom_${Date.now()}`,
        title: title,
        author: newBookAuthor.trim() || 'TeXora Academic Editorial Board',
        edition: newBookEdition || 'Revised Standard Edition',
        subject: subject,
        curriculum: newBookCurriculum || 'NERDC / WAEC / NECO Standard',
        coverColor: newBookCoverColor,
        accentColor: newBookAccentColor,
        gradeLevels: newBookGradeLevels,
        description: newBookDescription.trim() || `Comprehensive digital textbook covering the full secondary school curriculum for ${subject}.`,
        isbn: `978-978-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
        totalChapters: 1,
        chapters: [generatedChapter]
      };

      const updated = [newBook, ...customBooks];
      setCustomBooks(updated);
      try {
        localStorage.setItem('texora_custom_textbooks', JSON.stringify(updated));
      } catch {}

      setIsAddBookModalOpen(false);
      resetNewBookForm();
      showToast(`Successfully created "${newBook.title}" with Texora AI!`);
      handleSelectBook(newBook.id);
    } catch (err: any) {
      console.error('Error generating book with AI:', err);
      alert(`AI Generation encountered an issue: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  // Manual Add New Book
  const handleSaveManualBook = () => {
    if (!canManageTextbooks) {
      alert('Permission denied: Only School Proprietors, Principals, and School Admins can author or add new textbooks.');
      return;
    }

    const subject = newBookSubject === 'Custom' ? newBookCustomSubject.trim() : newBookSubject;
    const title = newBookTitle.trim();

    if (!title) {
      alert('Please enter a textbook title.');
      return;
    }
    if (!subject) {
      alert('Please choose or enter a subject.');
      return;
    }

    const defaultChapter: TextbookChapter = {
      id: `chap_${Date.now()}_1`,
      chapterNumber: 1,
      title: newChapterTitle.trim() || `Introduction to ${subject}`,
      gradeLevel: 'Senior Secondary (SSS 1-3)',
      estimatedReadTime: '15 mins read',
      summary: newChapterSummary.trim() || `Foundational exploration and core curriculum concepts of ${subject}.`,
      keyConcepts: [
        `Fundamental concepts in ${subject}`,
        'Key definitions and terminology',
        'Practical syllabus applications'
      ],
      formulasOrRules: [`Principle 1 of ${subject}`, `Curriculum Benchmark Rule`],
      contentSections: [
        {
          heading: '1. Foundational Overview & Definitions',
          subheading: 'Core Curriculum Scope',
          body: `Welcome to Unit 1 of ${title}. This section outlines the essential principles and real-world mechanisms governing ${subject}. Students are encouraged to take study notes, review diagrams, and attempt the review questions.`,
          keyTakeaway: `Mastery of basic definitions is critical for achieving distinctions in examination schemes.`
        },
        {
          heading: '2. Detailed Analysis and Practical Applications',
          body: `Further exploration into ${subject} provides students with the contextual knowledge required by NERDC and WAEC standards. Worked examples and methodical drills ensure exam confidence.`,
          workedExamples: [
            {
              problem: `Sample Examination Problem for ${subject}: Explain the primary mechanism under standard conditions.`,
              stepByStepSolution: [
                'Identify given variables and fundamental definitions.',
                'Apply the canonical formula or qualitative analysis.',
                'Verify consistency with curriculum standards.'
              ],
              answer: 'Complete step-by-step resolution established.'
            }
          ]
        }
      ],
      reviewQuestions: [
        {
          question: `Which of the following best summarizes the primary objective of studying ${subject}?`,
          options: [
            `A. Understanding structural mechanisms and laws`,
            `B. Memorizing unrelated terminologies`,
            `C. Ignoring syllabus benchmarks`,
            `D. None of the above`
          ],
          correctAnswer: 'A. Understanding structural mechanisms and laws',
          explanation: 'Comprehensive academic study prioritizes understanding fundamental mechanisms and natural laws.',
          type: 'MULTIPLE_CHOICE'
        }
      ]
    };

    const newBook: DigitalTextbook = {
      id: `tb_custom_${Date.now()}`,
      title: title,
      author: newBookAuthor.trim() || 'Curriculum Subject Panel',
      edition: newBookEdition.trim() || '1st National Edition',
      subject: subject,
      curriculum: newBookCurriculum.trim() || 'NERDC / WAEC / NECO Standard',
      coverColor: newBookCoverColor,
      accentColor: newBookAccentColor,
      gradeLevels: newBookGradeLevels.length > 0 ? newBookGradeLevels : ['SSS 1', 'SSS 2', 'SSS 3'],
      description: newBookDescription.trim() || `Official secondary school digital textbook for ${subject}.`,
      isbn: `978-978-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
      totalChapters: 1,
      chapters: [defaultChapter]
    };

    const updated = [newBook, ...customBooks];
    setCustomBooks(updated);
    try {
      localStorage.setItem('texora_custom_textbooks', JSON.stringify(updated));
    } catch {}

    setIsAddBookModalOpen(false);
    resetNewBookForm();
    showToast(`Added "${newBook.title}" to your digital textbook library!`);
    handleSelectBook(newBook.id);
  };

  const resetNewBookForm = () => {
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookSubject('Biology');
    setNewBookCustomSubject('');
    setNewBookEdition('Revised Curriculum Edition');
    setNewBookCurriculum('NERDC / WAEC / NECO Standard');
    setNewBookGradeLevels(['SSS 1', 'SSS 2', 'SSS 3']);
    setNewBookDescription('');
    setNewChapterTitle('Introduction to the Subject & Core Principles');
    setNewChapterSummary('Fundamental concepts, core definitions, and initial exploration.');
  };

  const toggleGradeSelection = (lvl: string) => {
    setNewBookGradeLevels(prev =>
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'biology':
      case 'agricultural science':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'chemistry':
        return <TestTube className="w-5 h-5 text-cyan-400" />;
      case 'physics':
        return <Atom className="w-5 h-5 text-violet-400" />;
      case 'general mathematics':
      case 'mathematics':
      case 'further mathematics':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'english language':
      case 'english':
      case 'literature in english':
        return <Languages className="w-5 h-5 text-rose-400" />;
      case 'economics':
      case 'financial accounting':
      case 'commerce':
        return <DollarSign className="w-5 h-5 text-teal-400" />;
      case 'government':
      case 'civic education':
      case 'history':
        return <Landmark className="w-5 h-5 text-orange-400" />;
      case 'computer science':
      case 'data processing':
      case 'ict':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Distinct subjects available for filter
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    allTextbooks.forEach(b => subs.add(b.subject));
    return Array.from(subs);
  }, [allTextbooks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <BookOpen className="w-80 h-80 text-indigo-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{canManageTextbooks ? 'CURRICULUM MANAGEMENT & DIGITAL LIBRARY' : 'OFFICIAL DIGITAL CURRICULUM TEXTBOOK E-LIBRARY'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Official Digital Curriculum Textbooks
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {canManageTextbooks
                ? 'Complete, full-edition secondary school textbooks with interactive chapter study notes, worked examples, formulas, and self-assessment quizzes. Easily add custom textbooks or manage your curriculum library.'
                : 'Complete, full-edition secondary school textbooks with interactive chapter study notes, worked examples, formulas, and self-assessment quizzes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManageTextbooks && (
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-900/50 transition-all cursor-pointer"
              >
                <BookPlus className="w-4 h-4 text-amber-300" />
                <span>Add Textbook</span>
              </button>
            )}

            {canManageTextbooks && deletedBookIds.length > 0 && (
              <button
                onClick={handleRestoreAllBooks}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
                title="Restore all removed default textbooks"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restore ({deletedBookIds.length})</span>
              </button>
            )}

            {selectedBook && (
              <button
                onClick={() => { setSelectedBookId(null); setSelectedChapterId(null); }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Textbooks ({allTextbooks.length})</span>
              </button>
            )}

            {onBackToDashboard && !selectedBook && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer border border-slate-700"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Library Grid vs Chapter Reader */}
      {!selectedBook ? (
        <div className="space-y-6">
          {/* Search, Filter & Scope Control Center */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Top Row: Search Input + Search Field Scope Selector */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Live Search Input with Clear Button */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    searchField === 'TITLE'
                      ? 'Search textbooks by title or edition (e.g. Modern Biology, New School Physics)...'
                      : searchField === 'AUTHOR'
                      ? 'Search textbooks by author name (e.g. Ramalingam, Ababio, Anyakoha)...'
                      : searchField === 'SUBJECT'
                      ? 'Search by subject area or discipline (e.g. Chemistry, Mathematics, Biology)...'
                      : searchField === 'CHAPTERS'
                      ? 'Search by chapter topics, formulas, or concepts (e.g. Optics, Quantum, BODMAS)...'
                      : 'Search by title, author (e.g. Ababio, Ramalingam), subject area, or key concepts...'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Scope Tabs: ALL | TITLE | AUTHOR | SUBJECT */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto shrink-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2.5 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Scope:</span>
                </span>
                <button
                  onClick={() => setSearchField('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    searchField === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  All Fields
                </button>
                <button
                  onClick={() => setSearchField('TITLE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    searchField === 'TITLE'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Title
                </button>
                <button
                  onClick={() => setSearchField('AUTHOR')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    searchField === 'AUTHOR'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Author</span>
                </button>
                <button
                  onClick={() => setSearchField('SUBJECT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    searchField === 'SUBJECT'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>Subject</span>
                </button>
                <button
                  onClick={() => setSearchField('CHAPTERS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    searchField === 'CHAPTERS'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Chapters
                </button>
              </div>
            </div>

            {/* Middle Row: Subject Area / Discipline Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
                Discipline:
              </span>
              <button
                onClick={() => setDisciplineFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>All Disciplines</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 dark:bg-slate-200 text-slate-200 dark:text-slate-800">
                  {disciplineCounts.ALL}
                </span>
              </button>

              <button
                onClick={() => setDisciplineFilter('SCIENCES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'SCIENCES'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>Sciences (STEM)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                  {disciplineCounts.SCIENCES}
                </span>
              </button>

              <button
                onClick={() => setDisciplineFilter('MATHEMATICS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'MATHEMATICS'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Mathematics</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                  {disciplineCounts.MATHEMATICS}
                </span>
              </button>

              <button
                onClick={() => setDisciplineFilter('LANGUAGES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'LANGUAGES'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Languages</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200">
                  {disciplineCounts.LANGUAGES}
                </span>
              </button>

              <button
                onClick={() => setDisciplineFilter('COMMERCIAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'COMMERCIAL'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Commercial</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200">
                  {disciplineCounts.COMMERCIAL}
                </span>
              </button>

              <button
                onClick={() => setDisciplineFilter('HUMANITIES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  disciplineFilter === 'HUMANITIES'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/60'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Humanities</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200">
                  {disciplineCounts.HUMANITIES}
                </span>
              </button>
            </div>

            {/* Bottom Row: Detailed Dropdown Filters & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Grade Level Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="font-bold">Level:</span>
                  <select
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
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
                </div>

                {/* Specific Subject Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold">Subject:</span>
                  <select
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Subjects ({availableSubjects.length})</option>
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="font-bold">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="DEFAULT">Recommended / Default</option>
                  <option value="TITLE_ASC">Title (A - Z)</option>
                  <option value="TITLE_DESC">Title (Z - A)</option>
                  <option value="AUTHOR_ASC">Author (A - Z)</option>
                  <option value="SUBJECT_ASC">Subject Area (A - Z)</option>
                  <option value="CHAPTERS_DESC">Most Curriculum Units</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary & Popular Suggestions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  Showing <strong className="text-slate-800 dark:text-slate-200">{filteredBooks.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{allTextbooks.length}</strong> textbooks
                </span>

                {/* Active Filter Chips */}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                    Query: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-indigo-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchField !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    Scope: {searchField}
                    <button onClick={() => setSearchField('ALL')} className="hover:text-slate-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {disciplineFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800">
                    Discipline: {disciplineFilter}
                    <button onClick={() => setDisciplineFilter('ALL')} className="hover:text-purple-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {gradeFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800">
                    Level: {gradeFilter}
                    <button onClick={() => setGradeFilter('ALL')} className="hover:text-amber-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {subjectFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-medium border border-cyan-200 dark:border-cyan-800">
                    Subject: {subjectFilter}
                    <button onClick={() => setSubjectFilter('ALL')} className="hover:text-cyan-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Quick suggestions or Reset All button */}
              {(searchQuery || searchField !== 'ALL' || disciplineFilter !== 'ALL' || gradeFilter !== 'ALL' || subjectFilter !== 'ALL' || sortBy !== 'DEFAULT') ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchField('ALL');
                    setDisciplineFilter('ALL');
                    setGradeFilter('ALL');
                    setSubjectFilter('ALL');
                    setSortBy('DEFAULT');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Try:</span>
                  <button onClick={() => setSearchQuery('Ramalingam')} className="hover:text-indigo-500 font-medium underline">Ramalingam</button>
                  <span>•</span>
                  <button onClick={() => setSearchQuery('Ababio')} className="hover:text-indigo-500 font-medium underline">Ababio</button>
                  <span>•</span>
                  <button onClick={() => setSearchQuery('Anyakoha')} className="hover:text-indigo-500 font-medium underline">Anyakoha</button>
                  <span>•</span>
                  <button onClick={() => setSearchQuery('Mathematics')} className="hover:text-indigo-500 font-medium underline">Mathematics</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Curriculum Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {allTextbooks.slice(0, 6).map(b => {
              const Icon = getSubjectIcon(b.subject);
              const isSelectedInFilter = subjectFilter === b.subject || searchQuery.toLowerCase() === b.subject.toLowerCase();
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSubjectFilter(b.subject);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer ${
                    isSelectedInFilter
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                      {Icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {b.chapters.length} Units
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {b.author.split(',')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No textbooks match your search or filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No textbooks found for "${searchQuery}" in ${searchField.toLowerCase()} field.`
                  : 'No textbooks match the selected subject, discipline, or grade filters.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchField('ALL');
                    setDisciplineFilter('ALL');
                    setGradeFilter('ALL');
                    setSubjectFilter('ALL');
                    setSortBy('DEFAULT');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
                {canManageTextbooks && (
                  <button
                    onClick={() => setIsAddBookModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    Add New Textbook
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => {
                // Check if search query matched author, subject or specific chapter topic
                const query = searchQuery.trim().toLowerCase();
                const matchedInAuthor = query && book.author.toLowerCase().includes(query);
                const matchedInSubject = query && book.subject.toLowerCase().includes(query);
                const matchedChapter = query ? book.chapters.find(c => c.title.toLowerCase().includes(query) || c.keyConcepts.some(k => k.toLowerCase().includes(query))) : null;

                return (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
                  >
                    {/* Book Header Visual Banner */}
                    <div className={`p-6 bg-gradient-to-br ${book.coverColor} text-white relative`}>
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                          {book.curriculum}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {canManageTextbooks && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookToDelete(book);
                              }}
                              className="p-1.5 rounded-lg bg-black/20 hover:bg-rose-600/90 text-white/80 hover:text-white transition-all cursor-pointer opacity-80 hover:opacity-100"
                              title="Remove textbook from library"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white">
                            {getSubjectIcon(book.subject)}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-black mt-4 line-clamp-2 leading-tight">
                        {book.title}
                      </h3>
                      
                      {/* Author Tag */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-200">
                        <User className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                        <span className="line-clamp-1 font-semibold">
                          {book.author}
                        </span>
                      </div>

                      {/* Subject & Grade Level Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white/20 text-white border border-white/20">
                          {book.subject}
                        </span>
                        {book.gradeLevels.map((lvl, idx) => (
                          <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                            {lvl}
                          </span>
                        ))}
                      </div>

                      {/* Search match highlights if any */}
                      {query && (matchedInAuthor || matchedInSubject || matchedChapter) && (
                        <div className="mt-3 pt-2 border-t border-white/15 text-[10px] text-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                          <span className="truncate">
                            {matchedInAuthor
                              ? `Matched Author: ${book.author}`
                              : matchedInSubject
                              ? `Matched Subject: ${book.subject}`
                              : `Matched Topic: ${matchedChapter?.title}`}
                          </span>
                        </div>
                      )}
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
                              + {book.chapters.length - 3} more curriculum units available...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleSelectBook(book.id)}
                          className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Open Complete Textbook</span>
                        </button>

                        {canManageTextbooks && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookToDelete(book);
                            }}
                            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Remove textbook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                <div className="flex items-center gap-1.5">
                  {canManageTextbooks && (
                    <button
                      onClick={() => setBookToDelete(selectedBook)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors text-xs font-bold"
                      title="Remove this textbook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedBookId(null); setSelectedChapterId(null); }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-bold"
                    title="Back to All Textbooks"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
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
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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

      {/* Add New Textbook Modal */}
      {isAddBookModalOpen && canManageTextbooks && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300">
                  <BookPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Add Digital Textbook to Library</h3>
                  <p className="text-xs text-indigo-200">Author a new volume or auto-generate syllabus units with Texora AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Textbook Title *
                  </label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={e => setNewBookTitle(e.target.value)}
                    placeholder="e.g. Essential Agricultural Science"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Author / Editorial Board
                  </label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={e => setNewBookAuthor(e.target.value)}
                    placeholder="e.g. Dr. O. A. Iwena, F.S.A."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject Category
                  </label>
                  <select
                    value={newBookSubject}
                    onChange={e => setNewBookSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="General Mathematics">General Mathematics</option>
                    <option value="Further Mathematics">Further Mathematics</option>
                    <option value="English Language">English Language</option>
                    <option value="Literature in English">Literature in English</option>
                    <option value="Economics">Economics</option>
                    <option value="Government">Government</option>
                    <option value="Civic Education">Civic Education</option>
                    <option value="Agricultural Science">Agricultural Science</option>
                    <option value="Computer Science">Computer Science & ICT</option>
                    <option value="Financial Accounting">Financial Accounting</option>
                    <option value="Geography">Geography</option>
                    <option value="Custom">Custom Subject...</option>
                  </select>
                </div>

                {newBookSubject === 'Custom' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Specify Custom Subject Name
                    </label>
                    <input
                      type="text"
                      value={newBookCustomSubject}
                      onChange={e => setNewBookCustomSubject(e.target.value)}
                      placeholder="e.g. Basic Technology / Visual Arts"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Curriculum Standard
                    </label>
                    <input
                      type="text"
                      value={newBookCurriculum}
                      onChange={e => setNewBookCurriculum(e.target.value)}
                      placeholder="e.g. NERDC / WAEC / NECO Standard"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Target Grade Levels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Grade Levels
                </label>
                <div className="flex flex-wrap gap-2">
                  {['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3', 'Senior Secondary'].map(lvl => {
                    const isSelected = newBookGradeLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => toggleGradeSelection(lvl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cover Visual Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COVER_THEMES.map(th => {
                    const isSelected = newBookCoverColor === th.value;
                    return (
                      <button
                        type="button"
                        key={th.label}
                        onClick={() => {
                          setNewBookCoverColor(th.value);
                          setNewBookAccentColor(th.accent);
                        }}
                        className={`p-2.5 rounded-xl text-left text-white text-[11px] font-bold bg-gradient-to-br ${th.value} border-2 transition-all cursor-pointer ${
                          isSelected ? 'border-amber-400 scale-[1.02] shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        {th.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Syllabus Scope
                </label>
                <textarea
                  rows={2}
                  value={newBookDescription}
                  onChange={e => setNewBookDescription(e.target.value)}
                  placeholder="Detailed summary of curriculum modules, learning goals and examination readiness..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Chapter 1 Setup */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                    Unit 1: Initial Chapter Title
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                    Module 1
                  </span>
                </div>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  placeholder="e.g. Fundamental Concepts, Principles & Taxonomy"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsAddBookModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {/* AI Auto-generate button */}
                <button
                  type="button"
                  onClick={handleAIGenerateNewBook}
                  disabled={isGeneratingWithAI}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer transition-all"
                  title="Generate complete textbook chapter, formulas, worked examples and review quiz questions using Texora AI"
                >
                  {isGeneratingWithAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Texora AI Authoring Units...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>AI Generate with Texora</span>
                    </>
                  )}
                </button>

                {/* Manual Save */}
                <button
                  type="button"
                  onClick={handleSaveManualBook}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer transition-all"
                >
                  Save Textbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Remove Confirmation Modal */}
      {bookToDelete && canManageTextbooks && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="p-3 w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Remove Textbook from Library?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to remove <strong>"{bookToDelete.title}"</strong> ({bookToDelete.chapters.length} Units)?
              </p>
              <p className="text-[11px] text-slate-400">
                You can restore default curriculum textbooks at any time using the "Restore" button.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBook}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
