// @ts-nocheck
import React, { memo, useMemo } from 'react';
import tw from 'twin.macro';
import { ascending, bin, min, max, extent, scaleLinear } from 'd3';
import { getTrackBackground, Range } from 'react-range';

interface HistogramProps {
  shortFormat: (value: number) => string;
  longFormat: (value: number) => string;
  filtered: number[];
  original: number[];
  id: string;
  focusedValue?: number;
  onChange: (value: [number, number]) => void;
  maxWidth?: number;
  value?: [number, number];
}

export function HtmlHistogram(props: HistogramProps) {
  const {
    filtered,
    original,
    value,
    focusedValue,
    shortFormat,
    longFormat,
    maxWidth,
    onChange,
  } = props;
  const height = 30;

  const { bins } = useMemo(() => {
    const maxBins = maxWidth
      ? Math.max(0, Math.floor(maxWidth / 6) * 0.55)
      : 11;
    let bins = bin().thresholds(maxBins)(original);

    if (original.length < 200) {
      const uniqueValues = Array.from(new Set(original)).sort(ascending);
      const numberOfUniqueValues = uniqueValues.length;
      if (numberOfUniqueValues > 1 && numberOfUniqueValues < 12) {
        const firstValueSpacing = uniqueValues[1] - uniqueValues[0];
        const areValuesEquallySpaced =
          uniqueValues.find(
            (value, index) =>
              index && value - uniqueValues[index - 1] !== firstValueSpacing
          ) === undefined;
        if (areValuesEquallySpaced) {
          bins = bin().thresholds(uniqueValues)(original);
        } else {
          if (bins.length > numberOfUniqueValues) {
            bins = bin().thresholds(numberOfUniqueValues)(original);
          }
        }
      }
    }
    return { bins };
  }, [original, maxWidth, value]);

  const filteredBins = bins.map((bin, binIndex) => {
    const isLastIndex = binIndex === bins.length - 1;
    let newBin = filtered.filter(
      d => d >= bin.x0 && (d < bin.x1 || isLastIndex)
    );
    return newBin;
  });

  const {
    xScale,
    yScale
  } = useMemo(() => ({
    xScale: scaleLinear()
      .domain([min(bins, d => d.x0), max(original)])
      .range([0, 100]),
    yScale: scaleLinear()
      .domain([0, max(bins, d => d.length)])
      .range([0, 100])
  }), [bins, original]);

  const rangeValues = useMemo(() => (
    value ? [xScale(value[0]), xScale(value[1])] : [0, 100]
  ), [xScale, value]);

  const focusedBinIndex =
    focusedValue &&
    bins.findIndex((d, i) => {
      if (d.x0 <= focusedValue && d.x1 > focusedValue) {
        return true;
      }
      if (i === bins.length - 1 && d.x1 === focusedValue) {
        return true;
      }
      return false;
    });

  const valueExtent = extent(original);
  const isOneValue = valueExtent[0] === valueExtent[1];

  // const focusedBin = bins[focusedBinIndex];

  const barWidth = 4;
  const barSpacing = 2;
  const totalBarWidth = barWidth + barSpacing;
  const totalWidth = filteredBins.length * totalBarWidth;

  let stepSize =
    bins.length > 1 ? xScale(bins[1].x1) - xScale(bins[0].x1) || 50 : 100;
  if (stepSize < 1) stepSize = 1;

  const isFiltered = rangeValues[0] !== 0 || rangeValues[1] !== 100;

  if (isOneValue) {
    return (
      <div tw="px-2 tabular-nums font-medium text-gray-400">
        {longFormat(xScale.invert(rangeValues[0]))}
      </div>
    );
  }

  return (
    <div
      className="html-histogram"
      tw="flex-col items-center justify-center mt-1 self-center"
      style={{
        width: 'fit-content',
      }}
    >
      {bins.length > 1 && (
        <>
          <div
            tw="flex items-end relative"
            style={{
              height,
              width: 'fit-content',
            }}
          >
            {bins.map((bin, i) => {
              const height = yScale(bin.length);
              const filteredHeight = yScale(filteredBins[i].length);

              return (
                <Bin
                  key={i}
                  height={height}
                  filteredHeight={filteredHeight}
                  barWidth={barWidth}
                  barSpacing={barSpacing}
                  isFocused={focusedBinIndex == i}
                />
              );
            })}
          </div>

          <BarRange
            totalWidth={totalWidth}
            stepSize={stepSize}
            onChange={onChange}
            xScale={xScale}
            rangeValues={rangeValues}
            isFiltered={isFiltered}
          />
        </>
      )}

      <Axis
        totalWidth={totalWidth}
        rangeValues={rangeValues}
        min={shortFormat(xScale.invert(rangeValues[0]))}
        max={shortFormat(xScale.invert(rangeValues[1]))}
        isFiltered={isFiltered}
      />
    </div>
  );
}

export default HtmlHistogram;


const Bin = memo(({ height, filteredHeight, barWidth, barSpacing, isFocused }) => {
  return (
    <div
      tw="h-full flex-shrink-0 relative"
      style={{ width: barWidth, marginRight: barSpacing }}
    >
      {isFocused && (
        <div
          tw="absolute inset-0 bg-indigo-100 transition"
          style={{ top: -3, left: -1, right: -1 }}
        />
      )}
      <div
        tw="absolute bottom-0 left-0 right-0 bg-gray-200"
        style={{
          height: `${height}%`,
        }}
      ></div>
      <div
        className="y-scale-in"
        tw="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all ease-out origin-bottom"
        style={{
          height: `${filteredHeight}%`,
        }}
      ></div>
    </div>
  )
})

const BarRange = memo(({
  totalWidth,
  stepSize,
  onChange,
  xScale,
  rangeValues,
  isFiltered,
}) => {
  return (

    <div tw="mt-1 mb-3" style={{ width: totalWidth }}>
      <Range
        min={0}
        max={100}
        step={stepSize}
        values={rangeValues}
        draggableTrack
        onChange={newRange => {
          if (newRange[0] === 0 && newRange[1] === 100) {
            onChange(undefined);
            return;
          }
          const x0 = xScale.invert(newRange[0]);
          const x1 = xScale.invert(newRange[1]);
          onChange([x0, x1]);
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            tw="flex rounded-sm"
            className={`html-histogram__range--${isFiltered ? 'filtered' : 'base'
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
                  ? ['#E5E7EB', '#6366F1', '#E5E7EB']
                  : ['#E5E7EB', '#A5B4FBff', '#E5E7EB'],
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, isDragged }) => {
          return (
            <div
              {...props}
              className="html-histogram__thumb"
              css={[
                tw`rounded-sm text-indigo-400 focus:outline-none focus:ring transition ease-out flex items-center justify-center`,
                isDragged && tw`ring`,
              ]}
              style={{
                ...props.style,
                bottom: -12,
                height: 7,
                width: 10,
              }}
            >
              <svg
                viewBox="0 0 1 1"
                tw="h-full w-full"
                preserveAspectRatio="none"
              >
                <path d="M 0 1 L 0.5 0 L 1 1 Z" fill="currentColor" />
              </svg>
            </div>
          );
        }}
      />
    </div>
  )
})

const Axis = memo(({
  totalWidth,
  rangeValues,
  min,
  max,
  isFiltered,
}) => {
  return (
    <div
      tw="flex justify-center tabular-nums text-xs text-gray-400 whitespace-nowrap"
      className={`html-histogram__numbers html-histogram__numbers--${isFiltered ? 'filtered' : 'base'
        }`}
      style={{ margin: '0 -5px -9px', width: totalWidth + 10 }}
    >
      <div
        css={[
          tw`flex justify-start pr-2 flex-1`,
          rangeValues[0] != 0 && tw`text-indigo-500`,
        ]}
      >
        {min}
      </div>
      <div
        css={[
          tw`flex justify-end pl-2 flex-1`,
          rangeValues[1] != 100 && tw`text-indigo-500`,
        ]}
      >
        {max}
      </div>
    </div>
  )
})