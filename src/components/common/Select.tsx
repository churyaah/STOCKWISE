import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block font-mono text-xs uppercase tracking-wider text-mono-700 font-medium">
            {label}
            {props.required && <span className="text-mono-950 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none bg-mono-0 border border-mono-300 text-mono-950 font-sans text-sm px-3.5 py-2.5 pr-9 transition-colors duration-150',
              'focus:outline-none focus:border-mono-950 focus:ring-1 focus:ring-mono-950',
              'disabled:bg-mono-100 disabled:text-mono-400 disabled:cursor-not-allowed',
              error && 'border-mono-950 bg-mono-50',
              className
            )}
            {...props}
          >
            {options
              ? options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="absolute right-3 pointer-events-none text-mono-500">
            <ChevronDown size={16} />
          </span>
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

Select.displayName = 'Select';
