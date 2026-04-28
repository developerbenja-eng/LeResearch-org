import Link from 'next/link';
import Image from 'next/image';

interface RoomStat {
  value: string | number;
  label: string;
}

interface RoomCardProps {
  href: string;
  iconUrl: string;
  title: string;
  description: string;
  stats: RoomStat[];
  colorClass?: string;
}

export function RoomCard({
  href,
  iconUrl,
  title,
  description,
  stats,
  colorClass = 'from-purple-500 to-indigo-600',
}: RoomCardProps) {
  return (
    <Link href={href} className="h-full block">
      <div className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_6px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04)] border border-gray-100/50 dark:border-gray-800/50 hover:shadow-[0_4px_6px_rgba(0,0,0,0.05),0_12px_20px_rgba(0,0,0,0.08),0_24px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col items-center text-center">
        {/* Colored top accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Gradient overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`}
        />

        {/* Room Icon with colored background */}
        <div className="relative w-20 h-20 mb-5 mx-auto">
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-2xl opacity-0 group-hover:opacity-15 blur-xl scale-150 transition-opacity duration-300`} />
          <Image
            src={iconUrl}
            alt={title}
            fill
            className="object-contain relative z-10 p-2 group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200 text-center">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 text-center leading-relaxed">{description}</p>

        {/* Stats with per-feature gradient */}
        <div className="flex justify-center gap-8 pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
          {stats.map((stat, index) => (
            <div key={index} className="text-center min-w-[60px]">
              <div className={`text-2xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// Skeleton for loading state
export function RoomCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_6px_rgba(0,0,0,0.04)] border border-gray-100/50 dark:border-gray-800/50 h-full flex flex-col items-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-shimmer" />
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-5 animate-shimmer" />
      <div className="h-6 w-32 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-2 animate-shimmer" />
      <div className="h-4 w-48 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded mb-4 animate-shimmer" />
      <div className="flex justify-center gap-8 pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
        <div className="text-center min-w-[60px]">
          <div className="h-8 w-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mx-auto mb-1 animate-shimmer" />
          <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-shimmer" />
        </div>
        <div className="text-center min-w-[60px]">
          <div className="h-8 w-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mx-auto mb-1 animate-shimmer" />
          <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
