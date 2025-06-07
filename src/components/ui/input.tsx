import { cn } from "../../lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";


export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
