'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Coins, Film, Library, Zap, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const credits = userData?.credits ?? 0;
  const creditsPercent = Math.min((credits / 20) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Ready to create your next AI face swap video?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Credits card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-gray-400">Credits</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{credits}</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all"
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Each video costs 5 credits</p>
        </div>

        {/* Quick action: Templates */}
        <div
          className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 cursor-pointer group hover:shadow-lg transition-all"
          onClick={() => router.push('/templates')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Library className="w-5 h-5 text-white" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-white">Browse</p>
          <p className="text-brand-100 text-sm mt-1">Video Templates</p>
        </div>

        {/* Quick action: My Videos */}
        <div
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 cursor-pointer group hover:shadow-lg transition-all"
          onClick={() => router.push('/videos')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-white">My Videos</p>
          <p className="text-purple-100 text-sm mt-1">View your creations</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-500" />
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Pick a Template', desc: 'Browse our library of high-quality video templates.' },
            { step: '02', title: 'Upload Your Face', desc: 'Upload a clear photo of the face you want to swap in.' },
            { step: '03', title: 'Download Result', desc: 'Our AI generates your video in seconds. Download and share!' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand-600">{step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={() => router.push('/templates')} size="lg" className="gap-2">
            <Library className="w-4 h-4" />
            Browse Templates
          </Button>
        </div>
      </div>

      {/* Low credits warning */}
      {credits < 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Coins className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">You're running low on credits</p>
            <p className="text-amber-700 text-xs mt-0.5">You need at least 5 credits to generate a video. Contact support to top up.</p>
          </div>
        </div>
      )}
    </div>
  );
}
