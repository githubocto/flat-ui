import React from "react";
// @ts-ignore
import { timeFormat } from "d3";

interface DateCellProps {
  value: Date;
}

const formatDate = timeFormat("%B %-d %Y");
export function DateCell(props: DateCellProps) {
  return (
    <span className="overflow-ellipsis block whitespace-nowrap overflow-hidden">
      {props.value ? formatDate(props.value) : "-"}
    </span>
  );
}
