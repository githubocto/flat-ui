import create, { StateCreator } from 'zustand';
import produce from 'immer';
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
  TargetLanguage,
} from 'quicktype-core';
import { format as d3Format, timeFormat } from 'd3';

import { FilterValue } from './types';
import { matchSorter } from 'match-sorter';
import { DateCell } from './components/cells/date';
import { NumberCell } from './components/cells/number';
import { StringCell } from './components/cells/string';
import { StringFilter } from './components/filters/string';
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
  // focusedRowIndex?: number;
  filters: FilterMap<FilterValue>;
  handleFilterChange: (column: string, value: FilterValue) => void;
  handleDataChange: (data: any[]) => void;
  // columnWidths: number[];
  // showFilters: boolean;
  sort: string[];
  handleSortChange: (columnName: string, direction: string) => void;
  focusedRowIndex?: number;
  handleFocusedRowIndexChange: (rowIndex?: number) => void;
  schema: object;
  cellTypes: Record<string, string>;
};

export const useGridStore = create<GridState>(
  immer(set => ({
    data: [],
    schema: {},
    cellTypes: {},
    stickyColumnName: undefined,
    columnNames: [],
    handleStickyColumnNameChange: columnName =>
      set(draft => {
        draft.stickyColumnName = columnName;
      }),
    handleDataChange: data =>
      set(async draft => {
        draft.schema = {};

        const schema = await quicktypeJSON('schema', '', JSON.stringify(data));
        console.log(schema);

        // @ts-ignore
        const propertyMap = schema.definitions['Element'].properties;
        const accessorsWithTypeInformation = Object.keys(propertyMap);

        draft.cellTypes = accessorsWithTypeInformation.reduce(
          (acc, accessor) => {
            // @ts-ignore
            const entry = propertyMap[accessor];
            let cellType = entry.format ? entry.format : entry.type;
            // @ts-ignore
            if (!cellTypeMap[cellType]) cellType = 'string';

            // @ts-ignore
            acc[accessor] = cellType;
            return acc;
          },
          {}
        );

        draft.data = data;
        const columnNames = data.length ? Object.keys(data[0]) : [];
        draft.sort = columnNames[0] ? [columnNames[0], 'desc'] : [];
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
    draft.filteredData = [...filterData(draft.data, draft.filters)].sort(
      sortFunction
    );
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
  if (!a || !b || !columnName) return 0;
  // @ts-ignore
  const getValue = (d, sign) =>
    !d[columnName] && !Number.isFinite(d[columnName])
      ? Infinity * sign
      : d[columnName];
  // @ts-ignore
  const aValue = getValue(a, direction == 'desc' ? -1 : 1);
  // @ts-ignore
  const bValue = getValue(b, direction == 'desc' ? -1 : 1);

  return (aValue - bValue) * (direction == 'desc' ? -1 : 1);
};

async function quicktypeJSON(
  targetLanguage: string,
  typeName: string,
  jsonString: string
) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage);

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const res = await quicktype({
    inputData,
    lang: targetLanguage,
  });

  return JSON.parse(res.lines.join(''));
}

export const cellTypeMap = {
  string: {
    cell: StringCell,
    filter: StringFilter,
    format: (d: string) => d,
    shortFormat: (d: string) => d,
  },
  number: {
    cell: NumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: d3Format(',.2s'),
    minWidth: 126,
  },
  integer: {
    cell: NumberCell,
    filter: RangeFilter,
    format: (d: number) => d + '',
    shortFormat: d3Format(',.2s'),
  },
  date: {
    cell: DateCell,
    filter: RangeFilter,
    format: timeFormat('%B %-d %Y'),
    shortFormat: timeFormat('%-m/%-d'),
  },
};
