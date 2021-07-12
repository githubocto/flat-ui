import tw from 'twin.macro';

export const Button = () => <input css={[tw`border bg-red-100`]} />;
export const Foo = () => {
  return (
    <div tw="bg-blue-100" css={tw`bg-blue-100`}>
      hey
    </div>
  );
};

export default Button;
