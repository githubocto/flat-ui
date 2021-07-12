// @ts-nocheck
// please forgive me! was getting a horrendous error for the map in render
import React from 'react';
import Downshift from 'downshift';
import { matchSorter } from 'match-sorter';
// @ts-ignore
import { format } from 'd3';
import { CategoryValue } from '../../types';

interface CategoryFilterProps {
  value?: string;
  possibleValues?: string[];
  filteredData: any[];
  onChange: (value: string) => void;
}

const formatNumber = format(',');
export function CategoryFilter(props: CategoryFilterProps) {
  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   props.onChange(e.target.value);
  // };

  return (
    <Downshift onChange={props.onChange} value={props?.value || ''}>
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        clearSelection,
        isOpen,
        openMenu,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => (
        <div
          tw="w-full h-full -m-2 -mt-2"
          style={{ height: `calc(100% + 1rem)` }}
        >
          <div
            tw="h-full w-full"
            {...getRootProps({}, { suppressRefError: true })}
          >
            <input
              className={`h-full w-full px-3 py-3 placeholder-gray-400 border-none ${
                props?.value ? 'text-indigo-500' : 'text-gray-400'
              } bg-white outline-none focus:outline-none focus:shadow-outline w-full overflow-ellipsis`}
              placeholder={`Filter ${formatNumber(
                props.filteredData.length
              )} records`}
              {...getInputProps({
                onEmptied: () => {
                  props.onChange('');
                },
                onClick: () => {
                  if (!isOpen) {
                    openMenu();
                  }
                },
                onFocus: () => {
                  if (!isOpen) {
                    openMenu();
                  }
                },
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (!value) {
                    clearSelection();
                  }
                },
              })}
            />
          </div>
          {isOpen && (
            <ul
              {...getMenuProps()}
              tw="absolute min-w-full space-y-1 py-2 bg-white shadow-md z-10"
              className="fade-up-sm-in"
              style={{ marginTop: 1 }}
            >
              {(props.possibleValues || []).map(
                ({ value, count, color }: CategoryValue, index) => {
                  const isFilteredOut =
                    inputValue && !matchSorter([value], inputValue).length;
                  if (isFilteredOut) return null;

                  return (
                    <li
                      className={`p-2 inline-block ${color} rounded-full px-4 py-1 mx-2 border-2 ${
                        highlightedIndex === index
                          ? `border-indigo-500`
                          : `border-white`
                      } whitespace-nowrap cursor-pointer`}
                      {...getItemProps({
                        key: value,
                        index,
                        item: value,
                      })}
                    >
                      <span tw="overflow-ellipsis max-w-7xl">
                        {value} ({count.toLocaleString()})
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </div>
      )}

      {/* <option value="">{`Filter ${formatNumber(
        props.filteredData.length
      )} records`}</option>
      {(props.possibleValues || []).map((value: string) => {
        if (!value) return;
        return (
          <option key={value} value={value}>
            {value}
          </option>
        );
      })} */}
    </Downshift>
  );
}
