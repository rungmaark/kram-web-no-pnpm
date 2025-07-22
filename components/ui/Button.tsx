// components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";

type ButtonProps = {
  variant?: "default" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  variant = "default",
  size = "md",
  asChild,
  className,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";

  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
     ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-900 dark:text-white",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  return (
    <Comp
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};
