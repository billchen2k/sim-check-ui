import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
// import 'semantic-ui-css/semantic.min.css';
import 'semantic-ui-less/semantic.less';
import '@/styles.css';

const mountNode = document.getElementById('app');
ReactDOM.render(<App />, mountNode);
