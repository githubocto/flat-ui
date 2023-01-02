import React, { useEffect } from 'react';
import { areEqual } from 'react-window';
import tw, { TwStyle } from 'twin.macro';
import Linkify from 'linkify-it';
import { cellTypeMap } from '../store';
import { DashIcon, DiffModifiedIcon, PlusIcon } from '@primer/octicons-react';
import DOMPurify from 'dompurify';
import { EditableCell } from './editable-cell';

const linkify = Linkify().add('ftp:', null).add('mailto:', null);

interface CellProps {
  type: string;
  value: any;
  rawValue: any;
  formattedValue?: any;
  categoryColor?: string | TwStyle;
  style?: {};
  status?: string;
  isNearRightEdge?: boolean;
  isNearBottomEdge?: boolean;
  isFirstColumn: boolean;
  isExtraBlankRow: boolean;
  hasStatusIndicator?: boolean;
  background?: string;
  isEditable: boolean;
  onCellChange?: (value: any) => void;
  onRowDelete?: () => void;
  isFocused: boolean;
  onFocusChange: (value: [number, number] | null) => void;
  onMouseEnter?: Function;
}
export const Cell = React.memo(function (props: CellProps) {
  const {
    type,
    value,
    rawValue,
    formattedValue,
    categoryColor,
    status,
    isFirstColumn,
    isExtraBlankRow,
    isNearRightEdge,
    isNearBottomEdge,
    isEditable,
    onCellChange,
    onRowDelete,
    isFocused,
    onFocusChange,
    background,
    style = {},
    onMouseEnter = () => {},
  } = props;

  // @ts-ignore
  const cellInfo = cellTypeMap[type];

  const { cell: CellComponent } = cellInfo || {};

  const displayValue = (formattedValue || value || '').toString();
  const isLongValue = (displayValue || '').length > 23;
  const stringWithLinks = React.useMemo(() => {
    if (!displayValue) return '';
    const dompurifyConfig = {
        FORBID_TAGS: ['style', 'form'],
    }
    const sanitized = DOMPurify.sanitize(displayValue, dompurifyConfig);
    // Does the sanitized string contain any links?
    if (!linkify.test(sanitized)) return sanitized;

    // If so, we need to linkify it.
    const matches = linkify.match(sanitized);

    // If there are no matches, we can just return the sanitized string.
    if (!matches || matches.length === 0) return sanitized;

    // Otherwise, let's naively use the first match.
    return `<a href="${matches[0].url}" target="_blank" rel="noopener">
        ${matches[0].url}
      </a>`;
  }, [value]);

  useEffect(() => {
    if (!isFocused) return;
    onMouseEnter();
  }, [isFocused]);

  if (!cellInfo) return null;

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
    (isFirstColumn &&
      // @ts-ignore
      {
        new: 'text-green-400',
        old: 'text-pink-400',
        modified: 'text-yellow-500',
        'modified-row': 'text-yellow-500',
      }[status || '']) ||
    '';

  return (
    <div
      className="cell"
      css={[
        tw`flex border-b border-r`,
        status === 'new' && tw`border-green-200`,
        status === 'old' && tw`border-pink-200`,
        status === 'modified' && tw`border-yellow-200`,
        status === 'modified-row' && tw`border-gray-200`,
        !status && tw`border-gray-200`,
      ]}
      style={{
        ...style,
        background: background || '#fff',
      }}
    >
      <EditableCell
        value={rawValue}
        isEditable={isEditable}
        isFirstColumn={isFirstColumn}
        onChange={onCellChange}
        isFocused={isFocused}
        isExtraBlankRow={isExtraBlankRow}
        onFocusChange={onFocusChange}
        onRowDelete={onRowDelete}
      >
        <CellInner
          value={value}
          isFirstColumn={isFirstColumn}
          statusColor={statusColor}
          StatusIcon={StatusIcon}
          rawValue={rawValue}
          categoryColor={categoryColor}
          isLongValue={isLongValue}
          isNearBottomEdge={isNearBottomEdge}
          isNearRightEdge={isNearRightEdge}
          stringWithLinks={stringWithLinks}
          CellComponent={CellComponent}
          onMouseEnter={onMouseEnter}
        />
      </EditableCell>
    </div>
  );
}, areEqual);

const CellInner = React.memo(function CellInner({
  value,
  isFirstColumn,
  statusColor,
  StatusIcon,
  rawValue,
  categoryColor,
  isLongValue,
  isNearBottomEdge,
  isNearRightEdge,
  stringWithLinks,
  CellComponent,
  onMouseEnter,
}: {
  value: any;
  isFirstColumn: boolean;
  statusColor: string | TwStyle;
  StatusIcon: any;
  rawValue: any;
  categoryColor?: string | TwStyle;
  isLongValue: boolean;
  isNearBottomEdge?: boolean;
  isNearRightEdge?: boolean;
  stringWithLinks: string;
  CellComponent?: any;
  onMouseEnter?: Function;
}) {
  return (
    <div
      css={[
        tw`w-full h-full flex flex-none items-center px-4`,
        typeof value === 'undefined' ||
          (Number.isNaN(value) && tw`text-gray-300`),
      ]}
      onMouseEnter={() => onMouseEnter?.()}
    >
      {isFirstColumn && (
        <div css={[tw`w-6 flex-none`, statusColor]}>
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
          className="cell__long-value"
          css={[
            tw` absolute p-4 py-2 bg-white opacity-0 z-30 border border-gray-200 shadow-md pointer-events-none break-all text-left`,
            isNearBottomEdge ? tw`bottom-0` : tw`top-0`,
            isNearRightEdge ? tw`right-0` : tw`left-0`,
          ]}
          style={{
            width: 'max-content',
            maxWidth: '27em',
          }}
          title={rawValue}
        >
          <div
            tw="line-clamp-9"
            dangerouslySetInnerHTML={{ __html: stringWithLinks }}
          />
        </div>
      )}
    </div>
  );
});
