import React from 'react';
// @ts-ignore
import { timeFormat } from 'd3';

interface DateCellProps {
  value: Date;
  rawValue: string;
}

const formatDate = timeFormat('%B %-d, %Y');
export function DateCell(props: DateCellProps) {
  return (
    <span
      className="overflow-ellipsis block whitespace-nowrap overflow-hidden"
      title={props.rawValue}
    >
      {props.value ? formatDate(props.value) : '-'}
    </span>
  );
}
