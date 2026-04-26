import type { ReactNode } from 'react';
import { AudioProvider } from './_components/AudioContext';
import { MiniPlayer } from './_components/MiniPlayer';

export default function RethinkingLayout({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {/* pb-24 reserves space so the sticky MiniPlayer never occludes the last paragraph */}
      <div className="pb-24 sm:pb-20">{children}</div>
      <MiniPlayer />
    </AudioProvider>
  );
}
