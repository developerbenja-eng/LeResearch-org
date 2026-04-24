'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Languages, Settings, Users, ChevronDown, Check } from 'lucide-react';
import { useLingua } from '@/context/LinguaContext';
import { LinguaLanguage } from '@/types/lingua';

interface ProfileSelectorProps {
  onSettingsClick?: () => void;
  onFamilyClick?: () => void;
}

const languageInfo: Record<LinguaLanguage, { name: string; flag: string; nativeName: string }> = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
};

export function ProfileSelector({ onSettingsClick, onFamilyClick }: ProfileSelectorProps) {
  const { user, familyConnections } = useLingua();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return null;
  }

  const nativeLang = languageInfo[user.nativeLang];
  const targetLang = languageInfo[user.targetLang];

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">
            {nativeLang.flag} → {targetLang.flag}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            {/* Current Profile */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>{nativeLang.flag} {nativeLang.name}</span>
                    <Languages className="w-3 h-3 mx-1" />
                    <span>{targetLang.flag} {targetLang.name}</span>
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-purple-600">{user.currentStreak}</p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-pink-600">{user.longestStreak}</p>
                  <p className="text-xs text-gray-500">Best Streak</p>
                </div>
              </div>
            </div>

            {/* Family Connections */}
            {familyConnections.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-400 px-2 mb-1">VIEW PROGRESS</p>
                {familyConnections.slice(0, 3).map((connection) => (
                  <button
                    key={connection.id}
                    onClick={() => {
                      setShowDropdown(false);
                      // Handle viewing family member's progress
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {connection.connected_user_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {connection.connection_type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onFamilyClick?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Family & Friends</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onSettingsClick?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Profile Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export the compact version for header use
export function ProfileBadge() {
  const { user } = useLingua();

  if (!user) return null;

  const targetLang = languageInfo[user.targetLang];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-purple-700">{user.name}</span>
      <span className="text-sm">{targetLang.flag}</span>
    </div>
  );
}
