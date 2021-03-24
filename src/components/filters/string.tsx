import React from 'react';
// @ts-ignore
import { format } from 'd3';
import { debounce } from 'lodash';

const formatNumber = format(',');
interface StringFilterProps {
  value?: string;
  filteredData: any[];
  onChange: (value: string) => void;
}

export function StringFilter(props: StringFilterProps) {
  const [localValue, setLocalValue] = React.useState<string>(props.value || '');
  const currentValue = React.useRef<string>('');

  const updateValue = React.useCallback(
    debounce(() => {
      props.onChange(currentValue.current);
    }, 400),
    []
  );
  React.useEffect(() => {
    updateValue();
    currentValue.current = localValue;
  }, [localValue]);

  React.useEffect(() => {
    setLocalValue(props.value || '');
  }, [props.value]);

  return (
    <input
      className="px-3 py-3 text-indigo-500 placeholder-gray-400 bg-white outline-none focus:outline-none focus:shadow-outline w-full overflow-ellipsis"
      onChange={e => setLocalValue(e.target.value)}
      value={localValue || ''}
      placeholder={`Filter ${formatNumber(props.filteredData.length)} records`}
    />
  );
}
