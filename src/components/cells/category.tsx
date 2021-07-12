import tw from 'twin.macro';

interface CategoryCellProps {
  value: string;
  categoryColor: string;
}

export function CategoryCell(props: CategoryCellProps) {
  return (
    <span
      css={[
        tw`overflow-ellipsis block whitespace-nowrap overflow-hidden rounded-full px-4 py-1 -ml-2 -mr-2`,
      ]}
      // TODO: This won't work with Tailwind
      className={props.categoryColor}
      title={props.value}
    >
      {props.value}
    </span>
  );
}
