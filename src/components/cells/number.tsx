import 'twin.macro';

interface NumberCellProps {
  value: Number;
  rawValue: string;
}

export function NumberCell(props: NumberCellProps) {
  return (
    <span tw="text-right font-mono text-sm block w-full" title={props.rawValue}>
      {Number.isFinite(props.value) ? props.value.toLocaleString() : '—'}
    </span>
  );
}
