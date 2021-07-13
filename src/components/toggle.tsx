import React from 'react';
import tw from 'twin.macro';
import { MixedCheckbox, MixedCheckboxProps } from '@reach/checkbox';
import '@reach/checkbox/styles.css';

interface ToggleProps extends MixedCheckboxProps {}

export const Toggle: React.FC<ToggleProps> = ({
  children,
  checked,
  onChange,
  ...rest
}) => {
  return (
    <label tw="flex items-center">
      <div
        css={[
          tw`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`,
          checked ? tw`bg-indigo-600` : tw`bg-indigo-200`,
        ]}
      >
        <MixedCheckbox
          tw="hidden"
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        <span
          css={[
            tw`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`,
            checked ? tw`translate-x-5` : tw`translate-x-0`,
          ]}
          aria-hidden="true"
        ></span>
      </div>
      <span tw="ml-2 select-none text-sm text-gray-700">{children}</span>
    </label>
  );
};
