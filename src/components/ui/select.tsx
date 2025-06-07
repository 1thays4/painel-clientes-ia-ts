import { useState } from "react";

export function Select({ value, onValueChange, children }: any) {
  return <div>{children}</div>;
}

export function SelectTrigger({ children }: any) {
  return <div className="mb-2 font-semibold">{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <div>{placeholder}</div>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const [selected, setSelected] = useState(false);
  return (
    <div
      onClick={() => setSelected(!selected)}
      className={`p-2 border rounded-md cursor-pointer ${selected ? "bg-blue-200" : "bg-white"}`}
    >
      {children}
    </div>
  );
}
