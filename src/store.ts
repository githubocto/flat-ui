import create, { StateCreator } from 'zustand';
import produce from 'immer';
import { format as d3Format, timeFormat, descending } from 'd3';
import fromPairs from 'lodash.frompairs';
import isValidDate from 'date-fns/isValid';
import parseDate from 'date-fns/parse';

import { FilterValue } from './types';
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

export type FilterMap<T> = Record<string, T>;

export const immer = <T extends {}>(
  config: StateCreator<T, (fn: (draft: T) => void) => void>
): StateCreator<T> => (set, get, api) =>
  config(fn => set(produce(fn) as (state: T) => T), get, api);

type GridState = {
  data: any[];
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
  categoryValues: Record<string, string | number[]>;
  sort: string[];
  handleSortChange: (columnName: string, direction: string) => void;
  focusedRowIndex?: number;
  handleFocusedRowIndexChange: (rowIndex?: number) => void;
  schema?: object;
  cellTypes: Record<string, string>;
  updateColumnNames: () => void;
  updateFilteredColumns: () => void;
};

export const useGridStore = create<GridState>(
  immer(set => ({
    data: [],
    schema: undefined,
    cellTypes: {},
    metadata: {},
    stickyColumnName: undefined,
    columnNames: [],
    categoryValues: {},
    handleStickyColumnNameChange: columnName =>
      set(draft => {
        draft.stickyColumnName = columnName;
      }),
    handleDataChange: data =>
      set(draft => {
        // @ts-ignore
        draft.schema = generateSchema(data);
        const categoryColumnNames = Object.keys(draft.schema).filter(
          // @ts-ignore
          columnName => draft.schema[columnName] === 'category'
        );

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

        draft.data = parseData(data, draft.cellTypes);

        const columnNames = data.length
          ? Object.keys(data[0]).filter(d => !utilKeys.includes(d))
          : [];
        draft.stickyColumnName = columnNames[0];
        draft.sort = columnNames[0]
          ? [
              columnNames[0],
              // @ts-ignore
              cellTypeMap[draft.cellTypes[columnNames[0]]]?.sortValueType ===
              'string'
                ? 'asc'
                : 'desc',
            ]
          : [];

        draft.categoryValues = fromPairs(
          categoryColumnNames.map(columnName => {
            const values = new Set(draft.data.map(d => d[columnName]));
            return [
              columnName,
              Array.from(values).filter(d => (d || '').trim().length),
            ];
          })
        );
      }),
    handleMetadataChange: metadata =>
      set(draft => {
        draft.metadata = metadata;
      }),
    diffs: [],
    uniqueColumnName: undefined,
    handleDiffDataChange: (diffData: any[]) =>
      set(draft => {
        if (!diffData.length) return;

        const data = draft.data;
        draft.uniqueColumnName = undefined;

        // get string column with most unique values
        const columnNames = data.length
          ? Object.keys(data[0]).filter(d => !utilKeys.includes(d))
          : [];
        const columnNameUniques = columnNames
          .filter(columnName => typeof draft.cellTypes[columnName] === 'string')
          .map(columnName => {
            const values = new Set(data.map(d => d[columnName]));
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
        const newDataMap = new Map(data.map(i => [i[idColumnName], i]));

        let newData = data.map(d => {
          const id = d[idColumnName];
          const isNew = !diffDataMap.get(id);
          if (isNew) return { ...d, __status__: 'new' };
          const modifiedFields = columnNames.filter(columnName => {
            const type = draft.cellTypes[columnName];
            const oldValue =
              type === 'date' ? d[columnName].toString() : d[columnName];
            const newD = diffDataMap.get(id);
            const newValue =
              // @ts-ignore
              type === 'date' ? newD[columnName].toString() : newD[columnName];
            return oldValue !== newValue;
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
            .filter(d => !newDataMap.get(d[idColumnName]))
            .map(d => ({ ...d, __status__: 'old' })),
          draft.cellTypes
        );
        draft.data = [...newData, ...oldData];
        draft.diffs = draft.data.filter(d => !!d.__status__);
      }),
    focusedRowIndex: undefined,
    handleFocusedRowIndexChange: rowIndex =>
      set(draft => {
        draft.focusedRowIndex = rowIndex;
      }),
    filteredData: [],
    filters: {},
    handleFilterChange: (column, value) =>
      set(draft => {
        if (!value) {
          delete draft.filters[column];
        } else {
          draft.filters[column] = value;
        }
      }),
    handleFiltersChange: newFilters =>
      set(draft => {
        draft.filters = newFilters || {};
      }),
    sort: [],
    handleSortChange: (columnName: string, direction: string) =>
      set(draft => {
        if (columnName) {
          draft.sort = [columnName, direction];
        } else {
          draft.sort = [];
        }
      }),

    updateFilteredColumns: () =>
      set(draft => {
        const sortFunction = getSortFunction(
          draft.sort,
          // @ts-ignore
          cellTypeMap[draft?.cellTypes[draft.sort[0]]]?.sortValueType
        );
        draft.filteredData = [...filterData(draft.data, draft.filters)]
          .sort(sortFunction)
          .map((d, i) => ({ ...d, __rowIndex__: i }));
        draft.diffs = draft.filteredData.filter(d => !!d.__status__);
      }),
    updateColumnNames: () =>
      set(draft => {
        if (!draft.data.length) {
          draft.columnNames = [];
          draft.stickyColumnName = undefined;
          return;
        }

        const rawColumnNames = Object.keys(draft.data[0]).filter(
          d => !utilKeys.includes(d)
        );
        if (!draft.stickyColumnName) {
          draft.columnNames = rawColumnNames;
        } else {
          draft.columnNames = [
            draft.stickyColumnName,
            ...rawColumnNames.filter(d => d !== draft.stickyColumnName),
          ];
        }
      }),
  }))
);

const utilKeys = [
  '__status__',
  '__modifiedColumnNames__',
  '__rowIndex__',
  '__rawData__',
];
function filterData(data: any[], filters: FilterMap<FilterValue>) {
  return Object.keys(filters).reduce((rows, columnName) => {
    const filterValue = filters[columnName];

    if (typeof filterValue === 'string') {
      return matchSorter(rows, filterValue, {
        keys: [columnName],
      });
    }

    if (Array.isArray(filterValue)) {
      return rows.filter(r => isBetween(filterValue, r[columnName]));
    }

    return rows;
  }, data);
}

const isBetween = (bounds: [number, number], value: number) => {
  return value >= bounds[0] && value < bounds[1];
};

const getSortFunction = (sort: string[], typeOfValue: string) => {
  const [columnName, direction] = sort;

  return (a: object, b: object) => {
    // @ts-ignore
    let aVal = a[columnName];
    if (typeOfValue === 'string') {
      aVal = (aVal || '').toUpperCase();
      if (!aVal || aVal === '\n') aVal = direction === 'asc' ? 'zzzzzz' : '';
      aVal = aVal.trimStart();
    }
    // @ts-ignore
    let bVal = b[columnName];
    if (typeOfValue === 'string') {
      bVal = (bVal || '').toUpperCase();
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
          d => d[metric] !== undefined && d[metric] !== null && d[metric] !== ''
        );

      const value = getFirstValue(data)[metric];

      if (!value && value !== 0) return [metric, 'string'];

      const isDate = (value: any) => {
        try {
          if (typeof value === 'string') {
            const currentDate = new Date();
            const validPatterns = [
              'MM/dd/yyyy',
              'MM-dd-yyyy',
              'dd/MM/yyyy',
              'dd-MM-yyyy',
              'yyyy-MM-dd',
            ];
            return !!validPatterns.find(pattern =>
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
            const validPatterns = [
              'yyyy-MM-dd HH:mm',
              'yyyy-MM-dd HH:mm:ss',
              "yyyy-MM-dd'T'HH:mm:ssxxxx",
              "yyyy-MM-dd'T'HH:mm:ss",
            ];
            return !!validPatterns.find(pattern =>
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
        const values = data
          .map(d => d[metric])
          .filter(d => d)
          .slice(0, 30);
        const areMultipleValuesDates = !values.find(d => !isDate(d));
        if (areMultipleValuesDates) return [metric, 'date'];
      }
      const isFirstValueATime = isTime(value);
      if (isFirstValueATime) {
        const values = data
          .map(d => d[metric])
          .filter(d => d)
          .slice(0, 30);
        const areMultipleValuesTimes = !values.find(d => !isTime(d));
        if (areMultipleValuesTimes) return [metric, 'time'];
      }
      const isFirstValueAnArray = Array.isArray(value);
      if (isFirstValueAnArray) {
        const values = data.map(d => d[metric]).filter(d => d);
        const lengthOfArrays = values.map(d => d.length);
        const areAnyArraysLong = !!lengthOfArrays.find(d => d > 1);
        return [
          metric,
          areAnyArraysLong || typeof value[0] !== 'string'
            ? 'array'
            : 'short-array',
        ];
      }
      let type = Number.isFinite(+value) ? 'number' : 'string';
      if (type === 'string') {
        const uniqueValues = new Set(data.map(d => d[metric]));
        const maxUniqueValuesForCategory = Math.min(
          Math.floor(data.length / 3),
          20
        );
        if (uniqueValues.size < maxUniqueValuesForCategory) type = 'category';
      }

      if (type === 'number' && metric.toLowerCase().trim() === 'year')
        return [metric, 'year'];

      return [metric, type];
    })
  );
  return schema;
}

const parseData = (data: any, cellTypes: Record<string, string>) => {
  const columnParseFunctions = Object.keys(cellTypes).map(columnName => {
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

export const cellTypeMap = {
  string: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
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
    shortFormat: d3Format(',.2s'),
    parseValueFunction: (d: any[]) => +d,
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
  date: {
    cell: DateCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d %Y'),
    shortFormat: timeFormat('%-m/%-d'),
    parseValueFunction: Date.parse,
    hasScale: true,
    sortValueType: 'number',
  },
  time: {
    cell: TimeCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d, %Y %-H:%M'),
    shortFormat: timeFormat('%-m/%-d %-H:%M'),
    parseValueFunction: Date.parse,
    hasScale: true,
    sortValueType: 'number',
  },
};
