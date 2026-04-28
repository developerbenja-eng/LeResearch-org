import { STATUS_LABELS, type BirdStatus } from '@/lib/types';

export function StatusChip({
  status,
  size = 'sm',
}: {
  status: BirdStatus;
  size?: 'sm' | 'md';
}) {
  const { short, long, color } = STATUS_LABELS[status];
  const sizing =
    size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-1.5 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide bg-slate-900/60 border border-slate-700 ${sizing} ${color}`}
      title={long}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {short}
    </span>
  );
}
