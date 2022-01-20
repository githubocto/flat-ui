import { PlusIcon } from '@primer/octicons-react';
import { useState } from 'react';
import tw from 'twin.macro';

interface NewColumnHeaderProps {
  style: object;
  onAdd: (name: string) => void;
}
export function NewColumnHeader(props: NewColumnHeaderProps) {
  const { style, onAdd } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState('');

  return (
    // @ts-ignore
    <div
      className="sticky-grid__header"
      css={[
        tw`border-b border-r bg-gray-50 border-gray-200 flex-col`,
        style,
      ]}
    >
      {isEditing ? (
        <form tw="flex flex-col justify-center items-center py-6 px-3" onSubmit={e => {
          e.preventDefault();
          onAdd(editedValue);
          setIsEditing(false);
        }}>
          <label tw="text-sm text-gray-500!">
            Column Name
          </label>
          <input
            type="text"
            autoFocus
            onFocus={e => {
              e.target.select();
            }}
            tw="w-full h-full py-2 px-2 text-black focus:outline-none bg-white border border-gray-300"
            value={editedValue}
            onChange={e => setEditedValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditedValue('');
              }
            }}
            onBlur={() => {
              setIsEditing(false);
              setEditedValue('');
            }}
          />
        </form>
      ) : (
        <button tw="h-full w-full flex flex-col items-center justify-center p-6 text-gray-500! text-sm! text-center"
          onClick={() => setIsEditing(true)}>
          <PlusIcon />
          Add a column
        </button>
      )}
    </div>
  )
}