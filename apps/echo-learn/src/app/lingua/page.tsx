'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LinguaProfileSetup } from '@/components/lingua/auth/LinguaProfileSetup';

type AuthState = 'loading' | 'not_authenticated' | 'needs_profile' | 'authenticated';

export default function LinguaPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [linguaProfile, setLinguaProfile] = useState<{
    id: string;
    name: string;
    nativeLanguage: string;
    targetLanguage: string;
  } | null>(null);

  // Check Lingua profile status when Echo-Home auth is confirmed
  useEffect(() => {
    const checkLinguaProfile = async () => {
      if (authLoading) return;

      // If not authenticated with Echo-Home, redirect to login
      if (!isAuthenticated) {
        // Store intended destination
        sessionStorage.setItem('redirect_after_login', '/lingua');
        router.push('/login');
        return;
      }

      // Check if user has a Lingua profile
      try {
        const response = await fetch('/api/lingua/profile', {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.hasProfile && data.profile) {
          // User has a profile, redirect to dashboard
          setLinguaProfile(data.profile);
          setAuthState('authenticated');
          router.push('/lingua/dashboard');
        } else {
          // User needs to set up a profile
          setAuthState('needs_profile');
        }
      } catch (error) {
        console.error('Failed to check Lingua profile:', error);
        setAuthState('needs_profile');
      }
    };

    checkLinguaProfile();
  }, [isAuthenticated, authLoading, router]);

  // Handle profile creation success
  const handleProfileCreated = (profile: {
    id: string;
    name: string;
    nativeLanguage: string;
    targetLanguage: string;
  }) => {
    setLinguaProfile(profile);
    // Use full page navigation to ensure context is refreshed
    window.location.href = '/lingua/dashboard';
  };

  // Show loading while checking auth
  if (authState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile setup for authenticated users without a Lingua profile
  if (authState === 'needs_profile' && user) {
    return (
      <LinguaProfileSetup
        userName={user.name || user.email?.split('@')[0] || 'Learner'}
        onProfileCreated={handleProfileCreated}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
