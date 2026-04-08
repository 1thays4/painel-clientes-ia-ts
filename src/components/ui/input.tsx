import { InputHTMLAttributes, forwardRef } from "react";
import { TextField } from "@mui/material";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
> {
  fullWidth?: boolean;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      fullWidth = true,
      variant = "outlined",
      size = "medium",
      label,
      error,
      helperText,
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        label={label}
        error={error}
        helperText={helperText}
        inputProps={props}
      />
    );
  },
);

Input.displayName = "Input";
