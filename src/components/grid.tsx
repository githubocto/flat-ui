import React from 'react';
import 'twin.macro';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { extent, scaleLinear, bisectLeft } from 'd3';

import { FilterValue, FilterMap, CategoryValue } from '../types';
import { StickyGrid } from './sticky-grid';
import { Header } from './header';
import { Cell } from './cell';
import { Loader } from './loader';
import { useGridStore } from './store-wrapper';
import { cellTypeMap } from '../store';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  DiffModifiedIcon,
  DownloadIcon,
  SyncIcon,
} from '@primer/octicons-react';
import fromPairs from 'lodash/fromPairs';
import { TwStyle } from 'twin.macro';

interface ScrollRefType {
  current: number;
}

interface GridStateObject {
  stickyColumnName?: string;
  columnNames: string[];
  filteredData: any[];
  diffs: object[];
  filters: FilterMap<FilterValue>;
  sort: string[];
  schema?: object;
}
export interface GridProps {
  data: any[];
  diffData?: any[];
  metadata?: Record<string, string>;
  canDownload?: Boolean;
  defaultFilters?: FilterMap<FilterValue>;
  defaultSort?: string[];
  defaultStickyColumnName?: string;
  onChange?: (currentState: GridStateObject) => void;
  downloadFilename?: string;
  isEditable?: boolean;
  onEdit?: (newData: any[]) => void;
}

export function Grid(props: GridProps) {
  const { downloadFilename, canDownload = true } = props;

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
    stickyColumnName,
    sort,
    filteredData,
    filters,
    focusedRowIndex,
    handleFocusedRowIndexChange,
    handleMetadataChange,
    handleFiltersChange,
    updateFilteredColumns,
    updateColumnNames,
    handleSortChange,
    handleStickyColumnNameChange,
    columnWidths,
    updateColumnWidths,
    schema,
    cellTypes,
    handleIsEditableChange,
    updatedData,
    focusedCellPosition,
  } = useGridStore(state => state);

  React.useEffect(() => {
    handleDataChange(props.data);

    if (!ref.current) return;

    // preserve scroll position
    if (focusedCellPosition) return

    // @ts-ignore
    ref.current?.scrollToItem({
      columnIndex: 0,
      rowIndex: 0,
      align: 'center',
    });
  }, [props.data]);

  React.useEffect(() => {
    if (!focusedCellPosition) return;
    if (!ref.current) return;

    // @ts-ignore
    const numberOfStickiedColumns = ref.current.props.numberOfStickiedColumns
    // @ts-ignore
    const left = ref.current.state.scrollLeft
    let columnIndex = focusedCellPosition[1]
    const sum = (array: number[]) => array.reduce((a, b) => a + b, 0)
    const stickyColumnWidth = sum(columnWidths.slice(0, numberOfStickiedColumns))
    const unstickyLeft = left + stickyColumnWidth
    const leftTarget = sum(columnWidths.slice(0, columnIndex))
    let numberOfColumnsToOffsetStickyColumn = 0
    let xOffset = sum(columnWidths.slice(columnIndex - numberOfColumnsToOffsetStickyColumn, columnIndex))
    while (leftTarget < unstickyLeft && xOffset < stickyColumnWidth && columnIndex > 0) {
      numberOfColumnsToOffsetStickyColumn += 1
      xOffset = sum(columnWidths.slice(columnIndex - numberOfColumnsToOffsetStickyColumn, columnIndex))
    }
    columnIndex -= numberOfColumnsToOffsetStickyColumn

    // @ts-ignore
    const rowHeight = ref.current.props.rowHeight(1)
    // @ts-ignore
    const headerHeight = ref.current.props.rowHeight(0)
    // @ts-ignore
    const top = ref.current.state.scrollTop
    // @ts-ignore
    const footerHeight = rowHeight
    // @ts-ignore
    const maxHeight = ref.current.props.height - footerHeight
    let rowIndex = focusedCellPosition[0]
    const topTarget = headerHeight + rowHeight * rowIndex
    if (topTarget > top + maxHeight) {
      rowIndex += 1
    }

    // @ts-ignore
    ref.current.scrollToItem({
      rowIndex,
      columnIndex,
      align: 'nearest',
    });
  }, [focusedCellPosition]);

  React.useEffect(() => {
    if (props.metadata) handleMetadataChange(props.metadata);
  }, [props.metadata]);

  React.useEffect(() => {
    if (props.diffData) handleDiffDataChange(props.diffData);
  }, [props.diffData, props.data]);

  React.useEffect(() => {
    if (props.defaultFilters) handleFiltersChange(props.defaultFilters);
  }, [encodeFilterString(props.defaultFilters), props.data]);

  React.useEffect(() => {
    if (props.defaultSort)
      handleSortChange(props.defaultSort[0], props.defaultSort[1]);
  }, [props.defaultSort?.join(','), props.data]);

  React.useEffect(() => {
    if (props.defaultStickyColumnName)
      handleStickyColumnNameChange(props.defaultStickyColumnName);
  }, [props.defaultStickyColumnName, props.data]);

  React.useEffect(() => {
    handleIsEditableChange(!!props.isEditable);
  }, [props.isEditable]);

  React.useEffect(() => {
    if (updatedData === null) return
    if (!props.onEdit || !props.isEditable) return;
    props.onEdit(updatedData);
  }, [updatedData]);

  React.useEffect(updateColumnNames, [props.data, stickyColumnName]);
  React.useEffect(updateFilteredColumns, [data, filters, sort]);

  React.useEffect(() => {
    if (typeof props.onChange !== 'function') return;
    if (!schema) return;

    const currentState = {
      stickyColumnName,
      columnNames,
      filteredData,
      diffs,
      filters,
      sort,
      schema,
    };
    props.onChange(currentState);
  }, [sort, stickyColumnName, encodeFilterString(filters)]);

  const scrollToTop = () => {
    // @ts-ignore
    ref?.current?.scrollToItem({ rowIndex: 0 });
  };
  React.useEffect(scrollToTop, [sort.join(",")]);

  const isFiltered = Object.keys(filters).length > 0;

  React.useEffect(updateColumnWidths, [columnNames, data]);

  const filteredDataWithOptionalEmptyRows = React.useMemo(() => {
    let res = [...filteredData]
    if (props.isEditable) {
      const emptyRows = new Array(numberOfExtraRowsWhenEditing).fill(null).map(() => ({}))
      res = [...res, ...emptyRows]
    }
    return res
  }, [filteredData, props.isEditable])

  const columnWidthCallback = React.useCallback(i => columnWidths[i] || 150, [
    columnWidths.join(','),
  ]);
  const rowHeightCallback = React.useCallback(i => (i ? 40 : 117), []);

  const columnNamesWithOptionalEmptyColumn = React.useMemo(() => {
    let res = [...columnNames]
    if (props.isEditable) {
      res = [...res, "__new-blank-column__"]
    }
    return res
  }, [columnNames, props.isEditable])

  const columnWidthsWithOptionalEmptyColumn = React.useMemo(() => {
    let res = [...columnWidths]
    if (props.isEditable) {
      res = [...res, columnWidthCallback(columnWidths.length)]
    }
    return res
  }, [columnNames, props.isEditable])

  const columnScales = React.useMemo(() => {
    let scales = {};
    columnNamesWithOptionalEmptyColumn.forEach((columnName: string) => {
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

  const ref = useRespondToColumnChange([columnWidthsWithOptionalEmptyColumn]);

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

  const handleDownloadJson = () => {
    var dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          filteredData.map(d =>
            fromPairs(
              columnNames.map(columnName => [
                columnName,
                d['__rawData__'][columnName] || d[columnName],
              ])
            )
          )
        )
      );
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    const date = new Date().toDateString();
    link.setAttribute(
      'download',
      `${downloadFilename || `flat-ui__data-${date}`}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCsv = () => {
    let csvContent = [
      columnNames.map(columnName => columnName),
      filteredData
        .map(d =>
          columnNames
            .map(columnName => {
              // @ts-ignore
              const cellType = cellTypes[columnName];
              // @ts-ignore
              const data = d['__rawData__'][columnName] || d[columnName];
              let formattedData =
                typeof data === 'object' ? JSON.stringify(data) : data;
              if (
                typeof formattedData === 'string' &&
                (formattedData.includes('"') ||
                  formattedData.includes(',') ||
                  formattedData.includes('\n'))
              ) {
                formattedData = `"${formattedData.replace(/"/g, '""')}"`;
              }
              return formattedData;
            })
            .join(',')
        )
        .join('\n'),
    ].join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toDateString();
    link.setAttribute(
      'download',
      `${downloadFilename || `flat-ui__data-${date}`}.csv`
    );
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  if (!schema)
    return (
      <div tw="relative flex justify-center bg-white w-full h-full">
        <div tw="flex flex-col justify-center items-center p-4 z-10">
          <Loader />
          <div tw="font-bold text-lg italic pt-2">Loading...</div>
        </div>

        <div
          tw="absolute inset-0 z-0 animate-pulse"
          style={{
            background: `linear-gradient(to bottom, #E5E7EB 1px, white 1px) 0 -4px`,
            backgroundSize: '100% 40px',
          }}
        />
      </div>
    );
  if (!Object.keys(schema).length)
    return (
      <div tw="relative flex justify-center bg-white w-full h-full">
        <div tw="flex flex-col justify-center items-center p-4 z-10">
          <div tw="font-bold text-lg italic pt-2">No valid data</div>
        </div>
      </div>
    );

  return (
    <div tw="flex flex-col h-full bg-white" className="fade-up-in">
      {/* <div tw="bg-white h-10 flex px-4 border-b border-gray-200">
        <Toggle onChange={handleShowFiltersChange} checked={showFilters}>
          Show Filters
        </Toggle>
      </div> */}
      <div
        tw="flex-1 w-full h-full"
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
              rowCount={filteredDataWithOptionalEmptyRows.length + 1}
              columnWidth={columnWidthCallback}
              columnCount={columnNamesWithOptionalEmptyColumn.length}
              rowHeight={rowHeightCallback}
              columnWidths={columnWidthsWithOptionalEmptyColumn}
              numberOfStickiedColumns={width < 700 ? 0 : 1}
              overscanRowCount={5}
              onScroll={onScroll}
              itemData={{
                filteredData: filteredDataWithOptionalEmptyRows,
                focusedRowIndex,
                focusedColumnIndex,
                setFocusedColumnIndex,
                // @ts-ignore
                columnScales,
                columnNames: columnNamesWithOptionalEmptyColumn,
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

        {!!Object.keys(filters).length && !filteredData.length && (
          <div
            tw="absolute w-full flex justify-center italic text-gray-400"
            style={{ marginTop: 165 }}
          >
            No data with those filters
          </div>
        )}
      </div>

      <div tw="flex-none w-full flex flex-wrap align-middle justify-between z-20 bg-gray-800 text-white border-t border-gray-200 text-sm">
        <div tw="flex justify-center items-center px-4">
          {!!diffs.length && (
            <>
              Changes:
              <div tw="flex px-2">
                {!!positiveDiffs.length && (
                  <div tw="px-1 py-2 text-green-500 font-semibold">
                    +{positiveDiffs.length} row
                    {positiveDiffs.length === 1 ? '' : 's'}
                  </div>
                )}
                {!!modifiedDiffs.length && (
                  <div tw="px-1 py-2 text-yellow-500 font-semibold">
                    <span style={{ marginRight: 1 }}>
                      <DiffModifiedIcon />
                    </span>
                    {modifiedDiffs.length} row
                    {modifiedDiffs.length === 1 ? '' : 's'}
                  </div>
                )}
                {!!negativeDiffs.length && (
                  <div tw="px-1 py-2 text-pink-500 font-semibold">
                    -{negativeDiffs.length} row
                    {negativeDiffs.length === 1 ? '' : 's'}
                  </div>
                )}
              </div>
              <button tw="" onClick={() => handleHighlightDiffChange(-1)}>
                <ArrowLeftIcon />
              </button>
              <div tw="tabular-nums px-1 text-center">
                {typeof highlightedDiffIndex === 'number'
                  ? highlightedDiffIndex + 1
                  : ''}
              </div>
              <button tw="" onClick={() => handleHighlightDiffChange(1)}>
                <ArrowRightIcon />
              </button>
            </>
          )}
          <div tw="m-2 text-gray-200 whitespace-nowrap">
            Showing {filteredData.length.toLocaleString()}
            {isFiltered && ` of ${data.length.toLocaleString()}`} row
            {(isFiltered ? filteredData : data).length === 1 ? '' : 's'}
          </div>
        </div>

        <div tw="flex items-center space-x-2 m-2">
          {canDownload && (
            <span tw="relative z-0 inline-flex rounded-full">
              <button
                onClick={handleDownloadCsv}
                type="button"
                tw="relative space-x-1 inline-flex items-center px-3 py-2 rounded-l-full bg-black hover:bg-gray-900 focus:bg-gray-900 text-sm border border-gray-800 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <DownloadIcon />
                <span>{isFiltered ? 'Filtered ' : ''} CSV</span>
              </button>
              <button
                onClick={handleDownloadJson}
                type="button"
                tw="-ml-px relative space-x-1 inline-flex items-center px-3 py-2 rounded-r-full bg-black hover:bg-gray-900 focus:bg-gray-900 text-sm border border-gray-800 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <DownloadIcon />
                <span>{isFiltered ? 'Filtered ' : ''} JSON</span>
              </button>
            </span>
          )}

          {isFiltered && (
            <button
              tw="p-2 px-6 flex justify-center items-center bg-black rounded-full"
              onClick={() => handleFiltersChange()}
            >
              <span tw="mr-2">
                <SyncIcon />
              </span>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const numberOfExtraRowsWhenEditing = 1

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
const CellWrapper = function (props: CellProps) {
  const { rowIndex: rawRowIndex, columnIndex, data, style } = props;
  const { focusedColumnIndex, setFocusedColumnIndex, columnScales } = data;
  const {
    columnNames,
    filteredData,
    categoryValues,
    focusedRowIndex,
    handleFocusedRowIndexChange,
    cellTypes,
    isEditable,
    onCellChange,
    onRowDelete,
    focusedCellPosition,
    handleFocusedCellPositionChange,
  } = useGridStore();

  const rowIndex = rawRowIndex - 1;

  if (rowIndex == -1) {
    return <HeaderWrapper {...props} />;
  }

  const name = columnNames[columnIndex];

  // @ts-ignore
  const type = cellTypes[name];
  const cellData = filteredData[rowIndex] || { [name]: "" }

  // if (!cellData) return null;

  const value = cellData[name];
  const rawValue = cellData['__rawData__']?.[name];

  let possibleValues = type === 'category' ? categoryValues[name] : [];
  const possibleValue = possibleValues?.find(d => d.value === value);
  const categoryColor = possibleValue?.color;

  let status = cellData.__status__;
  if (status === 'modified') {
    const modifiedColumnNames =
      cellData.__modifiedColumnNames__ || [];
    status = modifiedColumnNames.includes(name) ? 'modified' : 'modified-row';
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
      statusColor ? statusColor :
        focusedRowIndex == rowIndex ? '#f3f4f6' :
          '#fff';

  const onCellChangeLocal = (value: any) => {
    onCellChange(rowIndex, name, value);
  }
  const onRowDeleteLocal = () => {
    onRowDelete(rowIndex);
  }

  const onFocusChangeLocal = (diff: [number, number] | null) => {
    if (!diff) {
      handleFocusedCellPositionChange(null);
    } else {
      const [diffRow, diffColumn] = diff
      const newRowIndex = Math.max(0, Math.min(rowIndex + diffRow, filteredData.length - 1 + (isEditable ? numberOfExtraRowsWhenEditing : 0)))
      const newColumnIndex = Math.max(0, Math.min(columnIndex + diffColumn, columnNames.length - 1))
      const newPosition = [
        newRowIndex,
        newColumnIndex,
      ] as [number, number];
      handleFocusedCellPositionChange(newPosition);
    }
  }

  return (
    <CellWrapperComputed
      type={type}
      value={value}
      rawValue={rawValue}
      categoryColor={categoryColor}
      background={backgroundColor}
      style={style}
      status={status}
      isFirstColumn={columnIndex === 0}
      isExtraBlankRow={rowIndex === filteredData.length}
      isNearRightEdge={columnIndex > columnNames.length - 3}
      isNearBottomEdge={rowIndex > filteredData.length - 3}
      isEditable={isEditable}
      isFocused={!!(focusedCellPosition && focusedCellPosition[0] === rowIndex && focusedCellPosition[1] === columnIndex)}
      onFocusChange={onFocusChangeLocal}
      onCellChange={onCellChangeLocal}
      onRowDelete={onRowDeleteLocal}
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
  rawValue: any;
  style: StyleObject;
  background?: string;
  categoryColor?: string | TwStyle;
  status?: string;
  isFirstColumn: boolean;
  isExtraBlankRow: boolean;
  isNearRightEdge?: boolean;
  isNearBottomEdge?: boolean;
  isEditable: boolean;
  onCellChange: (value: any) => void;
  onRowDelete: () => void;
  isFocused: boolean;
  onFocusChange: (value: [number, number] | null) => void;
  onMouseEnter?: Function;
}
const CellWrapperComputed = React.memo(
  function (props: CellComputedProps) {
    return <Cell {...props} />;
  },
  (props, newProps) => {
    if (props.value != newProps.value) return false;
    if (props.type != newProps.type) return false;
    if (props.background != newProps.background) return false;
    if (props.style != newProps.style) return false;
    if (props.categoryColor != newProps.categoryColor) return false;
    if (props.status != newProps.status) return false;
    if (props.isNearRightEdge != newProps.isNearRightEdge) return false;
    if (props.isNearBottomEdge != newProps.isNearBottomEdge) return false;
    if (props.isExtraBlankRow != newProps.isExtraBlankRow) return false;
    if (props.isEditable != newProps.isEditable) return false;
    if (props.isFirstColumn != newProps.isFirstColumn) return false;
    if (props.isFocused != newProps.isFocused) return false;
    if (props.style.left != newProps.style.left) return false;
    if (props.style.top != newProps.style.top) return false;
    if (props.style.position != newProps.style.position) return false;
    if (props.style.display != newProps.style.display) return false;
    if (props.style.marginTop != newProps.style.marginTop) return false;
    if (props.style.marginLeft != newProps.style.marginLeft) return false;
    return true;
  }
);

const HeaderWrapper = function (props: CellProps) {
  const { columnIndex, data, style } = props;
  const {
    data: originalData,
    columnNames,
    columnWidths,
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
    isEditable,
    onHeaderCellChange,
    onHeaderDelete,
    onHeaderAdd,
  } = useGridStore();
  const columnNameRef = React.useRef('');

  const { showFilters } = data;

  const columnName = columnNames[columnIndex];
  columnNameRef.current = columnName;
  const columnWidth = columnWidths[columnIndex];

  // @ts-ignore
  const cellType = cellTypes[columnName] || "string"
  // @ts-ignore
  const cellInfo = cellTypeMap[cellType] || {}

  const maxColumns = isEditable ? columnNames.length + 1 : columnNames.length;
  if (columnIndex >= maxColumns) return null;

  const isNewColumn = isEditable && columnIndex === columnNames.length;

  const focusedValue =
    typeof focusedRowIndex == 'number' && filteredData[0]
      ? (filteredData[focusedRowIndex] || {})[columnName]
      : undefined;

  const activeSortDirection = sort[0] == columnName ? sort[1] : undefined;

  const isSticky = stickyColumnName === columnName;

  let possibleValues =
    cellType === 'category' ? categoryValues[columnName] : undefined;

  const onHeaderCellChangeLocal = (value: any) => {
    onHeaderCellChange(columnName, value);
  }
  const onHeaderDeleteLocal = () => {
    onHeaderDelete(columnName);
  }

  return (
    <HeaderWrapperComputed
      style={style}
      columnName={columnName}
      cellType={cellType}
      cellInfo={cellInfo}
      width={columnWidth}
      activeSortDirection={activeSortDirection}
      originalData={originalData}
      filteredData={filteredData}
      filter={filters[columnName]}
      focusedValue={focusedValue}
      showFilters={showFilters}
      possibleValues={possibleValues}
      isSticky={isSticky}
      isNewColumn={isNewColumn}
      metadata={metadata[columnName]}
      isFirstColumn={columnIndex === 0}
      isEditable={isEditable}
      onChange={onHeaderCellChangeLocal}
      onDelete={onHeaderDeleteLocal}
      onAdd={onHeaderAdd}
      onSort={handleSortChange}
      onSticky={() => handleStickyColumnNameChange(columnName)}
      onFilterChange={(value: FilterValue) => {
        handleFilterChange(columnNameRef.current, value);
      }}
    />
  );
};

interface HeaderComputedProps {
  style: StyleObject;
  cellInfo: object;
  cellType: string;
  columnName: string;
  width?: number;
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
  onChange: (value: any) => void;
  onDelete: () => void;
  onAdd: (name: string) => void;
  onFilterChange: Function;
  onSort: Function;
  onSticky: Function;
}
const HeaderWrapperComputed = React.memo(
  function (props: HeaderComputedProps) {
    return <Header {...props} />;
  },
  (props, newProps) => {
    if (props.cellType != newProps.cellType) return false;
    if (props.columnName != newProps.columnName) return false;
    if (props.activeSortDirection != newProps.activeSortDirection) return false;
    if (props.filteredData != newProps.filteredData) return false;
    if (props.filter != newProps.filter) return false;
    if (props.width != newProps.width) return false;
    if (props.isSticky != newProps.isSticky) return false;
    if (props.isNewColumn != newProps.isNewColumn) return false;
    if (props.isEditable != newProps.isEditable) return false;
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

export function encodeFilterString(filters?: Record<string, FilterValue>) {
  if (!filters) return '';
  return encodeURI(
    Object.keys(filters)
      .map(columnName => {
        const value = filters[columnName];
        return [
          columnName,
          typeof value === 'string'
            ? value
            : Array.isArray(value)
              ? value.join(',')
              : '',
        ].join('=');
      })
      .join('&')
  );
}
