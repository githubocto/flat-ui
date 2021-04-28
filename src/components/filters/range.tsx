import React from 'react';
import debounce from 'lodash/debounce';
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
  onChange: (newState: [number, number] | undefined) => void;
}

export function RangeFilter(props: RangeFilterProps) {
  const {
    id,
    value,
    filteredData,
    originalData,
    focusedValue,
    shortFormat,
    maxWidth,
    longFormat,
    onChange,
  } = props;

  const [localValue, setLocalValue] = React.useState<
    [number, number] | undefined
  >(value);
  const currentValue = React.useRef<[number, number] | undefined>();

  const updateValue = React.useCallback(
    debounce(() => {
      onChange(currentValue.current);
    }, 400),
    []
  );
  React.useEffect(() => {
    updateValue();
    currentValue.current = localValue;
  }, [localValue]);

  React.useEffect(() => {
    setLocalValue(value);
  }, [props.value]);

  const filteredHistogramData = filteredData
    .map(row => row[id])
    .filter(Number.isFinite);

  const originalHistogramData = originalData
    .map(row => row[id])
    .filter(Number.isFinite);

  return (
    <HtmlHistogram
      id={id}
      onChange={setLocalValue}
      value={localValue}
      original={originalHistogramData}
      filtered={filteredHistogramData}
      focusedValue={focusedValue}
      maxWidth={maxWidth}
      shortFormat={shortFormat}
      longFormat={longFormat}
    />
  );
}
