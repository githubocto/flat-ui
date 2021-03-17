import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Grid } from '../.';
import data from './data';

const App = () => {
  return (
    <div>
      <Grid data={data} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
