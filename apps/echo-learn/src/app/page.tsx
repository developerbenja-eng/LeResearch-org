'use client';

import {
  Navigation,
  LearnHeroSection,
  PhilosophySection,
  SubAppsGrid,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <Navigation />
      <LearnHeroSection />
      <SubAppsGrid />
      <PhilosophySection />
      <Footer />
    </div>
  );
}
