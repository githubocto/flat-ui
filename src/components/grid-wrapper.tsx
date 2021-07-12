import { GlobalStyles } from 'twin.macro';
import { StoreWrapper } from './store-wrapper';
import { Grid, GridProps } from './grid';

function GridWrapper(props: GridProps) {
  return (
    <StoreWrapper>
      <GlobalStyles />
      <Grid {...props} />
    </StoreWrapper>
  );
}

export { GridWrapper };
