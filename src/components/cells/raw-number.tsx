import React from 'react';

interface RawNumberCellProps {
  value: Number;
  rawValue: string;
}

export function RawNumberCell(props: RawNumberCellProps) {
  return (
    <span
      className="text-right font-mono text-sm block w-full"
      title={props.rawValue}
    >
      {Number.isFinite(props.value) ? props.value : '—'}
    </span>
  );
}
