import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { format as d3Format, timeFormat, extent, scaleLinear } from 'd3';

import { FilterValue } from '../types';
import { StickyGrid } from './sticky-grid';
import { Header } from './header';
import { Cell } from './cell';
import { useGridStore, cellTypeMap } from '../store';

interface GridProps {
  data: any[];
}

export function Grid(props: GridProps) {
  const [focusedColumnIndex, setFocusedColumnIndex] = React.useState<number>();
  // const [showFilters, setShowFilters] = React.useState(true);
  const showFilters = true;
  const {
    data,
    columnNames,
    handleDataChange,
    filteredData,
    focusedRowIndex,
    handleFocusedRowIndexChange,
    schema,
    cellTypes,
  } = useGridStore(state => state);

  React.useEffect(() => {
    handleDataChange(props.data);
  }, [props.data]);

  const columnWidths = React.useMemo(
    () =>
      columnNames.map((columnName: string) => {
        // @ts-ignore
        const cellType = cellTypes[columnName];
        // @ts-ignore
        const cellInfo = cellTypeMap[cellType];
        if (!cellInfo) return 150;

        const values = data.map(
          d => cellInfo.format(d[columnName] || '').length
        );
        const maxLength = Math.max(...values);
        const numberOfChars = Math.min(maxLength + 3, 15);
        return Math.max(cellInfo.minWidth || 100, numberOfChars * 12);
      }),
    [columnNames, data]
  );

  const columnScales = React.useMemo(() => {
    let scales = {};
    columnNames.forEach((columnName: string) => {
      // @ts-ignore
      const cellType = cellTypes[columnName];
      if (cellType == 'string') return;
      const scale = scaleLinear()
        // @ts-ignore
        .domain(extent(data, (d: object) => d[columnName]))
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

  if (!schema) return <div>Loading...</div>;
  console.log(schema);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* <div className="bg-white h-10 flex px-4 border-b border-gray-200">
        <Toggle onChange={handleShowFiltersChange} checked={showFilters}>
          Show Filters
        </Toggle>
      </div> */}
      <div
        className="flex-1 w-full h-full"
        onMouseLeave={() => handleFocusedRowIndexChange(undefined)}
      >
        <AutoSizer>
          {({ height, width }: AutoSizerType) => (
            <StickyGrid
              height={height}
              width={width}
              rowCount={filteredData.length}
              columnWidth={columnWidthCallback}
              columnCount={columnNames.length}
              rowHeight={rowHeightCallback}
              columnWidths={columnWidths}
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
      </div>
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

  const value = filteredData[rowIndex][name];

  // @ts-ignore®
  const scale = columnScales && columnScales[name];
  const backgroundColor =
    focusedColumnIndex == columnIndex && scale
      ? scale(value)
      : focusedRowIndex == rowIndex
      ? '#f3f4f6'
      : '#fff';

  return (
    <CellWrapperComputed
      type={type}
      value={value}
      background={backgroundColor}
      style={style}
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
    handleStickyColumnNameChange,
    filters,
    handleFilterChange,
    filteredData,
    sort,
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
      ? filteredData[focusedRowIndex][columnName]
      : undefined;

  const activeSortDirection = sort[0] == columnName ? sort[1] : undefined;

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
  originalData: any[];
  filteredData: any[];
  filter?: FilterValue;
  focusedValue?: number;
  showFilters: boolean;
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
