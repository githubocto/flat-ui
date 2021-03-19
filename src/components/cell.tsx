import React from 'react';
import { areEqual } from 'react-window';
import cc from 'classcat';
import { cellTypeMap } from '../store';
import { DashIcon, PlusIcon } from '@primer/octicons-react';

interface CellProps {
  type: string;
  value: any;
  formattedValue?: any;
  possibleValues?: string[];
  style?: {};
  status?: string;
  isNearRightEdge?: boolean;
  isNearBottomEdge?: boolean;
  isFirstColumn?: boolean;
  hasStatusIndicator?: boolean;
  background?: string;
  onMouseEnter?: Function;
}
export const Cell = React.memo(function(props: CellProps) {
  const {
    type,
    value,
    formattedValue,
    possibleValues,
    status,
    isFirstColumn,
    isNearRightEdge,
    isNearBottomEdge,
    background,
    style = {},
    onMouseEnter = () => {},
  } = props;

  // @ts-ignore
  const cellInfo = cellTypeMap[type];
  if (!cellInfo) return null;

  const { cell: CellComponent } = cellInfo;

  const cellClass = cc([
    'cell group flex flex-none items-center px-4 border-b border-r',
    {
      'text-gray-300': typeof value === 'undefined',
      'border-green-200': status === 'new',
      'border-pink-200': status === 'old',
      'border-yellow-200': status === 'modified',
      'border-gray-200': !status,
    },
  ]);

  const isLongValue = (formattedValue || value || '').length > 20;

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
          className={`w-6 flex-none ${
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

      <CellComponent
        value={value}
        formattedValue={formattedValue}
        possibleValues={possibleValues}
      />

      {isLongValue && (
        <div
          className={`cell__long-value absolute ${
            isNearBottomEdge ? 'bottom-0' : 'top-0'
          } ${
            isNearRightEdge ? 'right-0' : 'left-0'
          } p-4 py-2 bg-white opacity-0 group-hover:opacity-100 z-30 border border-gray-200 shadow-md pointer-events-none`}
          style={{
            width: 'max-content',
            maxWidth: '27em',
          }}
        >
          <div className="line-clamp-9">{formattedValue || value}</div>
        </div>
      )}
    </div>
  );
}, areEqual);
