import { Grid } from '@githubocto/flat-ui';

const Spreadsheet = () => {
  return <Grid data={data} />;
};

const data = [
  { column1: 123, color: "green" },
  { column1: 234, date: "2022-11-01T02:49:57.038Z" },
];

import React from 'react';
import * as ReactDOM from 'react-dom';


const root = ReactDOM.createRoot(document.body)
root.render(<Spreadsheet />)
