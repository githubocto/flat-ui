import 'twin.macro';
import { StoreWrapper } from './store-wrapper';

import { Grid, GridProps } from './grid';

function GridWrapper(props: GridProps) {
  return (
    <StoreWrapper>
      <div tw="flex flex-col h-full" className="github-octo-flat-ui">
        <Grid {...props} />
      </div>
    </StoreWrapper>
  );
}

export { GridWrapper };
