import React from "react";

interface NumberCellProps {
  value: Number;
}

export function NumberCell(props: NumberCellProps) {
  return (
    <span className="text-right font-mono text-sm block w-full">
      {Number.isFinite(props.value) ? props.value.toLocaleString() : "—"}
    </span>
  );
}
