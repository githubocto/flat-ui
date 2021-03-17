import React from "react";
import { Filter } from "../../types";
// import { Histogram } from "../Histogram";
import { HtmlHistogram } from "../HtmlHistogram";

interface RangeFilterProps {
  id: string;
  value?: [number, number];
  filteredData: any[];
  originalData: any[];
  focusedValue?: number;
  shortFormat: (value: number) => string;
  onChange: (value: string | [number, number]) => void;
}

export function RangeFilter(props: RangeFilterProps) {
  const {
    id,
    filteredData,
    originalData,
    focusedValue,
    shortFormat,
    onChange,
  } = props;
  const filteredHistogramData = filteredData
    .map((row) => row[id])
    .filter(Number);

  const originalHistogramData = originalData
    .map((row) => row[id])
    .filter(Number);

  return (
    <HtmlHistogram
      id={id}
      onChange={onChange}
      value={props?.value}
      original={originalHistogramData}
      filtered={filteredHistogramData}
      focusedValue={focusedValue}
      shortFormat={shortFormat}
    />
  );
}
