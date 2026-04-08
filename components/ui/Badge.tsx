import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'ghost';
  children: React.ReactNode;
}

export function Badge({ variant = 'primary', children, className, ...props }: BadgeProps) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    ghost: "bg-white/5 text-text-dim border-white/5"
  };

  return (
    <div 
      className={cn(
        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[.2em] border leading-none inline-flex items-center justify-center",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
