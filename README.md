# flat-ui

Welcome friends! **flat-ui** is a React component that will render your flat dataset (an array of objects) in a table view:

![screenshot](https://github.com/githubocto/flat-ui/raw/main/screenshot.png)

It will...

- auto-detect types
- show a distribution of each quantitative column
- calculate a diff between the main dataset and a `diffData` dataset
- give more information about a hovered row & column
- allow the user to...
  - filter each column
  - sort by any column
  - sticky any column to the left
  - download the filtered & sorted data (csv or json)
  - cycle through the diffs, scrolling to each changed row

## Usage

Install using npm or yarn:

```bash
yarn add @githubocto/flat-ui
```

Basic usage:

```javascript
import { Grid } from '@githubocto/flat-ui';

const MyComponent = () => {
  const data = [{ column1: 123 }, { column1: 234 }];

  return <Grid data={data} />;
};
```

## Props

### data

`array`

Your dataset, formatted as an array of objects, where each object is a row in the table.

## Optional props

### diffData

`array`

A modified version of your main dataset, formatted as an array of objects, where each object is a row in the table. The table will show "differences" between this dataset and the main dataset:

- added lines
- removed lines
- modified cells

### metadata

`object`

column names as keys and descriptions as values.

### canDownload

`boolean`

Whether or not the table provides "download csv" and "download json" buttons.

### downloadFilename

`string`

The name of the downloaded CSV or JSON file (without extension).

### defaultFilters

`object`

column names as keys, with filter values as values:

- `string` for text columns
- `array of numbers` for quantitative columns (numbers or dates)

The user can interact with the table and update the filters, but the table will use the default filters when `defaultFilters` or `data` changes.

### defaultSort

`array`

The name of the column and the order you want the table to initialize sorting by (e.g. `["Location", "desc"]`). The user can interact with the table and update the sort, but the table will use the default sort when `defaultSort` or `data` changes.

### defaultStickyColumnName

`string`

The name of the column you want the table to initialize stickied to the left. The user can interact with the table and update the sticky column, but the table will use the default sticky column when `defaultStickyColumnName` or `data` changes.

### onChange

`function`

A callback function whose first parameter is the grid state:

```javascript
{
  stickyColumnName: "",
  columnNames: ["", ""],
  filteredData: [{}, {}],
  diffs: [{}, {}], // where __status__ is "new"|"old"|"modified"
  filters: {},
  sort: ["column name", "asc" or "desc"],
  schema: {}, // column names : array|short-array|category|number|date
}
```

### isEditable

`boolean`

Whether or not to allow the user to edit the table.

### onEdit

`(newData: any[]) => void`

A callback when the user edits the data with the updated dataset. This is intended to be used as a controlled component, where the parent component handles data changes.

## Developing locally

To get the example up & running:

```bash
yarn
yarn start
```

and also start the **example** server:

```bash
cd example
yarn
yarn start
```
