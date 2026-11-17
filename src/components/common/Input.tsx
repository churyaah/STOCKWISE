import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block font-mono text-xs uppercase tracking-wider text-mono-700 font-medium">
            {label}
            {props.required && <span className="text-mono-950 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-mono-500 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-mono-0 border border-mono-300 text-mono-950 font-sans text-sm px-3.5 py-2.5 transition-colors duration-150',
              'placeholder:text-mono-400 focus:outline-none focus:border-mono-950 focus:ring-1 focus:ring-mono-950',
              'disabled:bg-mono-100 disabled:text-mono-400 disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightElement && 'pr-12',
              error && 'border-mono-950 bg-mono-50 font-semibold',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && (
          <p className="font-mono text-xs text-mono-950 font-bold uppercase tracking-wide">
            [!] {error}
          </p>
        )}
        {helperText && !error && (
          <p className="font-sans text-xs text-mono-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
