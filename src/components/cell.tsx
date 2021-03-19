import React from 'react';
import { areEqual } from 'react-window';
import cc from 'classcat';
import { cellTypeMap } from '../store';
import { DashIcon, PlusIcon } from '@primer/octicons-react';

interface CellProps {
  type: string;
  value: any;
  style?: {};
  status?: string;
  hasStatusIndicator?: boolean;
  background?: string;
  onMouseEnter?: Function;
}
export const Cell = React.memo(function(props: CellProps) {
  const {
    type,
    value,
    status,
    isFirstColumn,
    background,
    style = {},
    onMouseEnter = () => {},
  } = props;

  // @ts-ignore
  const cellInfo = cellTypeMap[type];
  if (!cellInfo) return null;

  const { cell: CellComponent } = cellInfo;

  const cellClass = cc([
    'flex flex-none items-center px-4 border-b border-r',
    {
      'text-gray-300': typeof value === 'undefined',
      'border-green-200': status === 'new',
      'border-pink-200': status === 'old',
      'border-indigo-200': status === 'modified',
      'border-gray-200': !status,
    },
  ]);

  return (
    <div
      className={cellClass}
      onMouseEnter={() => onMouseEnter()}
      style={{
        ...style,
        background: background || '#fff',
      }}
    >
      {isFirstColumn && (
        <div
          className={`w-6 ${
            status === 'new' ? 'text-green-400' : 'text-pink-400'
          }`}
        >
          {status === 'new' ? (
            <PlusIcon />
          ) : status === 'old' ? (
            <DashIcon />
          ) : null}
        </div>
      )}

      <CellComponent value={value} />
    </div>
  );
}, areEqual);
