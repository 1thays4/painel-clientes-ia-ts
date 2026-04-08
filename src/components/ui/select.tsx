import React from "react";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  children: React.ReactNode;
  size?: "small" | "medium";
  variant?: "outlined" | "filled" | "standard";
}

export function Select({
  value,
  onValueChange,
  label,
  fullWidth = true,
  error,
  helperText,
  children,
  size = "medium",
  variant = "outlined",
}: SelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onValueChange(event.target.value);
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      size={size}
      variant={variant}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect value={value} onChange={handleChange} label={label}>
        {children}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <MenuItem value={value}>{children}</MenuItem>;
}

// These components are no longer needed with Material UI but kept for backward compatibility
export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <>{placeholder}</>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
