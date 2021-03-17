import React from "react";
import cc from "classcat";
import { MixedCheckbox, MixedCheckboxProps } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

interface ToggleProps extends MixedCheckboxProps {}

export const Toggle: React.FC<ToggleProps> = ({
  children,
  checked,
  onChange,
  ...rest
}) => {
  const buttonClass = cc([
    "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    {
      "bg-indigo-600": checked,
      "bg-gray-200": !checked,
    },
  ]);

  const toggleClass = cc([
    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
    {
      "translate-x-5": checked,
      "translate-x-0": !checked,
    },
  ]);

  return (
    <label className="flex items-center">
      <div className={buttonClass}>
        <MixedCheckbox
          className="hidden"
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        <span className={toggleClass} aria-hidden="true"></span>
      </div>
      <span className="ml-2 select-none text-sm text-gray-700">{children}</span>
    </label>
  );
};
