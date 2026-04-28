export const dynamic = 'force-dynamic';

import { LinguaProvider } from '@/context/LinguaContext';

export default function LinguaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LinguaProvider>{children}</LinguaProvider>;
}
