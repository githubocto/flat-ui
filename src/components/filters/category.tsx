import React from 'react';
// @ts-ignore
import { format } from 'd3';

interface CategoryFilterProps {
  value?: string;
  possibleValues: string[];
  filteredData: any[];
  onChange: (value: string) => void;
}

const formatNumber = format(',');
export function CategoryFilter(props: CategoryFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.value);
  };

  return (
    <select
      className="px-3 py-3 placeholder-gray-400 border-none text-gray-700 bg-white outline-none focus:outline-none focus:shadow-outline w-full overflow-ellipsis"
      onChange={handleChange}
      value={props?.value || ''}
    >
      <option value="">{`Filter ${formatNumber(
        props.filteredData.length
      )} records`}</option>
      {props.possibleValues &&
        props.possibleValues
          .filter(d => d)
          .map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
    </select>
  );
}
