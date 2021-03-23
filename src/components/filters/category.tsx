// @ts-nocheck
// please forgive me! was getting a horrendous error for the map in render
import React from 'react';
// @ts-ignore
import { format } from 'd3';

interface CategoryFilterProps {
  value?: string;
  possibleValues?: string[];
  filteredData: any[];
  onChange: (value: string) => void;
}

const formatNumber = format(',');
export function CategoryFilter(props: CategoryFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChange(e.target.value);
  };

  return (
    <select
      className={`px-3 py-3 placeholder-gray-400 border-none ${
        props?.value ? 'text-indigo-500' : 'text-gray-400'
      } bg-white outline-none focus:outline-none focus:shadow-outline w-full overflow-ellipsis`}
      onChange={handleChange}
      value={props?.value || ''}
    >
      <option value="">{`Filter ${formatNumber(
        props.filteredData.length
      )} records`}</option>
      {(props.possibleValues || []).map((value: string) => {
        if (!value) return;
        return (
          <option key={value} value={value}>
            {value}
          </option>
        );
      })}
    </select>
  );
}
