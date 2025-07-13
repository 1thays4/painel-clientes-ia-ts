import { ReactNode } from "react";
import { Card as MuiCard, CardContent as MuiCardContent } from "@mui/material";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MuiCard sx={{ p: 2 }}>{children}</MuiCard>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MuiCardContent>{children}</MuiCardContent>;
}