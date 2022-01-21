import { Fragment } from 'react';
import DOMPurify from 'dompurify';
import 'twin.macro';

interface ColorCellProps {
  value: string;
  formattedValue: string;
  rawValue: string;
}

export function ColorCell(props: ColorCellProps) {
  return (
    <Fragment>
      <div tw="absolute top-0 bottom-0 left-0 w-[0.9em]" style={{
        background: props.value,
      }} />
      <div
        tw="truncate"
        title={props.rawValue}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(props.formattedValue),
        }}
      />
    </Fragment>
  );
}
