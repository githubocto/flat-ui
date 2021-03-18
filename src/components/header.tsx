import React from 'react';
import cc from 'classcat';
import { ArrowUpIcon, ArrowDownIcon, PinIcon } from '@primer/octicons-react';
import { FilterValue } from '../types';

interface HeaderProps {
  style: object;
  cellInfo: object;
  cellType: string;
  columnName: string;
  activeSortDirection?: string;
  originalData: any[];
  filteredData: any[];
  filter?: FilterValue;
  focusedValue?: number;
  showFilters: boolean;
  isSticky: boolean;
  onFilterChange: Function;
  onSort: Function;
  onSticky: Function;
}
export function Header(props: HeaderProps) {
  const {
    style,
    columnName,
    activeSortDirection,
    originalData,
    filteredData,
    filter,
    cellType,
    cellInfo,
    focusedValue,
    showFilters,
    isSticky,
    onFilterChange,
    onSort,
    onSticky,
  } = props;

  // const popoverAnchorRef = React.createRef<HTMLDivElement>();

  // @ts-ignore
  const { filter: FilterComponent } = cellInfo;

  const onStickyLocal = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('HI');
    e.stopPropagation();
    onSticky();
  };

  return (
    <div
      className="sticky-grid__header border-b border-r bg-white border-gray-200 flex flex-col"
      style={{ ...style }}
    >
      <div
        className="header relative border-b border-gray-200 bg-gray-50 flex items-center h-10"

        // ref={popoverAnchorRef}
      >
        <div className="header__title group absolute top-0 left-0 bottom-0 z-10 bg-gray-100 shadow-md flex items-center">
          <button
            onClick={onStickyLocal}
            className={`h-10 p-2 border-b border-gray-200 focus:bg-gray-200 hover:bg-gray-200 bg-gray-50 appearance-none ${
              isSticky ? 'opacity-100' : 'opacity-0 -ml-6 shadow-md'
            } group-hover:opacity-100`}
          >
            <PinIcon />
          </button>
          <button
            className="group flex justify-between items-center h-10 p-2 border-b border-gray-200 focus:bg-gray-200 hover:bg-gray-200 appearance-none bg-gray-100 flex-1 min-w-0"
            onClick={() =>
              onSort(columnName, activeSortDirection == 'desc' ? 'asc' : 'desc')
            }
          >
            <span
              className={cc([
                'text-sm text-gray-600 font-medium truncate text-left',
                { 'text-right': ['integer', 'number'].includes(cellType) },
              ])}
              style={{ minWidth: 'calc(100% - 1.5em)' }}
            >
              {columnName}
            </span>
            <div
              className={`header__icon header__icon--${
                activeSortDirection ? 'active' : 'inactive'
              } flex items-center justify-center pl-1 pr-2 text-gray-600 -mr-2 h-10`}
            >
              {activeSortDirection == 'asc' ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon />
              )}
            </div>
          </button>
        </div>
        {/* <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex h-full items-center justify-center px-1 text-gray-600 focus:outline-none focus:ring focus:bg-gray-200 hover:bg-gray-200">
            {activeSortDirection == "desc" ? <ArrowDownIcon /> :
              activeSortDirection == "asc" ? <ArrowUpIcon /> :
                <ChevronDownIcon />
            }
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            anchorRef={popoverAnchorRef}
            align="start"
            style={{ width: 241, top: -1, right: 1 }}
            className="w-full bg-white focus:outline-none py-1 border border-gray-200 relative"
          >
            <DropdownMenu.Item className="menu-item" onSelect={() => onSort(columnName, "asc")}>
              <ArrowUpIcon />
              <span>Sort ascending</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="menu-item" onSelect={() => onSort(columnName, "desc")}>
              <ArrowDownIcon />
              <span>Sort descending</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root> */}
      </div>
      {showFilters && (
        <div className="flex-1 flex flex-col p-2 justify-center items-start">
          <FilterComponent
            id={columnName}
            onChange={onFilterChange}
            originalData={originalData}
            filteredData={filteredData}
            value={filter}
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
