'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary: cn(
      'bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600 text-white',
      'shadow-[0_2px_8px_rgba(147,51,234,0.25),0_4px_16px_rgba(147,51,234,0.15)]',
      'hover:shadow-[0_4px_12px_rgba(147,51,234,0.35),0_8px_24px_rgba(147,51,234,0.2)]',
      'hover:from-purple-500 hover:via-purple-600 hover:to-violet-500',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-visible:ring-purple-500'
    ),
    secondary: cn(
      'bg-gradient-to-r from-pink-500 via-pink-500 to-rose-500 text-white',
      'shadow-[0_2px_8px_rgba(236,72,153,0.25),0_4px_16px_rgba(236,72,153,0.15)]',
      'hover:shadow-[0_4px_12px_rgba(236,72,153,0.35),0_8px_24px_rgba(236,72,153,0.2)]',
      'hover:from-pink-400 hover:via-pink-500 hover:to-rose-400',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-visible:ring-pink-400'
    ),
    outline: cn(
      'border-2 border-purple-500 text-purple-600 bg-transparent',
      'hover:bg-purple-50 hover:border-purple-600',
      'hover:-translate-y-0.5 active:translate-y-0',
      'hover:shadow-[0_0_20px_rgba(147,51,234,0.15)]',
      'focus-visible:ring-purple-500'
    ),
    ghost: cn(
      'text-gray-600 dark:text-gray-400 bg-transparent',
      'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
      'focus-visible:ring-gray-400'
    ),
    danger: cn(
      'bg-gradient-to-r from-red-500 via-red-600 to-red-600 text-white',
      'shadow-[0_2px_8px_rgba(239,68,68,0.25),0_4px_16px_rgba(239,68,68,0.15)]',
      'hover:shadow-[0_4px_12px_rgba(239,68,68,0.35),0_8px_24px_rgba(239,68,68,0.2)]',
      'hover:from-red-400 hover:via-red-500 hover:to-red-500',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-visible:ring-red-500'
    ),
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
