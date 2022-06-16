import tw from 'twin.macro';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  PinIcon,
  TrashIcon
} from '@primer/octicons-react';
import { FilterValue, CategoryValue } from '../types';
import { EditableHeader } from './editable-header';
import { NewColumnHeader } from './new-column-header';
import { memo } from 'react';

interface HeaderProps {
  style: object;
  cellInfo: object;
  cellType: string;
  width?: number;
  columnName: string;
  activeSortDirection?: string;
  metadata?: string;
  originalData: any[];
  filteredData: any[];
  possibleValues?: CategoryValue[];
  filter?: FilterValue;
  focusedValue?: number;
  showFilters: boolean;
  isFirstColumn: boolean;
  isSticky: boolean;
  isNewColumn: boolean;
  isEditable: boolean;
  onChange?: (value: any) => void;
  onDelete?: () => void;
  onAdd: (name: string) => void;
  onFilterChange: Function;
  onSort: Function;
  onSticky: Function;
}
export function Header(props: HeaderProps) {
  const {
    style,
    columnName,
    activeSortDirection,
    width,
    metadata,
    originalData,
    filteredData,
    possibleValues,
    filter,
    cellType,
    cellInfo,
    focusedValue,
    showFilters,
    isFirstColumn,
    isSticky,
    isNewColumn,
    isEditable,
    onChange,
    onDelete,
    onAdd,
    onFilterChange,
    onSort,
    onSticky,
  } = props;

  // const popoverAnchorRef = React.createRef<HTMLDivElement>();

  // @ts-ignore
  const { filter: FilterComponent } = cellInfo;

  if (isNewColumn) return (
    <NewColumnHeader
      style={style}
      onAdd={onAdd}
    />
  )

  return (
    <div
      className="sticky-grid__header"
      tw="border-b border-r bg-white border-gray-200 flex-col"
      style={{ ...style }}
    >
      <HeaderTop
        cellType={cellType}
        columnName={columnName}
        activeSortDirection={activeSortDirection}
        metadata={metadata}
        isSticky={isSticky}
        onSticky={onSticky}
        onSort={onSort}
        isEditable={isEditable}
        onChange={onChange}
        onDelete={onDelete}
      />
      {showFilters && (
        <div
          css={[
            tw`flex-1 flex flex-col p-2 justify-center items-start`,
            isFirstColumn && tw`pl-8`,
          ]}
        >
          <FilterComponent
            id={columnName}
            onChange={onFilterChange}
            originalData={originalData}
            filteredData={filteredData}
            value={filter}
            possibleValues={possibleValues}
            maxWidth={width}
            // @ts-ignore
            shortFormat={cellInfo.shortFormat}
            // @ts-ignore
            longFormat={cellInfo.format}
            focusedValue={focusedValue}
          />
        </div>
      )}
    </div>
  );
}


const HeaderTop = memo(({
  cellType,
  columnName,
  activeSortDirection,
  metadata,
  isSticky,
  onSticky,
  onSort,
  isEditable,
  onChange,
  onDelete,
}: {
  cellType: string;
  columnName: string;
  activeSortDirection?: string;
  metadata?: string;
  isSticky: boolean;
  onSticky: Function;
  onSort: Function;
  isEditable: boolean;
  onChange?: (value: any) => void;
  onDelete?: () => void;
}) => {
  return (
    <div
      className="header"
      tw="relative border-b border-gray-200 bg-white flex items-center flex-shrink-0"
      style={{ height: 30 }}
    >
      <div
        className="header__title"
        tw="absolute top-0 left-0 bottom-0 z-10 bg-gray-50 text-gray-600 shadow-md flex items-center"
      >
        <button
          className="header__icon header__pin"
          css={[
            tw`h-full p-2 flex items-center border-indigo-100 focus:bg-indigo-100! hover:bg-indigo-100! appearance-none focus:opacity-100 text-indigo-400! bg-indigo-50! focus:ring-indigo-300`,
            isSticky ? tw`opacity-100` : tw`opacity-0 -ml-6! shadow-md`,
          ]}
          onClick={() => onSticky()}
        >
          <PinIcon />
        </button>
        <div
          className=""
          css={[
            tw`flex justify-between items-center h-full border-white focus:bg-white hover:bg-white appearance-none flex-1 min-w-0`,
            ['integer', 'number'].includes(cellType) && tw`text-right`,
          ]}
        >
          <EditableHeader
            value={columnName}
            isEditable={isEditable}
            onChange={onChange}
          >
            <div
              css={[
                tw`w-full p-2 text-sm font-medium truncate`,
              ]}
              title={columnName}
            >
              {columnName}
              {!!metadata && (
                <span tw="pl-2 inline-block text-gray-300">
                  <InfoIcon />
                </span>
              )}
            </div>
          </EditableHeader>
          {isEditable && (
            <button
              className="header__icon header__delete"
              css={[
                tw`h-full flex items-center justify-center text-red-500!`,
                tw`opacity-0 w-0 p-0`,
              ]}
              onClick={() =>
                onDelete?.()
              }
            >
              <TrashIcon />
            </button>
          )}
          <button
            className="header__icon"
            css={[
              tw`flex items-center justify-center pl-1 pr-1 -mr-2`,
              activeSortDirection
                ? tw`opacity-100`
                : tw`opacity-0 text-gray-400!`,
            ]}
            onClick={() =>
              onSort(columnName, activeSortDirection == 'asc' ? 'desc' : 'asc')
            }
          >
            {activeSortDirection == 'desc' ? (
              <ArrowDownIcon />
            ) : (
              <ArrowUpIcon />
            )}
          </button>
        </div>
        {!!metadata && (
          <div className="header__icon" tw="text-sm absolute bottom-0 bg-white p-4 text-indigo-500 transform translate-y-full border border-indigo-300 py-3 shadow-md left-0 right-0 pointer-events-none opacity-0">
            <div tw="pr-2 inline-block text-indigo-200">
              <InfoIcon />
            </div>
            {metadata}
          </div>
        )}
      </div>
    </div>
  )
})