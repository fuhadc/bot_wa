import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  leftIcon, 
  rightIcon, 
  className, 
  disabled, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30",
    secondary: "bg-white/5 border border-white/10 text-text-main hover:bg-white/10",
    danger: "bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white",
    ghost: "bg-transparent text-text-dim hover:text-white hover:bg-white/5"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "h-16 px-8 rounded-2xl font-black uppercase tracking-[.2em] text-[10px] flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="w-4 h-4">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="w-4 h-4">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
