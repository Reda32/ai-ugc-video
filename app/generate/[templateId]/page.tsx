'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';
import { getTemplate, Template, createVideoDoc, updateVideoDoc, updateCredits } from '@/lib/firestore';
import { uploadFaceImage } from '@/lib/storage';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import {
  Upload,
  ImageIcon,
  Coins,
  AlertCircle,
  CheckCircle2,
  Zap,
  ArrowLeft,
  Film,
} from 'lucide-react';

const SAMPLE_OUTPUT_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const CREDIT_COST = 5;
const PROCESSING_DELAY_MS = 15000;

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const templateId = params.templateId as string;

  useEffect(() => {
    getTemplate(templateId).then((t) => {
      setTemplate(t);
      setTemplateLoading(false);
    });
  }, [templateId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFaceFile(file);
    setFacePreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please drop an image file');
      return;
    }
    setFaceFile(file);
    setFacePreview(URL.createObjectURL(file));
  }, []);

  const handleGenerate = async () => {
    if (!user || !userData || !template || !faceFile) return;

    const credits = userData.credits;
    if (credits < CREDIT_COST) {
      toast.error(`You need ${CREDIT_COST} credits. You have ${credits}.`);
      return;
    }
    if (!rightsConfirmed) {
      toast.error('Please confirm you have rights to this image');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Upload face image
      toast.loading('Uploading face image…', { id: 'gen' });
      const faceUrl = await uploadFaceImage(user.uid, faceFile);

      // Deduct credits
      const newCredits = credits - CREDIT_COST;
      await updateCredits(user.uid, newCredits);
      await refreshUser();

      // Create video doc
      const videoId = await createVideoDoc({
        user_id: user.uid,
        template_id: templateId,
        face_url: faceUrl,
      });

      toast.loading('Generating your video…', { id: 'gen' });

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 100 / (PROCESSING_DELAY_MS / 500), 95));
      }, 500);

      // Simulate 15-second processing
      await new Promise((res) => setTimeout(res, PROCESSING_DELAY_MS));
      clearInterval(interval);
      setProgress(100);

      // Update video doc with completed status
      await updateVideoDoc(videoId, {
        status: 'completed',
        output_url: SAMPLE_OUTPUT_URL,
      });

      toast.success('Video generated!', { id: 'gen' });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error('Generation failed. Please try again.', { id: 'gen' });
    } finally {
      setGenerating(false);
    }
  };

  const credits = userData?.credits ?? 0;
  const hasEnoughCredits = credits >= CREDIT_COST;

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-20">
        <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Template not found</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => router.push('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Video Ready!</h2>
        <p className="text-gray-500 text-sm">Your face swap video has been generated successfully.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => router.push('/templates')}>
            Create Another
          </Button>
          <Button onClick={() => router.push('/videos')}>
            <Film className="w-4 h-4" />
            View My Videos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/templates')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Templates
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Generate Video</h1>
        <p className="text-gray-500 text-sm mt-1">
          Template: <span className="font-semibold text-gray-700">{template.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Preview */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="aspect-video bg-gray-900">
            <video
              src={template.preview_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{template.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{CREDIT_COST} credits</span>
            </div>
          </div>
        </div>

        {/* Upload & Generate */}
        <div className="space-y-4">
          {/* Credits */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              hasEnoughCredits
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100'
            }`}
          >
            {hasEnoughCredits ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${hasEnoughCredits ? 'text-green-800' : 'text-red-800'}`}>
                {hasEnoughCredits
                  ? `You have ${credits} credits — enough to generate`
                  : `Not enough credits (${credits} / ${CREDIT_COST} needed)`}
              </p>
              <p className={`text-xs mt-0.5 ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                This will cost {CREDIT_COST} credits
              </p>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              Upload Your Face
            </h3>

            <div
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                facePreview
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {facePreview ? (
                <div className="relative">
                  <img
                    src={facePreview}
                    alt="Face preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-semibold">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Click or drag to upload</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — clear face photo recommended</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Rights checkbox */}
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I confirm that I have the rights to use this image and consent to it being processed for video generation.
              </span>
            </label>
          </div>

          {/* Generate button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={!faceFile || !rightsConfirmed || !hasEnoughCredits || generating}
            loading={generating}
          >
            <Zap className="w-4 h-4" />
            {generating ? 'Generating…' : 'Generate Video'}
          </Button>

          {/* Progress bar */}
          {generating && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                AI is swapping your face… {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
