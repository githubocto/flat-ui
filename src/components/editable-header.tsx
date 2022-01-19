import React, { useEffect } from 'react';
import { areEqual } from 'react-window';
import tw from 'twin.macro';

interface EditableHeaderProps {
  value: string;
  isEditable: boolean;
  onChange?: (value: any) => void;
  children: any;
}
export const EditableHeader = React.memo(function (props: EditableHeaderProps) {
  const {
    value,
    isEditable,
    onChange,
    children,
  } = props;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedValue, setEditedValue] = React.useState(value);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const onSubmit = () => {
    onChange?.(editedValue);
    setIsEditing(false);
  }

  if (!isEditable) return children

  return (
    <div
      css={[
        tw`h-full w-full max-w-full flex items-center cursor-cell`,
      ]}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          type="text"
          autoFocus
          onFocus={e => {
            e.target.select();
          }}
          css={[
            tw`w-full h-full py-2 px-2 font-mono text-black text-sm focus:outline-none bg-transparent bg-white`,
          ]}
          style={{ fontSize: "0.875rem" }}
          value={editedValue}
          onChange={e => setEditedValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSubmit()
            } else if (e.key === 'Escape') {
              setIsEditing(false)
              setEditedValue(value)
            }
          }}
          onBlur={() => {
            setIsEditing(false)
            setEditedValue(value)
          }}
        />
      ) : (
        children
      )}
    </div>
  );
}, areEqual);
