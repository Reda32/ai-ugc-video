'use client';

import { Template } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import Button from './Button';
import { Play, Coins } from 'lucide-react';

export default function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300">
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <video
          src={template.preview_url}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          muted
          loop
          playsInline
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => {
            const v = e.currentTarget as HTMLVideoElement;
            v.pause();
            v.currentTime = 0;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <Coins className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-semibold text-white">{template.cost}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{template.title}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{template.description}</p>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => router.push(`/generate/${template.id}`)}
        >
          Use Template
        </Button>
      </div>
    </div>
  );
}
