import 'twin.macro';

interface NumberCellProps {
  value: Number;
  rawValue: string;
}

export function NumberCell(props: NumberCellProps) {
  return (
    <div tw="truncate text-right font-mono text-sm block w-full" title={props.rawValue}>
      {
        Number.isFinite(props.value) ? props.value.toLocaleString()
          : !props.rawValue ? ""
            : '—'
      }
    </div>
  );
}
