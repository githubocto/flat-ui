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
    onFilterChange,
    onSort,
    onSticky,
  } = props;

  // const popoverAnchorRef = React.createRef<HTMLDivElement>();

  const headingClass = cc([
    'text-sm text-gray-600 font-medium truncate',
    {
      'text-right block': cellType === 'integer',
    },
  ]);

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
      <button
        className="header relative border-b border-gray-200 bg-gray-50 flex justify-between items-center h-10 focus:bg-gray-200 hover:bg-gray-200 appearance-none"
        onClick={() =>
          onSort(columnName, activeSortDirection == 'desc' ? 'asc' : 'desc')
        }
        // ref={popoverAnchorRef}
      >
        <div
          className="text-right flex items-center pl-4 truncate"
          title={columnName}
        >
          <button onClick={onStickyLocal} className="header__pin mr-1 -ml-3">
            <PinIcon />
          </button>
          <span className={headingClass}>{columnName}</span>
        </div>
        <div className="header__title absolute top-0 left-0 bottom-0 z-10 bg-gray-100 border-r border-gray-200 shadow-md text-right flex items-center pl-4 pr-4 pointer-events-none">
          <button onClick={onStickyLocal} className=" mr-1 -ml-3">
            <PinIcon />
          </button>
          <span className={headingClass}>{columnName}</span>
          <div className="flex h-full items-center justify-center px-1 pl-2 pr-0 text-gray-600">
            {activeSortDirection == 'desc' ? (
              <ArrowDownIcon />
            ) : activeSortDirection == 'asc' ? (
              <ArrowUpIcon />
            ) : null}
          </div>
        </div>
        <div className="flex h-full items-center justify-center px-1 text-gray-600">
          {activeSortDirection == 'desc' ? (
            <ArrowDownIcon />
          ) : activeSortDirection == 'asc' ? (
            <ArrowUpIcon />
          ) : null}
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
      </button>
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
            focusedValue={focusedValue}
          />
        </div>
      )}
    </div>
  );
}
