'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate password upfront before showing profile selector
      const response = await fetch('/api/lingua/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid password');
        setIsLoading(false);
        return;
      }

      // Password valid - store temporarily for profile selection
      sessionStorage.setItem('lingua_temp_password', password);
      onSuccess();
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4" data-testid="password-gate">
      <Card variant="elevated" className="w-full max-w-md mx-auto">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl" data-testid="lingua-title">Echo-Lin</CardTitle>
          <CardDescription className="mt-2 text-sm sm:text-base">
            Enter the family password to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6" data-testid="password-form">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            data-testid="password-input"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          {error && (
            <p className="text-red-500 text-sm text-center" data-testid="password-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={!password.trim()}
            data-testid="password-submit"
          >
            Continue
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 px-4 pb-4 sm:pb-6">
          A language learning experiment for the family
        </p>
      </Card>
    </div>
  );
}
