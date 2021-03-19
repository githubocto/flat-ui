import React from 'react';

interface CategoryCellProps {
  value: string;
  possibleValues: string[];
}

export function CategoryCell(props: CategoryCellProps) {
  const colorIndex = props.possibleValues.indexOf(props.value);
  const colors = [
    'gray',
    'yellow',
    'indigo',
    'pink',
    'blue',
    'green',
    'purple',
    'red',
  ];
  const color = colors[colorIndex % colors.length];

  return (
    <span
      className={`overflow-ellipsis block whitespace-nowrap overflow-hidden bg-${color}-100 text-${color}-600 rounded-full px-4 py-1 -ml-2 -mr-2`}
      title={props.value}
    >
      {props.value}
    </span>
  );
}
