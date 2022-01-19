import React, { useEffect } from 'react';
import { areEqual } from 'react-window';
import tw from 'twin.macro';

interface EditableCellProps {
  value: any;
  isEditable: boolean;
  onChange?: (value: any) => void;
  isFocused: boolean;
  onFocusChange?: (value: [number, number] | null) => void;
  children: any;
}
export const EditableCell = React.memo(function (props: EditableCellProps) {
  const {
    value,
    isEditable,
    onChange,
    isFocused,
    onFocusChange,
    children,
  } = props;

  const [isEditing, setIsEditing] = React.useState(false);
  const isEditingRef = React.useRef(isEditing);
  const [editedValue, setEditedValue] = React.useState(value);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const onSubmit = () => {
    onFocusChange?.([1, 0]);
    if (onChange) onChange(editedValue);
  }

  useEffect(() => {
    if (!isFocused) {
      setIsEditing(false);
      setEditedValue(value);
      return
    }

    const onKeyDown = (e: KeyboardEvent) => {
      let diff = cellDiffs[e.key]
      if (diff) {
        if (e.metaKey) {
          // scroll to top/bottom
          diff = diff.map(d => d ? Infinity * d : d) as [number, number]
        }
        onFocusChange?.(diff)
        e.stopPropagation()
        e.preventDefault()
      } else if (e.key === 'Enter' && !isEditingRef.current) {
        setTimeout(() => {
          // without the timeout, the form was submitting immediately
          setIsEditing(true);
        }, 0)
      } else if (e.key === 'Escape') {
        onFocusChange?.(null)
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [isFocused])

  if (!isEditable) return children

  return isEditing ? (
    <form onSubmit={e => {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    }}
      css={[
        tw`w-full h-full border-[3px] border-transparent border-indigo-500`,
      ]}>
      <input
        type="text"
        autoFocus
        onFocus={e => {
          e.target.select();
        }}
        css={[
          tw`w-full h-full py-2 px-4 font-mono text-sm focus:outline-none bg-transparent`,
        ]}
        value={editedValue}
        onChange={e => setEditedValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onFocusChange?.(null)
          } else if (cellDiffs[e.key]) {
            e.stopPropagation()
          }
        }}
        onBlur={onSubmit}
      />
    </form>
  ) : (
    <button
      css={[
        tw`w-full h-full flex items-center cursor-cell border-[3px] border-transparent`,
        isFocused && tw`border-indigo-500`,
      ]}
      onClick={() => onFocusChange?.([0, 0])}
      onDoubleClick={() => setIsEditing(true)}
    >
      {children}
    </button>

  );
}, areEqual);

const cellDiffs = {
  "ArrowUp": [-1, 0],
  "ArrowDown": [1, 0],
  "ArrowLeft": [0, -1],
  "ArrowRight": [0, 1],
} as Record<string, [number, number]>