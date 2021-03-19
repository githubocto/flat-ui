import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { extent, max, min, scaleLinear, bisectLeft } from 'd3';

import { FilterValue } from '../types';
import { StickyGrid } from './sticky-grid';
import { Header } from './header';
import { Cell } from './cell';
import { Loader } from './loader';
import { useGridStore, cellTypeMap } from '../store';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  DiffModifiedIcon,
} from '@primer/octicons-react';

interface ScrollRefType {
  current: number;
}
interface GridProps {
  data: any[];
  diffData?: any[];
  metadata?: Record<string, string>;
}

export function Grid(props: GridProps) {
  const [focusedColumnIndex, setFocusedColumnIndex] = React.useState<number>();
  const [highlightedDiffIndex, setHighlightedDiffIndex] = React.useState<
    number
  >();
  const currentScrollYOffset = React.useRef<ScrollRefType>();
  // const [showFilters, setShowFilters] = React.useState(true);
  const showFilters = true;
  const {
    data,
    columnNames,
    handleDataChange,
    handleDiffDataChange,
    uniqueColumnName,
    diffs,
    filteredData,
    filters,
    focusedRowIndex,
    handleFocusedRowIndexChange,
    handleMetadataChange,
    schema,
    cellTypes,
  } = useGridStore(state => state);

  React.useEffect(() => {
    handleDataChange(props.data);
  }, [props.data]);

  React.useEffect(() => {
    if (props.metadata) handleMetadataChange(props.metadata);
  }, [props.metadata]);

  React.useEffect(() => {
    let diffData = props.data.slice(2).map(d => ({ ...d }));
    diffData[2]['Census2019'] = 123;
    handleDiffDataChange(diffData);
    // if (props.diffData) handleDiffDataChange(props.diffData);
  }, [props.diffData]);

  const columnWidths = React.useMemo(
    () =>
      columnNames.map((columnName: string, columnIndex: number) => {
        // @ts-ignore
        const cellType = cellTypes[columnName];
        // @ts-ignore
        const cellInfo = cellTypeMap[cellType];
        if (!cellInfo) return 150;

        const values = data.map(
          d => cellInfo.format(d[columnName] || '').length
        );
        const maxLength = max(values);
        const numberOfChars = min([maxLength + 3, 15]);
        return (
          Math.max(cellInfo.minWidth || 100, numberOfChars * 12) +
          (columnIndex === 0 ? 30 : 0)
        );
      }),
    [columnNames, data]
  );

  const columnScales = React.useMemo(() => {
    let scales = {};
    columnNames.forEach((columnName: string) => {
      // @ts-ignore
      const cellType = cellTypes[columnName];
      // @ts-ignore
      const cellInfo = cellTypeMap[cellType] || {};
      if (!cellInfo.hasScale) return;

      const scale = scaleLinear()
        // @ts-ignore
        .domain(extent(data, (d: object) => d[columnName]))
        // @ts-ignore
        .range(['rgba(200,200,200,0)', 'rgba(224,231,255,1)']);
      // @ts-ignore
      scales[columnName] = scale;
    });
    return scales;
  }, [data]);

  const columnWidthCallback = React.useCallback(i => columnWidths[i], [
    columnWidths.join(','),
  ]);
  const rowHeightCallback = React.useCallback(i => (i ? 40 : 117), []);

  interface AutoSizerType {
    height: number;
    width: number;
  }

  // @ts-ignore
  const positiveDiffs = diffs.filter(d => d.__status__ === 'new');
  // @ts-ignore
  const negativeDiffs = diffs.filter(d => d.__status__ === 'old');
  // @ts-ignore
  const modifiedDiffs = diffs.filter(d => d.__status__ === 'modified');

  const ref = useRespondToColumnChange([columnWidths]);

  const handleHighlightDiffChange = (delta: number = 0) => {
    let newHighlight = 0;
    if (
      typeof highlightedDiffIndex !== 'number' &&
      typeof currentScrollYOffset.current === 'number'
    ) {
      if (currentScrollYOffset.current === 0) {
        newHighlight = diffs.length;
      } else {
        const currentRowIndex =
          Math.round((currentScrollYOffset.current - 117) / 40) + 6;
        const nearestDiffIndex = bisectLeft(
          // @ts-ignore
          diffs.map(d => d.__rowIndex__),
          currentRowIndex
        );
        newHighlight = delta < 0 ? nearestDiffIndex - 1 : nearestDiffIndex;
      }
    } else {
      newHighlight = ((highlightedDiffIndex || 0) + delta) % diffs.length;
    }

    if (newHighlight < 0) newHighlight = diffs.length + newHighlight;
    setHighlightedDiffIndex(newHighlight);
    const highlightedDiff = diffs[newHighlight] || {};
    if (!uniqueColumnName) return;
    const rowIndex = filteredData.findIndex(
      // @ts-ignore
      d => d[uniqueColumnName] === highlightedDiff[uniqueColumnName]
    );
    if (!ref.current) return;

    // @ts-ignore
    ref.current.scrollToItem({
      // columnIndex: 0,
      rowIndex: rowIndex,
      align: 'center',
    });
    handleFocusedRowIndexChange(rowIndex);
    setFocusedColumnIndex(undefined);
  };

  interface ScrollType {
    scrollTop: number;
    scrollUpdateWasRequested: boolean;
  }
  const onScroll = (scrollInfo: ScrollType) => {
    const { scrollTop, scrollUpdateWasRequested } = scrollInfo;
    if (scrollUpdateWasRequested) return;
    // @ts-ignore
    currentScrollYOffset.current = scrollTop;
    if (typeof highlightedDiffIndex !== 'number') return;
    setHighlightedDiffIndex(undefined);
  };

  if (!schema)
    return (
      <div className="flex justify-center bg-white w-full h-full">
        <div className="flex flex-col justify-center items-center p-4 z-10">
          <Loader />
          <div className="font-bold text-lg italic pt-2">Loading...</div>
        </div>

        <div
          className="absolute inset-0 z-0 animate-pulse"
          style={{
            background: `linear-gradient(to bottom, #E5E7EB 1px, white 1px) 0 -4px`,
            backgroundSize: '100% 40px',
          }}
        />
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* <div className="bg-white h-10 flex px-4 border-b border-gray-200">
        <Toggle onChange={handleShowFiltersChange} checked={showFilters}>
          Show Filters
        </Toggle>
      </div> */}
      <div
        className="flex-1 w-full h-full"
        style={{
          background: `linear-gradient(to bottom, #E5E7EB 1px, transparent 1px) 0 -4px`,
          backgroundSize: `100% 40px`,
        }}
        onMouseLeave={() => handleFocusedRowIndexChange(undefined)}
      >
        <AutoSizer>
          {({ height, width }: AutoSizerType) => (
            <StickyGrid
              ref={ref}
              height={height}
              width={width}
              rowCount={filteredData.length + 1}
              columnWidth={columnWidthCallback}
              columnCount={columnNames.length}
              rowHeight={rowHeightCallback}
              columnWidths={columnWidths}
              overscanRowCount={5}
              onScroll={onScroll}
              itemData={{
                filteredData,
                focusedRowIndex,
                focusedColumnIndex,
                setFocusedColumnIndex,
                // @ts-ignore
                columnScales,
                columnNames,
                showFilters,
              }}
              // // @ts-ignore
              // itemKey={({ rowIndex }) => {
              //   return filteredData[rowIndex].LongName;
              // }}
              HeaderComponent={HeaderWrapper}
            >
              {CellWrapper}
            </StickyGrid>
          )}
        </AutoSizer>

        {Object.keys(filters).length && !filteredData.length && (
          <div
            className="absolute w-full flex justify-center italic text-gray-400"
            style={{ marginTop: 165 }}
          >
            No data with those filters
          </div>
        )}
      </div>

      {!!diffs.length && (
        <div
          className="absolute right-0 bottom-0 bg-gray-100
      border border-gray-300 flex justify-center items-center px-4 text-gray-600"
        >
          Changes:
          <div className="flex px-2">
            {!!positiveDiffs.length && (
              <div className="px-1 py-2 text-green-500 font-semibold">
                +{positiveDiffs.length} row
                {positiveDiffs.length === 1 ? '' : 's'}
              </div>
            )}
            {!!modifiedDiffs.length && (
              <div className="px-1 py-2 text-yellow-500 font-semibold">
                <DiffModifiedIcon /> {modifiedDiffs.length} row
                {modifiedDiffs.length === 1 ? '' : 's'}
              </div>
            )}
            {!!negativeDiffs.length && (
              <div className="px-1 py-2 text-pink-500 font-semibold">
                -{negativeDiffs.length} row
                {negativeDiffs.length === 1 ? '' : 's'}
              </div>
            )}
          </div>
          <button
            className="text-gray-900"
            onClick={() => handleHighlightDiffChange(-1)}
          >
            <ArrowLeftIcon />
          </button>
          <div className="tabular-nums px-1 w-5 text-center">
            {typeof highlightedDiffIndex === 'number'
              ? highlightedDiffIndex + 1
              : ''}
          </div>
          <button
            className="text-gray-900"
            onClick={() => handleHighlightDiffChange(1)}
          >
            <ArrowRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}

interface StyleObject {
  width?: number;
  top?: number;
  left?: number;
  marginTop?: number;
  marginLeft?: number;
  position?: number;
  display?: number;
}
interface CellPropsData {
  originalData: any[];
  filteredData: any[];
  focusedRowIndex?: number;
  showFilters: boolean;
  sort: string[];
  setFocusedRowIndex: Function;
  setFocusedColumnIndex: Function;
  focusedColumnIndex?: number;
  columnScales: Function[];
}
interface CellProps {
  columnIndex: number;
  rowIndex: number;
  data: CellPropsData;
  style: StyleObject;
}
const CellWrapper = function(props: CellProps) {
  const { rowIndex: rawRowIndex, columnIndex, data, style } = props;
  const { focusedColumnIndex, setFocusedColumnIndex, columnScales } = data;
  const {
    columnNames,
    filteredData,
    categoryValues,
    focusedRowIndex,
    handleFocusedRowIndexChange,
    cellTypes,
  } = useGridStore();

  const rowIndex = rawRowIndex - 1;

  if (rowIndex == -1) {
    return <HeaderWrapper {...props} />;
  }

  const name = columnNames[columnIndex];

  // @ts-ignore
  const type = cellTypes[name];

  if (!filteredData[rowIndex]) return null;

  let possibleValues = type === 'category' ? categoryValues[name] : undefined;

  const value = filteredData[rowIndex][name];
  let status = filteredData[rowIndex].__status__;
  if (status === 'modified') {
    const modifiedColumnNames =
      filteredData[rowIndex].__modifiedColumnNames__ || [];
    status = modifiedColumnNames.includes(name) ? 'modified' : undefined;
  }

  // @ts-ignore®
  const scale = columnScales && columnScales[name];
  const statusColors = new Map([
    ['new', '#ECFDF5'],
    ['old', '#FDF2F8'],
    ['modified', '#FEFBEB'],
  ]);
  const focusedStatusColors = new Map([
    ['new', '#D1FBE5'],
    ['old', '#FBE7F3'],
    ['modified', '#FEF2C7'],
  ]);
  const statusColor =
    focusedRowIndex == rowIndex
      ? focusedStatusColors.get(status)
      : statusColors.get(status);

  // prettier-ignore
  const backgroundColor =
    focusedColumnIndex == columnIndex && scale ? scale(value) :
    statusColor                                ? statusColor  :
    focusedRowIndex == rowIndex                ? '#f3f4f6'    :
                                                 '#fff';

  return (
    <CellWrapperComputed
      type={type}
      value={value}
      possibleValues={possibleValues}
      background={backgroundColor}
      style={style}
      status={status}
      isFirstColumn={columnIndex === 0}
      onMouseEnter={() => {
        setFocusedColumnIndex(columnIndex);
        handleFocusedRowIndexChange(rowIndex);
      }}
    />
  );
};

interface CellComputedProps {
  type: string;
  value: any;
  style: StyleObject;
  background?: string;
  possibleValues?: string[];
  status?: string;
  isFirstColumn?: boolean;
  onMouseEnter?: Function;
}
const CellWrapperComputed = React.memo(
  function(props: CellComputedProps) {
    return <Cell {...props} />;
  },
  (props, newProps) => {
    if (props.value != newProps.value) return false;
    if (props.type != newProps.type) return false;
    if (props.background != newProps.background) return false;
    if (props.style != newProps.style) return false;
    if (props.possibleValues != newProps.possibleValues) return false;
    if (props.status != newProps.status) return false;
    if (props.style.left != newProps.style.left) return false;
    if (props.style.top != newProps.style.top) return false;
    if (props.style.position != newProps.style.position) return false;
    if (props.style.display != newProps.style.display) return false;
    if (props.style.marginTop != newProps.style.marginTop) return false;
    if (props.style.marginLeft != newProps.style.marginLeft) return false;
    return true;
  }
);

const HeaderWrapper = function(props: CellProps) {
  const { columnIndex, data, style } = props;
  const {
    data: originalData,
    columnNames,
    stickyColumnName,
    handleStickyColumnNameChange,
    filters,
    handleFilterChange,
    filteredData,
    metadata,
    sort,
    categoryValues,
    handleSortChange,
    focusedRowIndex,
    cellTypes,
  } = useGridStore();

  const { showFilters } = data;

  const columnName = columnNames[columnIndex];

  // @ts-ignore
  const cellType = cellTypes[columnName];
  // @ts-ignore
  const cellInfo = cellTypeMap[cellType];
  if (!cellInfo) return null;

  // if (!filteredData[0]) return null;

  const focusedValue =
    typeof focusedRowIndex == 'number' && filteredData[0]
      ? (filteredData[focusedRowIndex] || {})[columnName]
      : undefined;

  const activeSortDirection = sort[0] == columnName ? sort[1] : undefined;

  const isSticky = stickyColumnName === columnName;

  let possibleValues =
    cellType === 'category' ? categoryValues[columnName] : undefined;

  return (
    <HeaderWrapperComputed
      style={style}
      columnName={columnName}
      cellType={cellType}
      cellInfo={cellInfo}
      activeSortDirection={activeSortDirection}
      originalData={originalData}
      filteredData={filteredData}
      filter={filters[columnName]}
      focusedValue={focusedValue}
      showFilters={showFilters}
      possibleValues={possibleValues}
      isSticky={isSticky}
      metadata={metadata[columnName]}
      isFirstColumn={columnIndex === 0}
      onSort={handleSortChange}
      onSticky={() => handleStickyColumnNameChange(columnName)}
      onFilterChange={(value: FilterValue) =>
        handleFilterChange(columnName, value)
      }
    />
  );
};

interface HeaderComputedProps {
  style: StyleObject;
  cellInfo: object;
  cellType: string;
  columnName: string;
  activeSortDirection?: string;
  metadata?: string;
  originalData: any[];
  filteredData: any[];
  possibleValues?: any[];
  filter?: FilterValue;
  focusedValue?: number;
  showFilters: boolean;
  isFirstColumn: boolean;
  isSticky: boolean;
  onFilterChange: Function;
  onSort: Function;
  onSticky: Function;
}
const HeaderWrapperComputed = React.memo(
  function(props: HeaderComputedProps) {
    return <Header {...props} />;
  },
  (props, newProps) => {
    if (props.cellType != newProps.cellType) return false;
    if (props.columnName != newProps.columnName) return false;
    if (props.activeSortDirection != newProps.activeSortDirection) return false;
    if (props.filteredData != newProps.filteredData) return false;
    if (props.filter != newProps.filter) return false;
    if (props.isSticky != newProps.isSticky) return false;
    if (props.focusedValue != newProps.focusedValue) return false;
    if (props.style.width != newProps.style.width) return false;
    if (props.style.left != newProps.style.left) return false;
    if (props.style.top != newProps.style.top) return false;
    if (props.style.position != newProps.style.position) return false;
    if (props.style.display != newProps.style.display) return false;
    if (props.style.marginTop != newProps.style.marginTop) return false;
    if (props.style.marginLeft != newProps.style.marginLeft) return false;
    return true;
  }
);

function useRespondToColumnChange(deps: any[]) {
  const ref = React.useRef();

  React.useEffect(() => {
    if (ref.current) {
      // @ts-ignore
      ref.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true,
      });
    }
  }, deps);

  return ref;
}
