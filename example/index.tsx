import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Button, { Foo } from '../.';

const App = () => (
  <div>
    <Button />
    <Foo />
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
