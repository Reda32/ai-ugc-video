'use client';

import { VideoDoc } from '@/lib/firestore';
import StatusBadge from './StatusBadge';
import { Download, Film } from 'lucide-react';

export default function VideoCard({ video }: { video: VideoDoc }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-950 overflow-hidden">
        {video.status === 'completed' && video.output_url ? (
          <video
            src={video.output_url}
            controls
            className="w-full h-full object-cover"
            playsInline
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Film className="w-10 h-10 text-gray-600" />
            {video.status === 'processing' || video.status === 'pending' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full animate-pulse w-2/3" />
                </div>
                <p className="text-xs text-gray-500">Generating your video…</p>
              </div>
            ) : (
              <p className="text-xs text-red-400">Generation failed</p>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-mono truncate">ID: {video.id.slice(0, 12)}…</p>
          </div>
          <StatusBadge status={video.status} />
        </div>

        {video.status === 'completed' && video.output_url && (
          <a
            href={video.output_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl px-4 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        )}
      </div>
    </div>
  );
}
