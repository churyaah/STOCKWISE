import React from 'react';
import { cn } from '../../utils/cn';

interface EchoTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'div';
}

export const EchoText: React.FC<EchoTextProps> = ({
  text,
  className,
  as: Component = 'div',
}) => {
  return (
    <div className={cn('relative inline-block select-none font-display font-bold leading-none tracking-tighter', className)}>
      {/* Background Echo Layers (Layer 5 to 2) */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none text-[#d9d9d9] transform -translate-x-[0.16em] -translate-y-[0.16em] select-none"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none text-[#d1d1d1] transform -translate-x-[0.12em] -translate-y-[0.12em] select-none"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none text-[#c9c9c9] transform -translate-x-[0.08em] -translate-y-[0.08em] select-none"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none text-[#bfbfbf] transform -translate-x-[0.04em] -translate-y-[0.04em] select-none"
      >
        {text}
      </span>

      {/* Foreground Top Layer */}
      <Component className="relative z-10 text-mono-900">{text}</Component>
    </div>
  );
};
