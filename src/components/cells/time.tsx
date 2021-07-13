import 'twin.macro';

// @ts-ignore
import { timeFormat } from 'd3';

interface TimeCellProps {
  value: Date;
  rawValue: string;
}

const formatTime = timeFormat('%B %-d, %Y %-H:%M');
export function TimeCell(props: TimeCellProps) {
  return (
    <span
      tw="overflow-ellipsis block whitespace-nowrap overflow-hidden"
      title={props.rawValue}
    >
      {props.value ? formatTime(props.value) : '-'}
    </span>
  );
}
