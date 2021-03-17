import React from 'react';
import { areEqual } from 'react-window';
import cc from 'classcat';
import { cellTypeMap } from '../store';

interface CellProps {
  type: string;
  value: any;
  style?: {};
  background?: string;
  onMouseEnter?: Function;
}
export const Cell = React.memo(function(props: CellProps) {
  const {
    type,
    value,
    background,
    style = {},
    onMouseEnter = () => {},
  } = props;

  // @ts-ignore
  const cellInfo = cellTypeMap[type];
  if (!cellInfo) return null;

  const { cell: CellComponent } = cellInfo;

  const rowClass = cc([
    'flex flex-none items-center px-4 border-b border-r border-gray-200',
    { 'text-gray-300': typeof value === 'undefined' },
  ]);

  return (
    <div
      className={rowClass}
      onMouseEnter={() => onMouseEnter()}
      style={{
        ...style,
        background: background || '#fff',
      }}
    >
      <CellComponent value={value} />
    </div>
  );
}, areEqual);
