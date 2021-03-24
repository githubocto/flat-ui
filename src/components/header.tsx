import React from 'react';
import cc from 'classcat';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  PinIcon,
} from '@primer/octicons-react';
import { FilterValue } from '../types';

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
  possibleValues?: string | number[];
  filter?: FilterValue;
  focusedValue?: number;
  showFilters: boolean;
  isFirstColumn: boolean;
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
    onFilterChange,
    onSort,
    onSticky,
  } = props;

  // const popoverAnchorRef = React.createRef<HTMLDivElement>();

  // @ts-ignore
  const { filter: FilterComponent } = cellInfo;

  return (
    <div
      className="sticky-grid__header border-b border-r bg-white border-gray-200 flex flex-col"
      style={{ ...style }}
    >
      <div
        className="header relative border-b border-gray-200 bg-white flex items-center"
        style={{ height: 37 }}
        // ref={popoverAnchorRef}
      >
        <div className="header__title group absolute top-0 left-0 bottom-0 z-10 bg-white text-gray-600 shadow-md flex items-center">
          <button
            onClick={() => onSticky()}
            className={`h-full p-2 border-indigo-100 focus:bg-indigo-100 hover:bg-indigo-100 bg-gray-50 appearance-none ${
              isSticky ? 'opacity-100' : 'opacity-0 -ml-6 shadow-md'
            } focus:opacity-100 group-hover:opacity-100 text-indigo-400 bg-indigo-50 focus:ring-indigo-300`}
          >
            <PinIcon />
          </button>
          <button
            className="group flex justify-between items-center h-full p-2 border-gray-200 focus:bg-gray-200 hover:bg-gray-200 appearance-none bg-white flex-1 min-w-0"
            onClick={() =>
              onSort(columnName, activeSortDirection == 'asc' ? 'desc' : 'asc')
            }
          >
            <span
              className={cc([
                'text-sm font-medium truncate text-left',
                { 'text-right': ['integer', 'number'].includes(cellType) },
              ])}
              title={columnName}
              style={{ minWidth: 'calc(100% - 1.5em)' }}
            >
              {columnName}
              {!!metadata && (
                <span className="pl-2 inline-block text-gray-300">
                  <InfoIcon />
                </span>
              )}
            </span>
            <div
              className={`header__icon flex items-center justify-center pl-1 pr-2 -mr-2 ${
                activeSortDirection
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-40'
              }`}
            >
              {activeSortDirection == 'desc' ? (
                <ArrowDownIcon />
              ) : (
                <ArrowUpIcon />
              )}
            </div>
          </button>
          {!!metadata && (
            <div className="text-sm absolute bottom-0 bg-white p-4 text-indigo-500 transform translate-y-full border border-indigo-300 py-3 shadow-md left-0 right-0 pointer-events-none opacity-0 group-hover:opacity-100">
              <div className="pr-2 inline-block text-indigo-200">
                <InfoIcon />
              </div>
              {metadata}
            </div>
          )}
        </div>
        {/* <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex h-full items-center justify-center px-1 focus:outline-none focus:ring focus:bg-gray-200 hover:bg-gray-200">
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
        <div
          className={cc([
            'flex-1 flex flex-col p-2 justify-center items-start',
            {
              'pl-8': isFirstColumn,
            },
          ])}
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
