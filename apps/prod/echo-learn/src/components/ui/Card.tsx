'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    default: cn(
      'bg-white dark:bg-gray-900 dark:border dark:border-gray-800',
      'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04)] dark:shadow-none'
    ),
    elevated: cn(
      'bg-white dark:bg-gray-900 dark:border dark:border-gray-800',
      'shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_15px_rgba(0,0,0,0.08),0_20px_25px_rgba(0,0,0,0.1)] dark:shadow-none'
    ),
    bordered: cn(
      'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
      'shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none'
    ),
    interactive: cn(
      'bg-white dark:bg-gray-900 cursor-pointer dark:border dark:border-gray-800',
      'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04)] dark:shadow-none',
      'transition-all duration-200',
      'hover:-translate-y-1',
      'hover:shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_15px_rgba(0,0,0,0.08),0_20px_25px_rgba(0,0,0,0.1)]'
    ),
    glass: cn(
      'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50',
      'shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_15px_rgba(0,0,0,0.06)] dark:shadow-none'
    ),
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={cn(
        'rounded-2xl',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}
