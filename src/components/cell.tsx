import React from 'react';
import { areEqual } from 'react-window';
import cc from 'classcat';
import anchorme from 'anchorme';
import { cellTypeMap } from '../store';
import { DashIcon, DiffModifiedIcon, PlusIcon } from '@primer/octicons-react';

interface CellProps {
  type: string;
  value: any;
  rawValue: any;
  formattedValue?: any;
  categoryColor?: string;
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
    rawValue,
    formattedValue,
    categoryColor,
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
      'text-gray-300': typeof value === 'undefined' || Number.isNaN(value),
      'border-green-200': status === 'new',
      'border-pink-200': status === 'old',
      'border-yellow-200': status === 'modified',
      'border-gray-200': !status,
    },
  ]);

  const displayValue = formattedValue || value;
  const isLongValue = (displayValue || '').length > 23;
  const stringWithLinks = displayValue
    ? React.useMemo(
        () =>
          anchorme({
            input: displayValue + '',
            options: {
              attributes: {
                target: '_blank',
                rel: 'noopener',
              },
            },
          }),
        [value]
      )
    : '';

  const StatusIcon =
    isFirstColumn &&
    // @ts-ignore
    {
      new: PlusIcon,
      old: DashIcon,
      modified: DiffModifiedIcon,
      'modified-row': DiffModifiedIcon,
    }[status || ''];
  const statusColor =
    isFirstColumn &&
    // @ts-ignore
    {
      new: 'text-green-400',
      old: 'text-pink-400',
      modified: 'text-yellow-500',
      'modified-row': 'text-yellow-500',
    }[status || ''];

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
        <div className={`w-6 flex-none ${statusColor}`}>
          {StatusIcon && <StatusIcon />}
        </div>
      )}

      <CellComponent
        value={value}
        formattedValue={stringWithLinks}
        rawValue={rawValue}
        categoryColor={categoryColor}
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
          title={rawValue}
        >
          <div
            className="line-clamp-9"
            dangerouslySetInnerHTML={{ __html: stringWithLinks }}
          />
        </div>
      )}
    </div>
  );
}, areEqual);
