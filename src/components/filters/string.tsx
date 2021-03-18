import React from 'react';
// @ts-ignore
import { format } from 'd3';

const formatNumber = format(',');
interface StringFilterProps {
  value?: string;
  filteredData: any[];
  onChange: (value: string) => void;
}

export function StringFilter(props: StringFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.value);
  };

  return (
    <input
      className="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white outline-none focus:outline-none focus:shadow-outline w-full overflow-ellipsis"
      onChange={handleChange}
      value={props?.value || ''}
      placeholder={`Filter ${formatNumber(props.filteredData.length)} records`}
    />
  );
}
