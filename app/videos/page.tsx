'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context';
import { getUserVideos, VideoDoc } from '@/lib/firestore';
import VideoCard from '@/components/VideoCard';
import Button from '@/components/Button';
import { Film, RefreshCw, Library } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async () => {
    if (!user) return;
    const data = await getUserVideos(user.uid);
    setVideos(data);
  };

  useEffect(() => {
    if (user) {
      fetchVideos().finally(() => setLoading(false));
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  const hasPending = videos.some((v) => v.status === 'pending' || v.status === 'processing');

  // Auto-refresh if any pending/processing
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, [hasPending, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-500" />
            My Videos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Auto-refresh notice */}
      {hasPending && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-sm text-blue-700 font-medium">
            Some videos are processing — auto-refreshing every 5 seconds
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">No videos yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse templates and generate your first AI face swap video
          </p>
          <Button onClick={() => router.push('/templates')}>
            <Library className="w-4 h-4" />
            Browse Templates
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
