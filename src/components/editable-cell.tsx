import { TrashIcon } from '@primer/octicons-react';
import React, { useEffect } from 'react';
import { areEqual } from 'react-window';
import tw from 'twin.macro';

interface EditableCellProps {
  value: any;
  isEditable: boolean;
  onChange?: (value: any) => void;
  isFirstColumn: boolean;
  isFocused: boolean;
  isExtraBlankRow: boolean;
  onFocusChange?: (value: [number, number] | null) => void;
  onRowDelete?: () => void;
  children: any;
}
export const EditableCell = React.memo(function (props: EditableCellProps) {
  const {
    value,
    isFirstColumn,
    isEditable,
    onChange,
    isFocused,
    isExtraBlankRow,
    onFocusChange,
    onRowDelete,
    children,
  } = props;

  const [isEditing, setIsEditing] = React.useState(false);
  const isEditingRef = React.useRef(isEditing);
  const hasSubmittedFormRef = React.useRef(false);
  const buttonElement = React.useRef<HTMLButtonElement>(null);
  const [editedValue, setEditedValue] = React.useState(value || "");

  useEffect(() => {
    setEditedValue(value || "");
  }, [value]);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const onSubmit = () => {
    hasSubmittedFormRef.current = true;
    onChange?.(editedValue);
    setIsEditing(false);
    onFocusChange?.([1, 0]);
  }

  useEffect(() => {
    if (!isFocused) {
      setIsEditing(false);
      setEditedValue(value);
      return
    } else {
      if (buttonElement.current) {
        buttonElement.current.focus();
      }
      hasSubmittedFormRef.current = false;
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
        // don't focus when triggering delete
        // @ts-ignore
        if (e.target?.classList.contains('delete-button')) return
        setTimeout(() => {
          // without the timeout, the form submits immediately
          setIsEditing(true);
        }, 0)
      } else if (e.key === 'Escape') {
        if (!isEditingRef.current) {
          onFocusChange?.(null)
        }
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
        tw`w-full h-full border-[3px] border-transparent`,
        isExtraBlankRow ? `border-gray-300` : `border-indigo-500`,
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
        value={editedValue || ""}
        onChange={e => setEditedValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            setIsEditing(false)
          } else if (cellDiffs[e.key]) {
            e.stopPropagation()
          }
        }}
        onBlur={() => {
          if (hasSubmittedFormRef.current) return
          onChange?.(editedValue)
          setIsEditing(false)
        }}
      />
    </form>
  ) : (
    <div css={[
      tw`w-full h-full`,
    ]}>
      {isFirstColumn && (
        <button
          css={[tw`absolute h-full text-red-500! opacity-0 focus:opacity-100`]}
          className="delete-button"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onRowDelete?.();
          }}>
          <TrashIcon />
        </button>
      )}
      <button
        ref={buttonElement}
        css={[
          tw`w-full h-full flex items-center cursor-cell border-[3px] border-transparent focus:outline-none`,
          isFocused && (isExtraBlankRow ? tw`border-gray-300` : tw`border-indigo-500`),
        ]}
        onFocus={() => onFocusChange?.([0, 0])}
        onClick={() => onFocusChange?.([0, 0])}
        onDoubleClick={() => setIsEditing(true)}
      >
        {children}
      </button>
    </div>
  );
}, areEqual);

const cellDiffs = {
  "ArrowUp": [-1, 0],
  "ArrowDown": [1, 0],
  "ArrowLeft": [0, -1],
  "ArrowRight": [0, 1],
} as Record<string, [number, number]>