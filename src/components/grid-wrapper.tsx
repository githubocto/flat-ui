import React from 'react';
import { StoreWrapper } from './store-wrapper';
import { Grid, GridProps } from './grid';

function GridWrapper(props: GridProps) {
  return (
    <StoreWrapper>
      <Grid {...props} />
    </StoreWrapper>
  );
}

export { GridWrapper };
