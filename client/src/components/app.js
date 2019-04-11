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
        <div className='nav center-align container'>
            <div className='row'>
                <Link className='col s6' to='/generalMap'>General Map(By State)</Link>
                <Link className='col s6' to='/'>Display ALL Whole Foods</Link>
            </div>
        </div>

        <Switch>
            <Route exact path='/' component={Homepage}/>
            <Route exact path='/generalMap' component={Homepage}/>
            <Route path='/byState/:state' component={Homepage}/>
            <Route path='/location/:id' component={Homepage}/>
            <Route path ='/crossReference/:keyword/:location' component={Homepage}/>
        </Switch>
    </div>
);

export default App;