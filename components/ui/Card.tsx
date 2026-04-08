import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, header, footer, hover = false, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "glass rounded-[32px] overflow-hidden flex flex-col transition-all duration-500",
        hover && "hover:border-primary/30 hover:shadow-primary/5",
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-8 mt-10">
          {header}
        </div>
      )}
      <div className={cn("px-8 flex-grow", header ? "mt-8" : "mt-10", "mb-10")}>
        {children}
      </div>
      {footer && (
        <div className="px-8 pb-10 bg-white/5 border-t border-white/5">
          {footer}
        </div>
      )}
    </div>
  );
}
