// @ts-nocheck

import React from 'react';
import { VariableSizeGrid } from 'react-window';
import { FilterValue } from '../types';

function getCellIndicies(child) {
  return { row: child.props.rowIndex, column: child.props.columnIndex };
}

function getShownIndicies(children) {
  let minRow = Infinity;
  let maxRow = 0;
  let minColumn = Infinity;
  let maxColumn = 0;

  React.Children.forEach(children, child => {
    const { row, column } = getCellIndicies(child);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minColumn = Math.min(minColumn, column);
    maxColumn = Math.max(maxColumn, column);
  });

  return {
    from: {
      row: minRow == Infinity ? 0 : minRow,
      column: minColumn == Infinity ? 0 : minColumn,
    },
    to: {
      row: maxRow,
      column: maxColumn,
    },
  };
}

function useInnerElementType(
  Cell,
  columnWidth,
  rowHeight,
  itemData,
  HeaderComponent
) {
  return React.useMemo(
    () =>
      React.forwardRef((props, ref) => {
        function sumRowsHeights(index) {
          let sum = 0;
          while (index > 1) {
            sum += rowHeight(index - 1);
            index -= 1;
          }
          return sum;
        }

        function sumColumnWidths(index) {
          let sum = 0;
          while (index > 1) {
            sum += columnWidth(index - 1);
            index -= 1;
          }
          return sum;
        }

        const shownIndicies = getShownIndicies(props.children);

        const shownColumnsCount =
          shownIndicies.to.column - shownIndicies.from.column ||
          itemData.columnNames.length;
        const shownRowsCount = shownIndicies.to.row - shownIndicies.from.row;

        const shownColumns = new Array(shownColumnsCount + 1).fill(0);
        const shownRows = new Array(shownRowsCount || 1).fill(0);

        return (
          <div ref={ref} style={props.style}>
            {/* top left cell */}
            <HeaderComponent
              key="0:0"
              rowIndex={0}
              columnIndex={0}
              data={itemData}
              style={{
                display: 'inline-flex',
                width: columnWidth(0),
                height: rowHeight(0),
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 4,
              }}
            />

            {shownColumns.map((_, i) => {
              const columnIndex = i + shownIndicies.from.column + 1;
              const rowIndex = 0;

              const width = columnWidth(columnIndex);
              const height = rowHeight(rowIndex);

              const marginLeft =
                i === 1 ? sumColumnWidths(columnIndex - 1) : undefined;

              // header row
              return (
                <HeaderComponent
                  key={`${rowIndex}:${columnIndex}`}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  data={itemData}
                  style={{
                    marginLeft,
                    display: 'inline-flex',
                    width,
                    height,
                    position: 'sticky',
                    top: 0,
                    zIndex: 3,
                  }}
                />
              );
            })}

            {shownRows.map((_, i) => {
              const columnIndex = 0;
              const rowIndex = i + shownIndicies.from.row;
              const width = columnWidth(columnIndex);
              const height = rowHeight(rowIndex + 1);

              const marginTop = i === 1 ? sumRowsHeights(rowIndex) : undefined;

              // sticky column
              return (
                <Cell
                  key={`${rowIndex}:${columnIndex}`}
                  rowIndex={rowIndex + 1}
                  columnIndex={columnIndex}
                  data={itemData}
                  style={{
                    marginTop,
                    width,
                    height,
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                  }}
                />
              );
            })}

            {props.children.filter(child => {
              const { column, row } = getCellIndicies(child);
              return column !== 0 && row !== 0;
            })}
          </div>
        );
      }),
    [Cell, columnWidth, rowHeight]
  );
}

interface StickyGridDataProps {
  filteredData: any[];
  columnScales: Function[];
  columnNames: string[];
  filter?: FilterValue;
  focusedColumnIndex?: number;
  showFilters: boolean;
  setFocusedColumnIndex: Function;
}
interface StickyGridProps {
  height: number;
  width: number;
  rowCount: number;
  columnCount: number;
  rowHeight: Function;
  columnWidth: Function;
  columnWidths: number[];
  itemData: StickyGridDataProps;
}
const StickyGrid = function(props: StickyGridProps) {
  const ref = useRespondToColumnChange(props.columnWidths);

  return (
    <VariableSizeGrid
      {...props}
      ref={ref}
      innerElementType={useInnerElementType(
        props.children,
        props.columnWidth,
        props.rowHeight,
        props.itemData,
        props.HeaderComponent
      )}
    />
  );
};
export { StickyGrid };

function useRespondToColumnChange(columns) {
  const ref = React.useRef();

  React.useEffect(() => {
    if (ref.current) {
      ref.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true,
      });
    }
  }, [columns]);

  return ref;
}
