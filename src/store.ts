import create, { StateCreator } from 'zustand';
import produce from 'immer';
import { format as d3Format, timeFormat, descending, ascending } from 'd3';
import fromPairs from 'lodash.frompairs';
import isValid from 'date-fns/isValid';

import { FilterValue } from './types';
import { matchSorter } from 'match-sorter';
import { DateCell } from './components/cells/date';
import { NumberCell } from './components/cells/number';
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
  // focusedRowIndex?: number;
  filters: FilterMap<FilterValue>;
  metadata: Record<string, string>;
  handleMetadataChange: (metadata: Record<string, string>) => void;
  handleFilterChange: (column: string, value: FilterValue) => void;
  handleDataChange: (data: any[]) => void;
  handleDiffDataChange: (data: any[]) => void;
  // columnWidths: number[];
  // showFilters: boolean;
  categoryValues: Record<string, []>;
  sort: string[];
  handleSortChange: (columnName: string, direction: string) => void;
  focusedRowIndex?: number;
  handleFocusedRowIndexChange: (rowIndex?: number) => void;
  schema?: object;
  cellTypes: Record<string, string>;
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
        const columnNames = data.length ? Object.keys(data[0]) : [];
        draft.stickyColumnName = columnNames[0];
        draft.sort = columnNames[0] ? [columnNames[0], 'desc'] : [];

        draft.categoryValues = fromPairs(
          categoryColumnNames.map(columnName => {
            const values = new Set(draft.data.map(d => d[columnName]));
            return [columnName, Array.from(values)].filter(d => d);
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
        const columnNames = data.length ? Object.keys(data[0]) : [];
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
    sort: [],
    handleSortChange: (columnName: string, direction: string) =>
      set(draft => {
        if (columnName) {
          draft.sort = [columnName, direction];
        } else {
          draft.sort = [];
        }
      }),
  }))
);

useGridStore.subscribe(
  (draft: GridState) => {
    const sortFunction = getSortFunction(draft.sort);
    draft.filteredData = [...filterData(draft.data, draft.filters)]
      .sort(sortFunction)
      .map((d, i) => ({ ...d, __rowIndex__: i }));
    draft.diffs = draft.filteredData.filter(d => !!d.__status__);
  }
  // (state: GridState) => [state.data, state.filters, state.sort]
);
useGridStore.subscribe(
  (draft: GridState) => {
    if (!draft.data.length) {
      draft.columnNames = [];
      draft.stickyColumnName = undefined;
      return;
    }

    const rawColumnNames = Object.keys(draft.data[0]);
    if (!draft.stickyColumnName) {
      draft.columnNames = rawColumnNames;
    } else {
      draft.columnNames = [
        draft.stickyColumnName,
        ...rawColumnNames.filter(d => d !== draft.stickyColumnName),
      ];
    }
  }
  // https://github.com/pmndrs/zustand
  // (state: GridState) => [state.data]
);

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

const getSortFunction = (sort: string[]) => (a: object, b: object) => {
  const [columnName, direction] = sort;
  return direction == 'desc'
    ? // @ts-ignore
      descending(a[columnName], b[columnName])
    : // @ts-ignore
      ascending(a[columnName], b[columnName]);
};

function generateSchema(data: any[]) {
  const metrics = Object.keys(data[0]);

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
            return isValid(new Date(value));
          } else {
            return false;
            // return isValid(value);
          }
        } catch (e) {
          return false;
        }
      };
      const isFirstValueADate = isDate(value);
      if (isFirstValueADate) {
        const values = data
          .map(d => d[metric])
          .filter(d => d)
          .slice(0, 10);
        const areMultipleValuesDates =
          values.filter(isDate).length == values.length;
        if (areMultipleValuesDates) return [metric, 'date'];
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

      return [metric, type];
    })
  );
  return schema;
}

export const cellTypeMap = {
  string: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
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
  },
  'short-array': {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    parseValueFunction: (d: [string]) => (Array.isArray(d) ? d[0] : d),
  },
  category: {
    cell: CategoryCell,
    filter: CategoryFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
    parseValueFunction: (d: [string]) => d,
  },
  number: {
    cell: NumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: d3Format(',.2s'),
    minWidth: 126,
    hasScale: true,
  },
  integer: {
    cell: NumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: d3Format(',.2s'),
    hasScale: true,
  },
  date: {
    cell: DateCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d %Y'),
    shortFormat: timeFormat('%-m/%-d'),
    parseValueFunction: Date.parse,
    hasScale: true,
  },
};

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
    };
  });
};
