import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
  as?: 'input' | 'select';
  children?: React.ReactNode;
}

export function Input({ label, icon, as = 'input', children, className, id, ...props }: InputProps) {
  const Component = as as any;

  return (
    <div className="space-y-3 w-full group">
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-text-dim uppercase tracking-[.25em] ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
          <div className="w-1 h-1 rounded-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors z-10">
            {icon}
          </div>
        )}
        <Component
          id={id}
          className={cn(
            "w-full bg-black/40 border border-white/5 rounded-2xl h-16 transition-all focus:outline-none focus:border-primary/50 text-base font-bold text-text-main shadow-inner px-5",
            icon && "pl-14",
            as === 'select' && "appearance-none",
            className
          )}
          {...props}
        >
          {children}
        </Component>
        {as === 'select' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-20" />
      </div>
    </div>
  );
}
