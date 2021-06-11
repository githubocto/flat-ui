import React from 'react';
import DOMPurify from 'dompurify';

interface StringCellProps {
  value: string;
  formattedValue: string;
  rawValue: string;
}

export function StringCell(props: StringCellProps) {
  return (
    <span
      className="overflow-ellipsis block whitespace-nowrap overflow-hidden"
      title={props.rawValue}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(props.formattedValue),
      }}
    />
  );
}
