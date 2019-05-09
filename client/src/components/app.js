import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../assets/css/app.scss';
import React from 'react';
import {Route, Switch, withRouter, Link} from 'react-router-dom';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Homepage from './homepage';
import Dashboard from './dashboard/dashboard';
import './app.scss';
import logo from '../../dist/logo_transparent2.png';
import Error404 from './general/error404';

const App = () => (
    <div className='application-container'>
        <aside>
            <nav>
                <Link to='/'><img src={logo}/></Link>
                <Link to="/"><i className="material-icons md-36">home</i><p>Home</p></Link>
                <Link to="/generalMap"><i className="material-icons md-36">map</i><p>State Map</p></Link>
            </nav>
        </aside>

        <nav className="mobile-nav">
            <Link to="/">Home</Link>
            <img src={logo}/>
            <Link to="/generalMap">State Map</Link>
        </nav>

        <main>
            <Switch>
                <Route exact path='/' component={Homepage}/>
                <Route exact path='/generalMap' component={Homepage}/>
                <Route path='/byState/:state' component={Homepage}/>
                <Route path='/location/:id' component={Homepage}/>
                <Route path ='/crossReference/:keyword/:location/:range' component={Homepage}/>
                <Route path='/busLookup/:id' component={Homepage}/>
                <Route path='/dashboard' component={Dashboard}/>

                <Route component={Error404}/>
            </Switch>

            <footer>
                <section className="top-bar">
                    <a href="https://www.linkedin.com/in/anthony-bocchino-b79316141/" target='_blank'><i className="fab fa-linkedin"></i></a>
                    <a href="https://anthonybo.com" target='_blank'><i className="fas fa-user"></i></a>
                    <a href="https://github.com/anthonybo" target='_blank'><i className="fab fa-github"></i></a>
                </section>
                <section className="bottom-bar">
                    <p className='white-text'>&copy; 2019 | All rights reserved</p>
                </section>
            </footer>
        </main>
    </div>
);

export default App;