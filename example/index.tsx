import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Grid } from '../dist';
import data from './data';

const App = () => {
  return <Grid data={data} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
