import tw from 'twin.macro';
import create, { StateCreator } from 'zustand';
import produce from 'immer';
import {
  format as d3Format,
  timeFormat,
  descending,
  max,
  min,
  extent,
} from 'd3';
import fromPairs from 'lodash/fromPairs';
import isEqual from 'lodash/isEqual';
import isValidDate from 'date-fns/isValid';
import parseDate from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';

import { FilterValue, FilterMap, CategoryValue } from './types';
import { matchSorter } from 'match-sorter';
import { DateCell } from './components/cells/date';
import { TimeCell } from './components/cells/time';
import { NumberCell } from './components/cells/number';
import { RawNumberCell } from './components/cells/raw-number';
import { StringCell } from './components/cells/string';
import { CategoryCell } from './components/cells/category';
import { StringFilter } from './components/filters/string';
import { CategoryFilter } from './components/filters/category';
import { RangeFilter } from './components/filters/range';

export const immer = <T extends {}>(
  config: StateCreator<T, (fn: (draft: T) => void) => void>
): StateCreator<T> => (set, get, api) =>
  config((fn) => set(produce(fn) as (state: T) => T), get, api);

export type GridState = {
  data: any[];
  rawData: any[];
  updatedData: any[] | null;
  stickyColumnName?: string;
  handleStickyColumnNameChange: (columnName: string) => void;
  columnNames: string[];
  filteredData: any[];
  diffs: object[];
  uniqueColumnName?: string;
  filters: FilterMap<FilterValue>;
  metadata: Record<string, string>;
  handleMetadataChange: (metadata: Record<string, string>) => void;
  handleFilterChange: (column: string, value: FilterValue) => void;
  handleFiltersChange: (newFilters?: FilterMap<FilterValue>) => void;
  handleDataChange: (data: any[]) => void;
  handleDiffDataChange: (data: any[]) => void;
  categoryValues: Record<string, CategoryValue[]>;
  sort: string[];
  handleSortChange: (columnName: string, direction: string) => void;
  focusedRowIndex?: number;
  handleFocusedRowIndexChange: (rowIndex?: number) => void;
  schema?: object;
  cellTypes: Record<string, string>;
  columnWidths: number[];
  updateColumnWidths: () => void;
  updateColumnNames: () => void;
  updateFilteredColumns: () => void;
  isEditable: boolean;
  handleIsEditableChange: (isEditable: boolean) => void;
  onCellChange: (rowIndex: number, columnName: string, value: any) => void;
  onRowDelete: (rowIndex: number) => void;
  onHeaderCellChange: (oldColumnName: string, newColumnName: any) => void;
  onHeaderAdd: (columnName: string) => void;
  onHeaderDelete: (columnName: string) => void;
  focusedCellPosition: [number, number] | null;
  handleFocusedCellPositionChange: (position: [number, number] | null) => void;
};

export const originalRowIndexColumnName = '__originalIndex__';
export const createGridStore = () =>
  create<GridState>(
    immer((set) => ({
      data: [],
      rawData: [],
      schema: undefined,
      cellTypes: {},
      metadata: {},
      stickyColumnName: undefined,
      columnNames: [],
      categoryValues: {},
      handleStickyColumnNameChange: (columnName) =>
        set((draft) => {
          if (!draft.columnNames.includes(columnName)) return;
          draft.stickyColumnName = columnName;
        }),
      handleDataChange: (data) =>
        set((draft) => {
          draft.rawData = data.map((d, i) => ({
            ...d,
            [originalRowIndexColumnName]: i,
          }));
          // @ts-ignore
          draft.schema = generateSchema(data);

          // @ts-ignore
          const propertyMap = draft.schema;
          const accessorsWithTypeInformation = Object.keys(propertyMap);

          draft.cellTypes = accessorsWithTypeInformation.reduce(
            (acc, accessor) => {
              // @ts-ignore
              let cellType = propertyMap[accessor];
              // @ts-ignore
              if (!cellTypeMap[cellType]) cellType = 'string';

              // @ts-ignore
              acc[accessor] = cellType;
              return acc;
            },
            {}
          );

          draft.data = parseData(draft.rawData, draft.cellTypes);

          const columnNames = data.length
            ? Object.keys(data[0]).filter((d) => !utilKeys.includes(d))
            : [];

          if (
            !draft.stickyColumnName ||
            !columnNames.includes(draft.stickyColumnName)
          ) {
            draft.stickyColumnName = columnNames[0];
          }

          if (!draft.sort.length) {
            draft.sort = draft.stickyColumnName
              ? [
                  draft.stickyColumnName,
                  // @ts-ignore
                  cellTypeMap[draft.cellTypes[draft.stickyColumnName]]
                    ?.sortValueType === 'string'
                    ? 'asc'
                    : 'desc',
                ]
              : [];
          }
        }),
      handleMetadataChange: (metadata) =>
        set((draft) => {
          draft.metadata = metadata;
        }),
      diffs: [],
      uniqueColumnName: undefined,
      handleDiffDataChange: (diffData: any[]) =>
        set((draft) => {
          if (!diffData.length) return;

          const data = draft.data;
          draft.uniqueColumnName = undefined;

          // get string column with most unique values
          const columnNames = data.length
            ? Object.keys(data[0]).filter((d) => !utilKeys.includes(d))
            : [];
          const columnNameUniques = columnNames
            .filter((columnName) => {
              const cellType = draft.cellTypes[columnName];
              // @ts-ignore
              const type = cellTypeMap[cellType]?.sortValueType;
              const isString = type === 'string';
              if (
                columnName.toLowerCase() === 'id' &&
                (isString || type === 'number')
              )
                return true;
              return isString;
            })
            .map((columnName) => {
              const values = new Set(data.map((d) => d[columnName]));
              return [columnName, values.size];
            });
          const sortedColumnsByUniqueness = columnNameUniques.sort((a, b) =>
            descending(a[1], b[1])
          );
          if (
            !sortedColumnsByUniqueness.length ||
            // there must be as many unique values as rows
            sortedColumnsByUniqueness[0][1] !== data.length
          )
            return;

          const mostUniqueId = sortedColumnsByUniqueness[0][0];
          const idColumnName = mostUniqueId;
          // @ts-ignore
          draft.uniqueColumnName = mostUniqueId;

          const diffDataMap = new Map(
            parseData(diffData, draft.cellTypes).map((d: object) => [
              // @ts-ignore
              d[idColumnName],
              d,
            ])
          );
          const newDataMap = new Map(
            data.map((i) => [i[idColumnName] + '', i])
          );

          let newData = data.map((d) => {
            const id = d[idColumnName];
            const isNew = !diffDataMap.get(id);
            if (isNew) return { ...d, __status__: 'new' };
            const modifiedFields = columnNames.filter((columnName) => {
              const type = draft.cellTypes[columnName];
              const oldValue =
                type === 'date' ? d[columnName]?.toString?.() : d[columnName];
              const newD = diffDataMap.get(id);
              const newValue =
                type === 'date'
                  ? // @ts-ignore
                    newD[columnName]?.toString?.()
                  : // @ts-ignore
                    newD[columnName];
              return type === 'object'
                ? !isEqual(oldValue, newValue)
                : oldValue !== newValue;
            });
            if (modifiedFields.length) {
              return {
                ...d,
                __status__: 'modified',
                __modifiedColumnNames__: modifiedFields,
              };
            }
            return d;
          });
          const oldData = parseData(
            diffData
              .filter(
                (d) =>
                  !newDataMap.get(d[idColumnName + '']) && d[idColumnName || '']
              )
              .map((d) => ({ ...d, __status__: 'old' })),
            draft.cellTypes
          );
          draft.data = [...newData, ...oldData];
          // draft.diffs = getDiffs(draft.data);
        }),
      focusedRowIndex: undefined,
      handleFocusedRowIndexChange: (rowIndex) =>
        set((draft) => {
          draft.focusedRowIndex = rowIndex;
        }),
      filteredData: [],
      filters: {},
      handleFilterChange: (column, value) =>
        set((draft) => {
          if (!value) {
            delete draft.filters[column];
          } else {
            draft.filters[column] = value;
          }
        }),
      handleFiltersChange: (newFilters) =>
        set((draft) => {
          draft.filters = newFilters || {};
        }),
      sort: [],
      handleSortChange: (columnName: string, direction: string) =>
        set((draft) => {
          if (columnName) {
            draft.sort = [columnName, direction];
          } else {
            draft.sort = [];
          }
        }),

      updateFilteredColumns: () =>
        set((draft) => {
          const sortFunction = getSortFunction(
            draft.sort,
            // @ts-ignore
            cellTypeMap[draft?.cellTypes[draft.sort[0]]]?.sortValueType
          );
          let filteredData = [
            ...filterData(draft.data, draft.filters, draft.cellTypes),
          ];
          filteredData = filteredData.sort(sortFunction);

          draft.filteredData = filteredData;
          draft.diffs = getDiffs(draft.filteredData);

          const categoryColumnNames = Object.keys(draft.schema || {}).filter(
            // @ts-ignore
            (columnName) => draft.schema[columnName] === 'category'
          );
          draft.categoryValues = fromPairs(
            categoryColumnNames.map((columnName) => {
              const values = new Set(draft.data.map((d) => d[columnName]));
              return [
                columnName,
                Array.from(values)
                  .filter((d) => (d || '')?.trim().length)
                  .map(
                    (value: string, index): CategoryValue => {
                      return {
                        value,
                        count: draft.filteredData.filter(
                          (d) => d[columnName] === value
                        ).length,
                        color: categoryColors[index % categoryColors.length],
                      };
                    }
                  ),
              ];
            })
          );
        }),
      columnWidths: [],
      updateColumnWidths: () =>
        set((draft) => {
          const columnWidths = draft.columnNames.map(
            (columnName: string, columnIndex: number) => {
              // @ts-ignore
              const cellType = draft.cellTypes[columnName];
              // @ts-ignore
              const cellInfo = cellTypeMap[cellType];
              if (!cellInfo) return 150;

              const values = draft.data.map(
                (d) => cellInfo.format(d[columnName] || '').length
              );
              const maxLength = max([columnName.length * 0.6, ...values]);
              const numberOfChars = min([maxLength + 3, 19]);
              return (
                Math.max(cellInfo.minWidth || 100, numberOfChars * 15) +
                (columnIndex === 0 ? 30 : 0) +
                (cellInfo.extraCellHorizontalPadding || 0)
              );
            }
          );
          draft.columnWidths = columnWidths;
        }),
      updateColumnNames: () =>
        set((draft) => {
          if (!draft.data.length) {
            draft.columnNames = [];
            draft.stickyColumnName = undefined;
            return;
          }

          const rawColumnNames = Object.keys(draft.data[0]).filter(
            (d) => !utilKeys.includes(d)
          );
          if (
            !draft.stickyColumnName ||
            !rawColumnNames.includes(draft.stickyColumnName || '')
          ) {
            draft.columnNames = rawColumnNames;
          } else {
            draft.columnNames = [
              draft.stickyColumnName || '',
              ...rawColumnNames.filter((d) => d !== draft.stickyColumnName),
            ];
          }
        }),
      isEditable: false,
      handleIsEditableChange: (isEditable: boolean) =>
        set((draft) => {
          draft.isEditable = isEditable;
        }),
      updatedData: null,
      onCellChange: (rowIndex: number, columnName: string, value: any) => {
        set((draft) => {
          const filteredRow = draft.filteredData[rowIndex] || {};
          let rowIndexInFullDataset = filteredRow[originalRowIndexColumnName];
          let newData = [...draft.rawData];
          if (
            !draft.rawData[rowIndexInFullDataset] &&
            rowIndex === draft.filteredData.length
          ) {
            rowIndexInFullDataset = newData.length;
            newData.push({
              [originalRowIndexColumnName]: rowIndexInFullDataset,
              ...draft.columnNames.reduce(
                (acc, columnName) => ({
                  ...acc,
                  [columnName]: '',
                }),
                {}
              ),
            });
          }
          if (!newData[rowIndexInFullDataset]) return;
          if (newData[rowIndexInFullDataset][columnName] === value) return;
          newData = newData.map((d) => {
            const originalRowIndex = d[originalRowIndexColumnName];
            delete d[originalRowIndexColumnName];
            if (originalRowIndex === rowIndexInFullDataset) {
              return { ...d, [columnName]: value };
            }
            return d;
          });
          draft.updatedData = newData;
        });
      },
      onRowDelete: (rowIndex: number) => {
        set((draft) => {
          const filteredRow = draft.filteredData[rowIndex];
          const rowIndexInFullDataset = filteredRow[originalRowIndexColumnName];
          if (!draft.rawData[rowIndexInFullDataset]) return;
          let newData = [...draft.rawData].map((d) => {
            delete d[originalRowIndexColumnName];
            return d;
          });
          newData.splice(rowIndexInFullDataset, 1);
          draft.updatedData = newData;
        });
      },
      onHeaderCellChange: (oldColumnName: string, newColumnName: string) => {
        set((draft) => {
          const newData = [...draft.rawData].map((row) => {
            // keep same order of keys so it matches when the data updates
            return draft.columnNames.reduce((acc, columnKey) => {
              if (columnKey === oldColumnName) {
                // @ts-ignore
                acc[newColumnName] = row[oldColumnName];
              } else if (columnKey !== originalRowIndexColumnName) {
                // @ts-ignore
                acc[columnKey] = row[columnKey];
              }
              return acc;
            }, {});
          });
          draft.updatedData = newData;
        });
      },
      onHeaderAdd: (columnName: string) => {
        set((draft) => {
          const newData = [...draft.rawData].map((row) => {
            return {
              ...row,
              [columnName]: row[columnName] || '',
            };
          });
          draft.updatedData = newData;
        });
      },
      onHeaderDelete: (columnName: string) => {
        set((draft) => {
          const newData = [...draft.rawData].map((row) => {
            // keep same order of keys so it matches when the data updates
            return draft.columnNames.reduce((acc, columnKey) => {
              if (columnKey !== columnName) {
                // @ts-ignore
                acc[columnKey] = row[columnKey];
              }
              return acc;
            }, {});
          });
          draft.updatedData = newData;
        });
      },
      focusedCellPosition: null,
      handleFocusedCellPositionChange: (position: [number, number] | null) =>
        set((draft) => {
          draft.focusedCellPosition = position;
        }),
    }))
  );

const utilKeys = [
  '__status__',
  '__modifiedColumnNames__',
  '__rowIndex__',
  '__rawData__',
  originalRowIndexColumnName,
];
function filterData(
  data: any[],
  filters: FilterMap<FilterValue>,
  cellTypes: Record<string, string>
) {
  return Object.keys(filters).reduce((rows, columnName) => {
    const filterValue = filters[columnName];

    if (typeof filterValue === 'string') {
      if (cellTypes[columnName] === 'category') {
        return rows.filter((row) => row[columnName] === filterValue);
      } else {
        return matchSorter(rows, filterValue, {
          keys: [columnName],
        });
      }
    }

    if (Array.isArray(filterValue)) {
      return rows.filter((r) => isBetween(filterValue, r[columnName]));
    }

    return rows;
  }, data);
}

const isBetween = (bounds: [number, number], value: number) => {
  return value >= bounds[0] && value <= bounds[1];
};

const getSortFunction = (sort: string[], typeOfValue: string) => {
  const [columnName, direction] = sort;

  return (a: object, b: object) => {
    // @ts-ignore
    let aVal = a[columnName];
    if (typeOfValue === 'string') {
      aVal = (aVal || '')?.toUpperCase?.() || '';
      if (!aVal || aVal === '\n') aVal = direction === 'asc' ? 'zzzzzz' : '';
      aVal = aVal.trimStart();
    }
    // @ts-ignore
    let bVal = b[columnName];
    if (typeOfValue === 'string') {
      bVal = (bVal || '')?.toUpperCase?.() || '';
      if (!bVal || bVal === '\n') bVal = direction === 'asc' ? 'zzzzzz' : '';
      bVal = bVal.trimStart();
    }

    return direction == 'desc'
      ? // @ts-ignore
        descending(aVal, bVal)
      : // @ts-ignore
        descending(bVal, aVal);
  };
};

function generateSchema(data: any[]) {
  const metrics = Object.keys(data[0] || {});

  const schema = fromPairs(
    metrics.map((metric: string) => {
      const getFirstValue = (data: any[]) =>
        data.find(
          (d) =>
            d[metric] !== undefined && d[metric] !== null && d[metric] !== ''
        ) || {};

      const value = getFirstValue(data)[metric];

      if (!value && value !== 0) return [metric, 'string'];

      const isDate = (value: any) => {
        try {
          if (typeof value === 'string') {
            const currentDate = new Date();
            return !!validDatePatterns.find((pattern) =>
              isValidDate(parseDate(value, pattern, currentDate))
            );
          } else {
            return false;
            // return isValidDate(value);
          }
        } catch (e) {
          return false;
        }
      };
      const isTime = (value: any) => {
        try {
          if (typeof value === 'string') {
            const currentDate = new Date();
            return !!validTimePatterns.find((pattern) =>
              isValidDate(parseDate(value, pattern, currentDate))
            );
          }
          return false;
        } catch (e) {
          return false;
        }
      };
      const isFirstValueADate = isDate(value);
      if (isFirstValueADate) {
        const values = data.map((d) => d[metric]).filter((d) => d);

        const areMultipleValuesDates = !values
          .slice(0, 30)
          .find((d) => !isDate(d));
        if (areMultipleValuesDates) {
          const dateRange = extent(values, (d) =>
            new Date(d).getTime()
          ) as number[];

          const oneYear = 1000 * 60 * 60 * 24 * 365;
          const type =
            dateRange[1] - dateRange[0] > oneYear ? 'date' : 'short-range-date';
          return [metric, type];
        }
      }
      const isFirstValueATime = isTime(value);
      if (isFirstValueATime) {
        const values = data
          .map((d) => d[metric])
          .filter((d) => d)
          .slice(0, 30);
        const areMultipleValuesTimes = !values.find((d) => !isTime(d));
        if (areMultipleValuesTimes) return [metric, 'time'];
      }
      const isFirstValueAnArray = Array.isArray(value);
      if (isFirstValueAnArray) {
        const values = data.map((d) => d[metric]).filter((d) => d);
        const lengthOfArrays = values.map((d) => d.length);
        const areAnyArraysLong = !!lengthOfArrays.find((d) => d > 1);
        return [
          metric,
          areAnyArraysLong || typeof value[0] !== 'string'
            ? 'array'
            : 'short-array',
        ];
      }
      const isObject = typeof value === 'object';
      if (isObject) {
        return [metric, 'object'];
      }
      const isFiniteNumber = Number.isFinite(+value);
      if (isFiniteNumber) {
        return [
          metric,
          metric.toLowerCase().trim() === 'year' ? 'year' : 'number',
        ];
      }

      // If there are few unique values for the metric,
      // consider the metric as a category
      const uniqueValues = new Set(data.map((d) => d[metric]));
      const maxUniqueValuesForCategory = Math.min(
        Math.floor(data.length / 3),
        20
      );

      return [
        metric,
        uniqueValues.size < maxUniqueValuesForCategory ? 'category' : 'string',
      ];
    })
  );
  return schema;
}

const parseData = (data: any, cellTypes: Record<string, string>) => {
  const columnParseFunctions = Object.keys(cellTypes).map((columnName) => {
    const cellType = cellTypes[columnName];
    // @ts-ignore
    const cellInfo = cellTypeMap[cellType] || {};
    const parseFunction = cellInfo.parseValueFunction || ((d: any) => d);
    return [columnName, parseFunction];
  });
  return data.map((d: any) => {
    return {
      ...d,
      ...fromPairs(
        columnParseFunctions.map(([columnName, parseFunction]) => [
          columnName,
          parseFunction(d[columnName]),
        ])
      ),
      __rawData__: d,
    };
  });
};

const validDatePatterns = [
  'MM/dd/yy',
  'MM-dd-yy',
  'dd/MM/yy',
  'dd-MM-yy',
  'MM/dd/yyyy',
  'MM-dd-yyyy',
  'dd/MM/yyyy',
  'dd-MM-yyyy',
  'yyyy-MM-dd',
  'yyyyMMdd',
];
const validTimePatterns = [
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-dd HH:mm:ss',
  "yyyy-MM-dd'T'HH:mm:ssxxxx",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ssSSxxxx",
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd'T'HH:mm:ss.SSSSX",
  "yyyy-MM-dd'T'HH:mm:ss.SSSSxxxx",
  'dd/MM/yy hh:mmaa',
  'dd/MM/yy HH:mm',
  'MM/dd/yy HH:mm',
  'MM/dd/yy hh:mmaa',
  'dd/MM/yyyy hh:mmaa',
  'dd/MM/yyyy HH:mm',
  'MM/dd/yyyy HH:mm',
  'MM/dd/yyyy hh:mmaa',
];

const parseDatetimeString = (str = '', patterns = validDatePatterns) => {
  let date = Date.parse(str);
  if (isValidDate(date)) return date;
  for (const pattern of patterns) {
    // @ts-ignore
    date = parseDate(str, pattern, new Date());
    if (isValidDate(date)) {
      return date;
    }
  }
  // @ts-ignore
  date = parseISO(str);
  if (isValidDate(date)) {
    return date;
  }
  return null;
};

const getDiffs = (data: any[]) => {
  // doing it this way for perf reasons
  // to prevent from indexing all data points
  // which gets slow with long datasets
  let diffs = [] as object[];
  data.forEach((d, i) => {
    if (d.__status__) diffs.push({ ...d, i });
  });
  return diffs;
};

export const cellTypeMap = {
  string: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    sortValueType: 'string',
  },
  object: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => JSON.stringify(d),
    shortFormat: (d: string) => JSON.stringify(d),
    parseValueFunction: (d: any[]) =>
      // prettier-ignore
      typeof d === "object" ? JSON.stringify(d, undefined, 2) :
      typeof d === 'string' ? d : '',
    sortValueType: 'string',
  },
  array: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    parseValueFunction: (d: any[]) =>
      // prettier-ignore
      Array.isArray(d) ? `[${d.length} item${d.length === 1 ? '' : 's'}]` :
      typeof d === 'string' ? d : '',
    sortValueType: 'string',
  },
  'short-array': {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    parseValueFunction: (d: [string]) => (Array.isArray(d) ? d[0] : d),
    sortValueType: 'string',
  },
  category: {
    cell: CategoryCell,
    filter: CategoryFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    parseValueFunction: (d: [string]) => d,
    sortValueType: 'string',
    extraCellHorizontalPadding: 6,
  },
  number: {
    cell: NumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: (d: number) =>
      d < 1000 && isAlmostInteger(d)
        ? d3Format(',.0f')(d)
        : d < 1
        ? d3Format('.2f')(d)
        : d3Format(',.2s')(d),
    parseValueFunction: (d: any[]) => {
      if (typeof d === 'string') {
        if (!(d as string).length) return undefined;
      } else if (d === undefined || d === null) {
        return d;
      }
      return +d;
    },
    minWidth: 126,
    hasScale: true,
    sortValueType: 'number',
  },
  year: {
    cell: RawNumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: (d: number) => d,
    parseValueFunction: (d: any[]) => +d,
    minWidth: 126,
    hasScale: true,
    sortValueType: 'number',
  },
  'short-range-date': {
    cell: DateCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d %Y'),
    shortFormat: timeFormat('%-m/%-d'),
    parseValueFunction: (str = '') =>
      parseDatetimeString(str, validDatePatterns),
    hasScale: true,
    sortValueType: 'number',
  },
  date: {
    cell: DateCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d %Y'),
    shortFormat: timeFormat('%-Y'),
    parseValueFunction: (str = '') =>
      parseDatetimeString(str, validDatePatterns),
    hasScale: true,
    sortValueType: 'number',
  },
  time: {
    cell: TimeCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d, %Y %-H:%M'),
    shortFormat: timeFormat('%-m/%-d %-H:%M'),
    parseValueFunction: (str = '') =>
      parseDatetimeString(str, validTimePatterns),
    hasScale: true,
    sortValueType: 'number',
  },
};

export const categoryColors = [
  tw`bg-gray-100 text-gray-600`,
  tw`bg-yellow-100 text-yellow-600`,
  tw`bg-indigo-100 text-indigo-600`,
  tw`bg-pink-100 text-pink-600`,
  tw`bg-blue-100 text-blue-600`,
  tw`bg-green-100 text-green-600`,
  tw`bg-purple-100 text-purple-600`,
  tw`bg-red-100 text-red-600`,
];

const isAlmostInteger = (num: number) => Math.abs(Math.round(num) - num) < 0.06;
