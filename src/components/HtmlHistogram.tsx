// @ts-nocheck
import React, { useMemo } from "react";
import { bin } from "d3-array";
import { min, max, extent, scaleLinear } from "d3";
import { getTrackBackground, Range } from "react-range";
import cc from "classcat";

interface HistogramProps {
  shortFormat: (value: number) => string;
  filtered: number[];
  original: number[];
  id: string;
  focusedValue?: number;
  onChange: (value: [number, number]) => void;
  value?: [number, number];
}

export function HtmlHistogram(props: HistogramProps) {
  const {
    filtered,
    original,
    value,
    focusedValue,
    shortFormat,
    onChange,
  } = props;
  const height = 30;

  const bins = bin().thresholds(11)(original);

  const filteredBins = bins.map((bin) => {
    let newBin = filtered.filter((d) => d >= bin.x0 && d < bin.x1);
    return newBin;
  });

  const xScaleDomain = [min(bins, (d) => d.x0), max(bins, (d) => d.x1)];
  const xScale = scaleLinear().domain(xScaleDomain).range([0, 100]);

  const yScale = scaleLinear()
    .domain(extent(bins, (d) => d.length))
    .range([0, 100]);

  const rangeValues = value ? [xScale(value[0]), xScale(value[1])] : [0, 100];

  const focusedBinIndex =
    focusedValue &&
    bins.findIndex((d) => d.x0 <= focusedValue && d.x1 >= focusedValue);

  const valueExtent = extent(original);
  const isOneValue = valueExtent[0] === valueExtent[1];

  // const focusedBin = bins[focusedBinIndex];

  const barWidth = 4;
  const barSpacing = 2;
  const totalBarWidth = barWidth + barSpacing;

  const stepSize =
    bins.length > 1 ? xScale(bins[1].x1) - xScale(bins[0].x1) : 100;

  const isFiltered = rangeValues[0] !== 0 || rangeValues[1] !== 100;

  return (
    <div
      className="html-histogram flex-col align-center justify-center mt-1 self-center"
      style={{
        width: "fit-content",
      }}
    >
      {bins.length > 1 && (
        <>
          <div
            className="flex items-end relative"
            style={{
              height,
              width: "fit-content",
            }}
          >
            {bins.map((bin, i) => {
              const height = yScale(bin.length);
              const filteredHeight = yScale(filteredBins[i].length);

              return (
                <div
                  key={i}
                  className="h-full flex-shrink-0 relative"
                  style={{ width: barWidth, marginRight: barSpacing }}
                >
                  {focusedBinIndex == i && (
                    <div
                      className="absolute inset-0 bg-indigo-100"
                      style={{ top: -3, left: -1, right: -1 }}
                    />
                  )}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gray-200"
                    style={{
                      height: `${height}%`,
                    }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 ease-out transition-all"
                    style={{
                      height: `${filteredHeight}%`,
                    }}
                  ></div>
                </div>
              );
            })}

            {/* {focusedBin && (
          <div
            className="w-1 h-1 rounded-full absolute top-0 left-0 bg-red-400 mx-auto inline-block"
            style={{
              transform: `translateX(${focusedBinIndex * totalBarWidth}px)`,
            }}
          ></div>
        )} */}
          </div>

          <div
            className="mt-1 mb-3"
            style={{ width: filteredBins.length * totalBarWidth }}
          >
            <Range
              min={0}
              max={100}
              step={stepSize}
              values={rangeValues}
              draggableTrack
              onChange={(newRange) => {
                const x0 = xScale.invert(newRange[0]);
                const x1 = xScale.invert(newRange[1]);
                onChange([x0, x1]);
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className={`flex rounded-sm html-histogram__range--${
                    isFiltered ? "filtered" : "base"
                  }`}
                  style={{
                    ...props.style,
                    height: 3,
                    background: getTrackBackground({
                      min: 0,
                      max: 100,
                      values: rangeValues,
                      // colors: ["pink", "transparent", "pink"],
                      colors: isFiltered
                        ? ["#E5E7EB", "#6366F1", "#E5E7EB"]
                        : ["#E5E7EB", "#A5B4FBff", "#E5E7EB"],
                    }),
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props, isDragged }) => {
                const thumbClass = cc([
                  "html-histogram__thumb rounded-sm text-indigo-400 focus:outline-none focus:ring transition ease-out flex align-center justify-center",
                  {
                    ring: isDragged,
                  },
                ]);
                return (
                  <div
                    {...props}
                    className={thumbClass}
                    style={{
                      ...props.style,
                      bottom: -12,
                      height: 7,
                      width: 10,
                    }}
                  >
                    <svg
                      viewBox="0 0 1 1"
                      className="h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <path d="M 0 1 L 0.5 0 L 1 1 Z" fill="currentColor" />
                    </svg>
                  </div>
                );
              }}
            />
          </div>
        </>
      )}

      <div
        className={`html-histogram__numbers flex justify-between tabular-nums text-xs text-gray-400 html-histogram__numbers--${
          isFiltered ? "filtered" : "base"
        }`}
        style={{ margin: "0 -5px -9px" }}
      >
        <div className={cc({ "text-indigo-500": rangeValues[0] != 0 })}>
          {shortFormat(xScale.invert(rangeValues[0]))}
        </div>
        {!isOneValue && (
          <div className={cc({ "text-indigo-500": rangeValues[1] != 100 })}>
            {shortFormat(xScale.invert(rangeValues[1]))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HtmlHistogram;
