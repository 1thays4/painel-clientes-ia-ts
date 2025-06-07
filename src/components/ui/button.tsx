import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
