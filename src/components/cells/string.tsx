import React from 'react';

interface StringCellProps {
  value: string;
}

export function StringCell(props: StringCellProps) {
  return (
    <span
      className="overflow-ellipsis block whitespace-nowrap overflow-hidden"
      title={props.value}
    >
      {props.value}
    </span>
  );
}
