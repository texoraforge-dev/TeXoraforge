/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Image as ImageIcon,
  Film,
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Eye,
  Sliders,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Play,
  Layers,
  FileImage,
  Video,
  X,
  Share2,
  ExternalLink,
  BookOpen,
  Atom,
  Globe,
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { useAppStore } from '../storage';
import { GeneratedAIMediaItem, AIMediaType } from '../types';
import { FirebaseService } from '../lib/firebaseService';

interface AIMediaStudioProps {
  onBack?: () => void;
  onInsertIntoLesson?: (imageUrl: string) => void;
}

const SAMPLE_EDUCATIONAL_IMAGES = [
  {
    id: 'sample_plant_cell',
    title: 'Plant Cell 3D Diagram',
    category: 'Biology',
    url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80',
    prompt: 'Detailed 3D cutaway diagram of a eukaryotic plant cell with chloroplasts, vacuole, cell wall, and nucleus clearly labeled',
    aspectRatio: '1:1' as const,
  },
  {
    id: 'sample_solar_system',
    title: 'Solar System Orbits',
    category: 'Physics & Astronomy',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    prompt: 'Cosmic cinematic view of the solar system planets orbiting the sun with glowing orbital paths and nebula in the background',
    aspectRatio: '16:9' as const,
  },
  {
    id: 'sample_chemistry_lab',
    title: 'Chemistry Laboratory Apparatus',
    category: 'Chemistry',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    prompt: 'Modern high school chemistry laboratory distillation glassware set with colorful reacting solutions and steam condensation',
    aspectRatio: '16:9' as const,
  },
  {
    id: 'sample_ancient_history',
    title: 'Ancient Benin Bronze Sculptors',
    category: 'History',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    prompt: 'Atmospheric historical depiction of 16th-century Benin Kingdom master artisans crafting intricate bronze royal relief sculptures',
    aspectRatio: '4:3' as const,
  }
];

const PRESET_IMAGE_PROMPTS = [
  {
    category: 'Biology',
    icon: Atom,
    prompts: [
      'Labeled 3D diagram of human heart anatomy showing ventricles, atria, aorta, and oxygenated blood flow arrows in medical textbook style',
      'Microscopic view of mitosis cell division phases (prophase, metaphase, anaphase, telophase) with fluorescent stained chromosomes',
      'Detailed cross-section of a green leaf showing epidermis, stomata guard cells, xylem, and phloem vascular bundles',
    ]
  },
  {
    category: 'Chemistry & Physics',
    icon: Zap,
    prompts: [
      'Electromagnetic spectrum infographic with wavelength frequencies, radio waves, visible light prism refraction, and gamma rays',
      'Detailed 3D laboratory titration apparatus with burette, conical flask, magnetic stirrer, and color-changing indicator',
      'Bohr model vs quantum mechanical electron cloud model of Carbon and Gold atoms with orbital electron shells',
    ]
  },
  {
    category: 'Geography & Earth Science',
    icon: Globe,
    prompts: [
      '3D cutaway cross-section of Earth interior layers showing inner core, outer molten core, mantle convection, and crust tectonic plates',
      'Volcanic eruption anatomy diagram showing magma chamber, conduit vent, pyroclastic cloud, and lava flow with academic labels',
      'Complete water hydrological cycle diagram with evaporation, condensation, precipitation, transpiration, and groundwater runoff',
    ]
  },
  {
    category: 'History & Culture',
    icon: Compass,
    prompts: [
      'Historical panoramic painting of ancient Mali Empire Timbuktu University and Sankore Mosque during Mansa Musa golden age',
      'Traditional Nigerian Nok terracotta sculpture excavated in archaeological field setting with careful field brushes',
      'Ancient Egyptian pyramids and Sphinx construction architectural site with Nile river trade barges',
    ]
  },
  {
    category: 'School & Campus',
    icon: BookOpen,
    prompts: [
      'Vibrant academic emblem seal with golden olive branches, open book, burning torch of knowledge, and Latin motto scroll',
      'Students in neat modern school uniforms conducting an interactive robotics and AI experiment in a bright high-tech classroom',
      'Certificate of Excellence decorative border design with royal blue ribbons, gold foil geometric motifs, and clean typography space',
    ]
  }
];

const PRESET_VIDEO_MOTION_PROMPTS = [
  'Smooth cinematic push-in with natural camera motion, realistic ambient light glinting across surfaces',
  'Gentle cytoplasmic streaming and fluid particles swirling naturally in rhythmic microscopic motion',
  'Atmospheric slow camera pan with subtle floating dust particles and warm dramatic volumetric sunlight',
  'Subtle natural character motion with gentle eye blinking, head turning, and authentic breathing dynamics',
  'Dynamic time-lapse camera rotation orbiting the scene with cinematic motion blur and high clarity'
];

export const AIMediaStudio: React.FC<AIMediaStudioProps> = ({ onBack, onInsertIntoLesson }) => {
  const { currentUser, currentSchool } = useAppStore();
  const [activeTab, setActiveTab] = useState<'image_studio' | 'video_studio' | 'gallery'>('image_studio');

  // Image Studio State
  const [imageMode, setImageMode] = useState<'generate' | 'edit'>('generate');
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [selectedImageSize, setSelectedImageSize] = useState<'512px' | '1K' | '2K'>('1K');
  const [uploadedEditImage, setUploadedEditImage] = useState<string | null>(null);
  const [uploadedEditMime, setUploadedEditMime] = useState<string>('image/png');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generatedImageResult, setGeneratedImageResult] = useState<{
    url: string;
    prompt: string;
    aspectRatio: string;
    description?: string;
  } | null>(null);

  // Video Studio State (Veo)
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoSourceMime, setVideoSourceMime] = useState<string>('image/png');
  const [videoPrompt, setVideoPrompt] = useState('Animate this image with smooth natural cinematic motion, clear focus, and subtle dynamic movement');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationStep, setVideoGenerationStep] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);

  // Media Library History (persisted in session)
  const [mediaHistory, setMediaHistory] = useState<GeneratedAIMediaItem[]>(() => {
    try {
      const stored = localStorage.getItem('texora_ai_media_history');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'hist_1',
        type: 'IMAGE',
        title: 'Plant Cell Eukaryotic Anatomy',
        prompt: 'Detailed 3D cutaway diagram of a eukaryotic plant cell with chloroplasts, vacuole, cell wall, and nucleus clearly labeled',
        url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80',
        aspectRatio: '1:1',
        modelUsed: 'gemini-3.1-flash-image-preview',
        mode: 'generate',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdByName: 'Curriculum AI Specialist',
        subjectTag: 'Biology'
      },
      {
        id: 'hist_2',
        type: 'IMAGE',
        title: 'Cosmic Solar System Planetary Orbits',
        prompt: 'Cosmic cinematic view of the solar system planets orbiting the sun with glowing orbital paths',
        url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
        aspectRatio: '16:9',
        modelUsed: 'gemini-3.1-flash-image-preview',
        mode: 'generate',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        createdByName: 'Science Faculty',
        subjectTag: 'Physics'
      }
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoImageInputRef = useRef<HTMLInputElement>(null);

  // Save history to storage
  useEffect(() => {
    try {
      localStorage.setItem('texora_ai_media_history', JSON.stringify(mediaHistory));
    } catch {
      // ignore
    }
  }, [mediaHistory]);

  // Handle Edit Image Upload
  const handleEditImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setUploadedEditImage(e.target.result);
        setUploadedEditMime(file.type);
        setImageError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Video Image Upload
  const handleVideoImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVideoError('Please upload a valid image file (PNG, JPEG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setVideoSourceImage(e.target.result);
        setVideoSourceMime(file.type);
        setVideoError(null);
        setGeneratedVideoUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Gemini 3.1 Flash Image Generation / Edit
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError('Please enter a descriptive prompt for your visual illustration.');
      return;
    }

    if (imageMode === 'edit' && !uploadedEditImage) {
      setImageError('Please upload an initial image to edit or transform.');
      return;
    }

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/ai/image/generate-or-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          base64Image: imageMode === 'edit' ? uploadedEditImage : undefined,
          mimeType: imageMode === 'edit' ? uploadedEditMime : undefined,
          aspectRatio: selectedAspectRatio,
          imageSize: selectedImageSize
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to generate image with Gemini 3.1.');
      }

      const newResult = {
        url: data.imageUrl,
        prompt: imagePrompt.trim(),
        aspectRatio: data.aspectRatio || selectedAspectRatio,
        description: data.description
      };

      setGeneratedImageResult(newResult);

      // Save to media history
      const newHistoryItem: GeneratedAIMediaItem = {
        id: 'img_' + Date.now(),
        type: 'IMAGE',
        title: imagePrompt.trim().substring(0, 45) + (imagePrompt.length > 45 ? '...' : ''),
        prompt: imagePrompt.trim(),
        url: data.imageUrl,
        aspectRatio: selectedAspectRatio,
        modelUsed: 'gemini-3.1-flash-image-preview',
        mode: imageMode,
        sourceImageUrl: imageMode === 'edit' ? uploadedEditImage || undefined : undefined,
        createdAt: new Date().toISOString(),
        createdByName: currentUser?.name || 'Academic Educator',
        createdByUserId: currentUser?.id,
        subjectTag: 'General'
      };

      setMediaHistory(prev => [newHistoryItem, ...prev]);
      FirebaseService.saveAIMediaItem(newHistoryItem).catch(err => {
        console.warn('Firestore AI media save note:', err);
      });
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setImageError(err.message || 'An error occurred while communicating with Gemini Image Preview API.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Transfer image to Veo Video Tab
  const handleTransferToVeo = (imageUrl: string) => {
    setVideoSourceImage(imageUrl);
    setVideoSourceMime('image/png');
    setActiveTab('video_studio');
    setVideoError(null);
    setGeneratedVideoUrl(null);
  };

  // Execute Veo Video Generation
  const handleGenerateVeoVideo = async () => {
    if (!videoSourceImage) {
      setVideoError('Please upload a source photo or choose one from the sample library.');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setVideoGenerationStep('Initializing Veo Video Engine (veo-3.1-fast-generate-preview)...');
    setPollAttempt(0);

    try {
      // Step 1: Start Veo Operation
      const startRes = await fetch('/api/ai/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt.trim() || 'Animate this photo with subtle natural cinematic motion',
          base64Image: videoSourceImage,
          mimeType: videoSourceMime,
          aspectRatio: videoAspectRatio
        })
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        throw new Error(startData.details || startData.error || 'Failed to initialize Veo generation.');
      }

      const operationName = startData.operationName;
      setVideoOperationName(operationName);

      // Step 2: Poll operation status every 5 seconds
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // Up to 5 minutes

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        setPollAttempt(attempts);

        if (attempts === 1) {
          setVideoGenerationStep('Synthesizing temporal frame coherence & physics simulation...');
        } else if (attempts === 3) {
          setVideoGenerationStep('Rendering 720p cinematic frames with realistic lighting...');
        } else if (attempts === 6) {
          setVideoGenerationStep('Finalizing video interpolation and MP4 encoding...');
        } else if (attempts > 8) {
          setVideoGenerationStep(`Processing final high-fidelity motion pass (attempt ${attempts}/${maxAttempts})...`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        const pollRes = await fetch('/api/ai/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });

        const pollData = await pollRes.json();

        if (pollData.error) {
          throw new Error(`Veo generation encountered an issue: ${pollData.error}`);
        }

        if (pollData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. The operation is still processing in the background.');
      }

      // Step 3: Download Video Stream
      setVideoGenerationStep('Downloading animated MP4 video stream from Veo...');

      const downloadRes = await fetch('/api/ai/video/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName })
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to retrieve video payload from Veo storage.');
      }

      const videoBlob = await downloadRes.blob();
      const videoBlobUrl = URL.createObjectURL(videoBlob);

      setGeneratedVideoUrl(videoBlobUrl);
      setVideoGenerationStep('Complete!');

      // Save to media history
      const newVideoHistoryItem: GeneratedAIMediaItem = {
        id: 'vid_' + Date.now(),
        type: 'VIDEO',
        title: (videoPrompt.trim().substring(0, 45) || 'Veo Animated Educational Video'),
        prompt: videoPrompt.trim(),
        url: videoBlobUrl,
        aspectRatio: videoAspectRatio,
        modelUsed: 'veo-3.1-fast-generate-preview',
        sourceImageUrl: videoSourceImage,
        createdAt: new Date().toISOString(),
        createdByName: currentUser?.name || 'Educator',
        createdByUserId: currentUser?.id,
        subjectTag: 'Animation'
      };

      setMediaHistory(prev => [newVideoHistoryItem, ...prev]);
      FirebaseService.saveAIMediaItem(newVideoHistoryItem).catch(err => {
        console.warn('Firestore AI video save note:', err);
      });
    } catch (err: any) {
      console.error('Veo Video Generation Error:', err);
      setVideoError(err.message || 'Error occurred during Veo video generation.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-white/15 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gemini 3.1 & Veo Generation Lab
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                Live Server Integration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-indigo-400" />
              AI Creative & Multimedia Studio
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Create and edit textbook illustrations, 3D anatomical diagrams, and historical scenes with <span className="font-semibold text-white">gemini-3.1-flash-image-preview</span>, or animate educational photos into cinematic videos with <span className="font-semibold text-white">veo-3.1-fast-generate-preview</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Back to Dashboard
              </button>
            )}
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Library: <strong className="text-white">{mediaHistory.length}</strong> items saved</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('image_studio')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'image_studio'
                ? 'bg-white text-indigo-950 shadow-lg'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <span>Create & Edit Images</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-mono">Gemini 3.1</span>
          </button>

          <button
            onClick={() => setActiveTab('video_studio')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'video_studio'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <Film className="w-4 h-4 text-purple-600" />
            <span>Animate Photos to Video</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-mono">Veo 3.1</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Media Library Showcase ({mediaHistory.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GEMINI 3.1 IMAGE CREATOR & EDITOR */}
      {activeTab === 'image_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Mode Switcher */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Image Studio Workspace</h2>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setImageMode('generate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      imageMode === 'generate'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    ✨ Text-to-Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('edit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      imageMode === 'edit'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🎨 Image-to-Image Edit
                  </button>
                </div>
              </div>

              {/* If in Edit Mode: Image Dropzone */}
              {imageMode === 'edit' && (
                <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      1. Upload Source Image to Edit & Transform
                    </span>
                    {uploadedEditImage && (
                      <button
                        onClick={() => setUploadedEditImage(null)}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {uploadedEditImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800 max-h-56 bg-slate-900 flex items-center justify-center">
                      <img
                        src={uploadedEditImage}
                        alt="Source to edit"
                        className="max-h-56 w-auto object-contain"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md">
                        Source Image Loaded
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer py-8 flex flex-col items-center justify-center text-center hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    >
                      <FileImage className="w-10 h-10 text-indigo-500 mb-2" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click or Drag & Drop Image Here
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Supports PNG, JPG, WebP (up to 20MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditImageUpload(file);
                        }}
                      />
                    </div>
                  )}

                  {/* Or Pick a Sample Image */}
                  <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                      Or select an academic template to edit:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {SAMPLE_EDUCATIONAL_IMAGES.map(samp => (
                        <button
                          key={samp.id}
                          type="button"
                          onClick={() => {
                            setUploadedEditImage(samp.url);
                            setUploadedEditMime('image/jpeg');
                            setImagePrompt(`Modify this ${samp.title.toLowerCase()} to highlight key structures with clear vibrant color coding.`);
                          }}
                          className="text-left group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all"
                        >
                          <img src={samp.url} alt={samp.title} className="w-full h-12 object-cover group-hover:scale-105 transition-all" />
                          <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] font-bold text-white leading-tight">
                            {samp.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Prompt Input */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {imageMode === 'generate' ? 'Describe Your Image Prompt' : 'Editing / Transformation Instructions'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Model: <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">gemini-3.1-flash-image-preview</code>
                  </span>
                </div>

                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={
                    imageMode === 'generate'
                      ? 'e.g. A high-resolution 3D labeled diagram of human heart anatomy with red and blue blood flow arrows, medical textbook illustration style...'
                      : 'e.g. Add golden glowing labels pointing to the nucleus and mitochondria, and make the background a dark scientific laboratory grid...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>

              {/* Aspect Ratio & Resolution Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: '1:1', label: '1:1', desc: 'Square' },
                      { id: '16:9', label: '16:9', desc: 'Wide' },
                      { id: '9:16', label: '9:16', desc: 'Story' },
                      { id: '4:3', label: '4:3', desc: 'Classic' },
                      { id: '3:4', label: '3:4', desc: 'Book' },
                    ].map(ar => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setSelectedAspectRatio(ar.id as any)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          selectedAspectRatio === ar.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">{ar.label}</div>
                        <div className="text-[9px] text-slate-400">{ar.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Resolution Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1K', label: '1K Standard', desc: 'Optimal detail' },
                      { id: '512px', label: '512px Fast', desc: 'Quick draft' },
                      { id: '2K', label: '2K Ultra HD', desc: 'Print quality' },
                    ].map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setSelectedImageSize(res.id as any)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          selectedImageSize === res.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">{res.label}</div>
                        <div className="text-[9px] text-slate-400">{res.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {imageError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isGeneratingImage}
                onClick={handleGenerateImage}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating Visual with Gemini 3.1 Flash Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>{imageMode === 'generate' ? 'Generate Educational Visual' : 'Apply AI Image Edits'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Educational Prompt Presets */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Quick Academic Subject Prompt Inspiration
              </h3>
              <div className="space-y-4">
                {PRESET_IMAGE_PROMPTS.map((category, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <category.icon className="w-3.5 h-3.5" />
                      <span>{category.category}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {category.prompts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setImagePrompt(p);
                            if (p.includes('16:9') || p.includes('panoramic') || p.includes('spectrum')) {
                              setSelectedAspectRatio('16:9');
                            }
                          }}
                          className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 transition-all hover:border-indigo-400"
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  Generated Image Preview
                </h3>
                {generatedImageResult && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                    Ratio {generatedImageResult.aspectRatio}
                  </span>
                )}
              </div>

              {generatedImageResult ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 group">
                    <img
                      src={generatedImageResult.url}
                      alt={generatedImageResult.prompt}
                      className="w-full h-auto max-h-[420px] object-contain mx-auto"
                    />

                    {/* Overlay Action Toolbar */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all">
                      <button
                        type="button"
                        onClick={() => setLightboxImage(generatedImageResult.url)}
                        title="Fullscreen Zoom"
                        className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs transition-all"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <a
                        href={generatedImageResult.url}
                        download="gemini-educational-image.png"
                        title="Download Image"
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Prompt Description
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {generatedImageResult.prompt}
                    </p>
                  </div>

                  {/* Primary Workflow Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTransferToVeo(generatedImageResult.url)}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Film className="w-4 h-4" />
                      <span>Animate this Image into Video (Veo 3.1)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {onInsertIntoLesson && (
                      <button
                        type="button"
                        onClick={() => onInsertIntoLesson(generatedImageResult.url)}
                        className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Insert Directly into Active Lesson Note</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-3 text-indigo-500">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    No Image Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Type a prompt or choose a subject preset on the left, then click Generate to create high-detail visual learning media.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VEO 3.1 PHOTO-TO-VIDEO ANIMATION STUDIO */}
      {activeTab === 'video_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Photo-to-Video Animation Studio</h2>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                  Model: veo-3.1-fast-generate-preview
                </span>
              </div>

              {/* Source Photo Upload / Selection */}
              <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-600" />
                    1. Upload Source Photo to Animate with Veo
                  </span>
                  {videoSourceImage && (
                    <button
                      onClick={() => setVideoSourceImage(null)}
                      className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove Image
                    </button>
                  )}
                </div>

                {videoSourceImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-purple-300 dark:border-purple-800 max-h-60 bg-slate-950 flex items-center justify-center">
                    <img
                      src={videoSourceImage}
                      alt="Source for Veo"
                      className="max-h-60 w-auto object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Ready for Veo Video Synthesis
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => videoImageInputRef.current?.click()}
                    className="cursor-pointer py-8 flex flex-col items-center justify-center text-center hover:bg-purple-100/40 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                  >
                    <Upload className="w-10 h-10 text-purple-500 mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload Educational Photo / Artwork
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Upload your science project photo, historical portrait, or textbook diagram
                    </p>
                    <input
                      ref={videoImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoImageUpload(file);
                      }}
                    />
                  </div>
                )}

                {/* Sample Educational Image Quick Select */}
                <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                    Or select a pre-loaded educational photo to animate:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_EDUCATIONAL_IMAGES.map(samp => (
                      <button
                        key={samp.id}
                        type="button"
                        onClick={() => {
                          setVideoSourceImage(samp.url);
                          setVideoSourceMime('image/jpeg');
                          setVideoPrompt(`Animate this ${samp.title.toLowerCase()} with realistic natural cinematic motion and dynamic lighting.`);
                          if (samp.aspectRatio === '16:9') setVideoAspectRatio('16:9');
                        }}
                        className="text-left group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all"
                      >
                        <img src={samp.url} alt={samp.title} className="w-full h-12 object-cover group-hover:scale-105 transition-all" />
                        <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] font-bold text-white leading-tight">
                          {samp.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Constraint for Veo (16:9 or 9:16) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Veo Video Aspect Ratio (Mandatory Specification)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      videoAspectRatio === '16:9'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>16:9 (Landscape)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ideal for smartboards, laptops & projectors (1280x720)
                      </div>
                    </div>
                    {videoAspectRatio === '16:9' && <Check className="w-4 h-4 text-purple-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      videoAspectRatio === '9:16'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>9:16 (Portrait)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ideal for mobile devices & school social reels (720x1280)
                      </div>
                    </div>
                    {videoAspectRatio === '9:16' && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                </div>
              </div>

              {/* Motion Description Prompt */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Motion & Cinematography Prompt
                  </label>
                  <span className="text-[11px] text-slate-400">Resolution: 720p HD</span>
                </div>

                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g. Smooth cinematic push-in with realistic natural motion, animated particles floating gently, soft sunlight shifting across the scene..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
                />
              </div>

              {/* Motion Presets */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Cinematic Motion Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_VIDEO_MOTION_PROMPTS.map((motion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVideoPrompt(motion)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-950/50 text-[11px] text-slate-700 dark:text-slate-300 transition-all text-left"
                    >
                      {motion.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Box */}
              {videoError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{videoError}</span>
                </div>
              )}

              {/* Generation Button */}
              <button
                type="button"
                disabled={isGeneratingVideo || !videoSourceImage}
                onClick={handleGenerateVeoVideo}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Rendering Video with Veo Engine...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 text-amber-300" />
                    <span>Generate Video with Veo (veo-3.1-fast-generate-preview)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Player & Live Status Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  Veo Video Player Output
                </h3>
                {generatedVideoUrl && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                    {videoAspectRatio} MP4
                  </span>
                )}
              </div>

              {/* In-Progress Live Status Card */}
              {isGeneratingVideo && (
                <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 dark:text-purple-100">
                        Veo Video Synthesis in Progress
                      </h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                        {videoGenerationStep}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Animation */}
                  <div className="w-full h-2 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(95, pollAttempt * 12 + 10)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Polling status every 5s</span>
                    <span>Operation active</span>
                  </div>
                </div>
              )}

              {/* Video Player Display */}
              {generatedVideoUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-black shadow-lg">
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full max-h-[420px] object-contain mx-auto"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Applied Motion Prompt
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {videoPrompt}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={generatedVideoUrl}
                      download="veo-educational-animation.mp4"
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Video (MP4)</span>
                    </a>
                  </div>
                </div>
              ) : !isGeneratingVideo ? (
                <div className="py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto mb-3 text-purple-500">
                    <Film className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    No Video Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Upload a photo on the left, pick your aspect ratio (16:9 or 9:16), and let Veo synthesize realistic educational animations.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA LIBRARY SHOWCASE */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                School Multimedia Library & Showcase
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                All AI-generated pedagogical graphics, diagrams, and Veo videos available for classroom presentation and curriculum integration.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start">
              Total Assets: {mediaHistory.length}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaHistory.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Media Preview Box */}
                <div className="relative bg-slate-950 h-52 flex items-center justify-center overflow-hidden group">
                  {item.type === 'VIDEO' ? (
                    <video
                      src={item.url}
                      controls
                      loop
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all"
                    />
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 ${
                      item.type === 'VIDEO' ? 'bg-purple-600' : 'bg-indigo-600'
                    }`}>
                      {item.type === 'VIDEO' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      {item.type}
                    </span>
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-md text-[10px] font-mono">
                      {item.aspectRatio}
                    </span>
                  </div>

                  {item.type === 'IMAGE' && (
                    <button
                      type="button"
                      onClick={() => setLightboxImage(item.url)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {item.prompt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Model: <code className="font-mono text-indigo-600 dark:text-indigo-400">{item.modelUsed.split('-')[0]}</code></span>
                    <div className="flex items-center gap-1">
                      <a
                        href={item.url}
                        download={`school-media-${item.id}.${item.type === 'VIDEO' ? 'mp4' : 'png'}`}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      {item.type === 'IMAGE' && (
                        <button
                          type="button"
                          onClick={() => handleTransferToVeo(item.url)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-all"
                          title="Send to Veo Video Animator"
                        >
                          <Film className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Fullscreen Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
