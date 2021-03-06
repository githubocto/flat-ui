import 'twin.macro';
// @ts-ignore
import { timeFormat } from 'd3';

interface DateCellProps {
  value: Date;
  rawValue: string;
}

const formatDate = timeFormat('%B %-d, %Y');
export function DateCell(props: DateCellProps) {
  return (
    <span
      tw="overflow-ellipsis block whitespace-nowrap overflow-hidden"
      title={props.rawValue}
    >
      {props.value ? formatDate(props.value) : ''}
    </span>
  );
}
