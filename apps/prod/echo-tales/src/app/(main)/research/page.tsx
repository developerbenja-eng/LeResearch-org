import { Metadata } from 'next';
import { ResearchLayout } from './components/ResearchLayout';

export const metadata: Metadata = {
  title: 'Research - Echo Tales',
  description:
    'AI-powered parenting research assistant for families. Browse evidence-based topics, listen to podcasts, take notes, and get personalized insights.',
  keywords: ['parenting research', 'child development', 'parenting tips', 'evidence-based parenting', 'family research'],
};

export default function ResearchPage() {
  return <ResearchLayout />;
}
