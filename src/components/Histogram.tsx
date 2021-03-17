// @ts-nocheck
import React, { useMemo } from "react";
import { Bar } from "@vx/shape";
import { Group } from "@vx/group";
import { GradientTealBlue } from "@vx/gradient";
import { scaleBand, scaleLinear } from "@vx/scale";
import { bin } from "d3-array";

interface HistogramProps {
  data: number[];
  id: string;
}
export function Histogram(props: HistogramProps) {
  const { data } = props;

  const verticalMargin = 10;
  const width = 100;
  const height = 60;
  const xMax = width;
  const yMax = height - verticalMargin;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);

  const domain = [minVal, maxVal];

  const binInstance = bin();
  const bins = binInstance(data);

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xMax],
        round: true,
        // TODO: replace with d3-extent
        domain: [minVal, maxVal],
        padding: 0,
      }),
    [xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        // Top left corner!!!!
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...bins.map((b) => b.length))],
      }),
    [yMax]
  );

  return (
    <svg width={width} height={height}>
      <Group>
        {bins.map((bin, index) => {
          const x = xScale(bin.x0);
          const y = yScale(bin.length);
          const width = xScale(bin.x1) - x;
          const height = yMax - y;

          return (
            <Bar
              key={`bar-${index}`}
              fill="red"
              x={x}
              y={y}
              width={width}
              height={height}
            />
          );
        })}
      </Group>
    </svg>
  );
}
