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
  numberOfStickiedColumns,
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
          while (index > numberOfStickiedColumns) {
            sum += columnWidth(index - 1);
            index -= 1;
          }
          return sum;
        }

        const shownIndicies = getShownIndicies(props.children);

        const shownColumnsCount =
          shownIndicies.to.column - shownIndicies.from.column + 1 ||
          itemData.columnNames.length;
        const shownRowsCount = shownIndicies.to.row - shownIndicies.from.row;

        const shownColumns = new Array(shownColumnsCount).fill(0);
        const shownRows = new Array(shownRowsCount || 1).fill(0);
        const columnWidths = [...shownColumns, 0].map(
          (_, i) => columnWidth(i + shownIndicies.from.column) || 0
        );
        const totalColumnWidths = columnWidths.reduce((a, b) => a + b, 0);

        return (
          <div
            ref={ref}
            style={{
              ...props.style,
              height: props.style.height + 60,
              minWidth: totalColumnWidths,
              background: `linear-gradient(to bottom, #E5E7EB 1px, white 1px) 0 -4px`,
              backgroundSize: `100% ${rowHeight(1)}px`,
            }}
          >
            {/* top left cell */}
            {numberOfStickiedColumns > 0 && (
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
                  zIndex: 200,
                }}
              />
            )}

            {shownColumns.map((_, i) => {
              const columnIndex =
                i + shownIndicies.from.column + numberOfStickiedColumns;
              const rowIndex = 0;

              const width = columnWidth(columnIndex);
              const height = rowHeight(rowIndex);
              const marginLeft =
                i === numberOfStickiedColumns
                  ? sumColumnWidths(columnIndex - numberOfStickiedColumns)
                  : undefined;

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
                    zIndex: 100,
                  }}
                />
              );
            })}

            {numberOfStickiedColumns > 0 &&
              shownRows.map((_, i) => {
                const columnIndex = 0;
                const rowIndex = i + shownIndicies.from.row;
                const width = columnWidth(columnIndex);
                const height = rowHeight(rowIndex + 1);

                const marginTop =
                  i === 1 ? sumRowsHeights(rowIndex) : undefined;

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
                      zIndex: 60,
                    }}
                  />
                );
              })}

            {props.children.filter(child => {
              const { column, row } = getCellIndicies(child);
              return column >= numberOfStickiedColumns && row !== 0;
            })}
          </div>
        );
      }),
    [Cell, columnWidth, rowHeight, numberOfStickiedColumns]
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
  numberOfStickiedColumns: 0 | 1;
  rowCount: number;
  columnCount: number;
  columnWidths: number[];
  rowHeight: Function;
  columnWidth: Function;
  itemData: StickyGridDataProps;
}
const StickyGrid = React.forwardRef((props: StickyGridProps, ref) => {
  return (
    <VariableSizeGrid
      {...props}
      ref={ref}
      innerElementType={useInnerElementType(
        props.children,
        props.columnWidth,
        props.rowHeight,
        props.itemData,
        props.numberOfStickiedColumns,
        props.HeaderComponent
      )}
    />
  );
});
export { StickyGrid };
