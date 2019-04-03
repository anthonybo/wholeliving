import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../assets/css/app.scss';
import React from 'react';
import {Route, Switch, withRouter, Link} from 'react-router-dom';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Homepage from './homepage';
import './app.scss';

const App = () => (
    <div className='application-container'>
        <h1 className='center white-text'>Whole Living</h1>
        <Switch>
            <Route exact path='/' component={Homepage}/>
        </Switch>
    </div>
);

export default App;