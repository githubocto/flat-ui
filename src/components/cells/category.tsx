import React from 'react';

interface CategoryCellProps {
  value: string;
  categoryColor: string;
}

export function CategoryCell(props: CategoryCellProps) {
  return (
    <span
      className={`overflow-ellipsis block whitespace-nowrap overflow-hidden ${props.categoryColor ||
        ''} rounded-full px-4 py-1 -ml-2 -mr-2`}
      title={props.value}
    >
      {props.value}
    </span>
  );
}
