import type { ReactNode } from 'react';

export default function AILayout({ children }: { children: ReactNode }) {
  return <div className="pb-24">{children}</div>;
}
