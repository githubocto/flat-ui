import React from 'react';

interface CategoryCellProps {
  value: string;
  possibleValues: string[];
}

export function CategoryCell(props: CategoryCellProps) {
  const colorIndex = props.possibleValues.indexOf(props.value);
  const colors = [
    ['bg-gray-100 text-gray-600'],
    ['bg-yellow-100 text-yellow-600'],
    ['bg-indigo-100 text-indigo-600'],
    ['bg-pink-100 text-pink-600'],
    ['bg-blue-100 text-blue-600'],
    ['bg-green-100 text-green-600'],
    ['bg-purple-100 text-purple-600'],
    ['bg-red-100 text-red-600'],
  ];
  const color = colors[colorIndex % colors.length];

  return (
    <span
      className={`overflow-ellipsis block whitespace-nowrap overflow-hidden ${color} rounded-full px-4 py-1 -ml-2 -mr-2`}
      title={props.value}
    >
      {props.value}
    </span>
  );
}
