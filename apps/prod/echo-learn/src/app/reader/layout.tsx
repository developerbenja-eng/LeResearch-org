import { ReaderProvider } from '@/context/ReaderContext';
import ReaderAudioPlayer from '@/components/reader/ReaderAudioPlayer';

export const metadata = {
  title: 'Echo Reader - Academic Paper Reader',
  description: 'Transform academic papers into an audio-first learning experience',
};

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReaderProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {children}
      </div>
      <ReaderAudioPlayer />
    </ReaderProvider>
  );
}
