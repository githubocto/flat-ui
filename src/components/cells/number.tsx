import React from 'react';

interface NumberCellProps {
  value: Number;
  rawValue: string;
}

export function NumberCell(props: NumberCellProps) {
  return (
    <span
      className="text-right font-mono text-sm block w-full"
      title={props.rawValue}
    >
      {Number.isFinite(props.value) ? props.value.toLocaleString() : '—'}
    </span>
  );
}
