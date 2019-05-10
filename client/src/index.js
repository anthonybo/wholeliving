import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './components/app';

ReactDOM.render(
// import App from './components/app';
    <Router>
        <App />
    </Router>,
    document.getElementById('root')
);
