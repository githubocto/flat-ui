import { Grid } from '@githubocto/flat-ui';
import React from 'react';
import * as ReactDOM from 'react-dom';

const MyComponent = () => {
  const data = [{ column1: 123 }, { column1: 234 }];

  return <Grid data={data} />;
};

const root = ReactDOM.createRoot(document.body)
root.render(<MyComponent />)
