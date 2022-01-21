import 'twin.macro';
import DOMPurify from 'dompurify';

interface StringCellProps {
  value: string;
  formattedValue: string;
  rawValue: string;
}

export function StringCell(props: StringCellProps) {
  return (
    <div
      tw="truncate"
      title={props.rawValue}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(props.formattedValue),
      }}
    />
  );
}
