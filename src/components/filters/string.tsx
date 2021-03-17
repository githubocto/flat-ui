import React from "react";
// @ts-ignore
import { format } from "d3";

const formatNumber = format(",")
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
      className="w-full overflow-ellipsis pl-2"
      onChange={handleChange}
      value={props?.value || ""}
      placeholder={`Filter ${formatNumber(props.filteredData.length)} records`}
    />
  );
}
