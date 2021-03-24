import React from 'react';
import { HtmlHistogram } from '../HtmlHistogram';

interface RangeFilterProps {
  id: string;
  value?: [number, number];
  filteredData: any[];
  originalData: any[];
  focusedValue?: number;
  maxWidth?: number;
  shortFormat: (value: number) => string;
  longFormat: (value: number) => string;
  onChange: (value: string | [number, number]) => void;
}

export function RangeFilter(props: RangeFilterProps) {
  const {
    id,
    filteredData,
    originalData,
    focusedValue,
    shortFormat,
    maxWidth,
    longFormat,
    onChange,
  } = props;
  const filteredHistogramData = filteredData
    .map(row => row[id])
    .filter(Number.isFinite);

  const originalHistogramData = originalData
    .map(row => row[id])
    .filter(Number.isFinite);

  return (
    <HtmlHistogram
      id={id}
      onChange={onChange}
      value={props?.value}
      original={originalHistogramData}
      filtered={filteredHistogramData}
      focusedValue={focusedValue}
      maxWidth={maxWidth}
      shortFormat={shortFormat}
      longFormat={longFormat}
    />
  );
}
