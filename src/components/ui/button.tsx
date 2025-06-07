import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-md transition-all",
          // Base styles
          "px-4 py-2",
          // Variant styles
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "outline" && "border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100",
          variant === "ghost" && "bg-transparent text-gray-800 hover:bg-gray-100",
          // Size styles
          size === "sm" && "px-2 py-1 text-sm",
          size === "lg" && "px-6 py-3 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
