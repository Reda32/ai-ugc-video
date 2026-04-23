import { VideoStatus } from '@/lib/firestore';

const config: Record<VideoStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  processing: { label: 'Processing', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 border-green-200' },
  failed: { label: 'Failed', classes: 'bg-red-100 text-red-700 border-red-200' },
};

export default function StatusBadge({ status }: { status: VideoStatus }) {
  const { label, classes } = config[status] ?? config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${classes}`}>
      <span className="relative flex h-2 w-2">
        {status === 'processing' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'processing' ? 'bg-blue-500' : status === 'completed' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
      </span>
      {label}
    </span>
  );
}
