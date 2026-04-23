'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { addTemplate, getTemplates, Template } from '@/lib/firestore';
import { uploadPreviewVideo } from '@/lib/storage';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Plus,
  Upload,
  Film,
  Library,
  Coins,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function AdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(5);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
    setLoadingTemplates(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setCost(5);
    setVideoFile(null);
    setVideoPreview(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please upload a preview video');
      return;
    }

    setSubmitting(true);
    try {
      // Use a temp ID to name the storage file, then update
      const tempId = `temp_${Date.now()}`;
      const previewUrl = await uploadPreviewVideo(tempId, videoFile);

      await addTemplate({ title, description, preview_url: previewUrl, cost });

      toast.success('Template added successfully!');
      setSuccess(true);
      await fetchTemplates();
      setTimeout(reset, 2000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Manage templates and platform content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <Library className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
          <p className="text-xs text-gray-500">Templates</p>
        </div>
      </div>

      {/* Add Template Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-500" />
            Add New Template
          </h2>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-gray-900">Template Added!</p>
            <p className="text-sm text-gray-500">Resetting form…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Movie Star Scene"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Credit Cost *
                </label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                    required
                    min={1}
                    max={100}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe the video template…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Preview Video *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  videoPreview
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-gray-200 bg-gray-50 hover:border-brand-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleVideoFile(f);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {videoPreview ? (
                  <div className="relative">
                    <video
                      src={videoPreview}
                      className="w-full h-40 object-cover rounded-xl"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-semibold">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Click or drag to upload video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleVideoFile(f);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!title || !description || !videoFile}
              >
                <Plus className="w-4 h-4" />
                Add Template
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Templates list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Film className="w-4 h-4 text-brand-500" />
            Existing Templates
          </h2>
        </div>

        {loadingTemplates ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center">
            <Library className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No templates yet. Add the first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {templates.map((t) => (
              <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <video src={t.preview_url} className="w-full h-full object-cover" muted />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 truncate">{t.description}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm font-bold text-amber-700">{t.cost}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
