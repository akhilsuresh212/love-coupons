"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm cursor-pointer";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-95",
      outline:
        "border-2 border-primary text-primary hover:bg-primary/10 hover:scale-105 active:scale-95",
      ghost:
        "hover:bg-accent/10 text-accent hover:text-accent/90 hover:scale-105 active:scale-95 shadow-none",
    };

    const sizes = {
      sm: "h-8 px-4 text-xs",
      md: "h-10 px-6 py-2",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { Button };
