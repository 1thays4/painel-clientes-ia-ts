import { ButtonHTMLAttributes, forwardRef } from "react";
import { Button as MuiButton } from "@mui/material";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "contained" | "outlined" | "text";
  size?: "default" | "sm" | "lg" | "small" | "medium" | "large";
  fullWidth?: boolean;
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "contained", size = "medium", fullWidth = false, color = "primary", ...props }, ref) => {
    // Mapear variantes personalizadas para variantes do Material UI
    let muiVariant: "contained" | "outlined" | "text" = "contained";
    if (variant === "outline" || variant === "outlined") muiVariant = "outlined";
    if (variant === "ghost" || variant === "link" || variant === "text") muiVariant = "text";
    
    // Mapear tamanhos personalizados para tamanhos do Material UI
    let muiSize: "small" | "medium" | "large" = "medium";
    if (size === "sm" || size === "small") muiSize = "small";
    if (size === "lg" || size === "large") muiSize = "large";
    
    return (
      <MuiButton
        variant={muiVariant}
        size={muiSize}
        fullWidth={fullWidth}
        color={color}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";