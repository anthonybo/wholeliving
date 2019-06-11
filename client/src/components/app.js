import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../assets/css/app.scss';
import React, {Component} from 'react';
import {Route, Switch, withRouter, Link} from 'react-router-dom';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Homepage from './homepage';
import Dashboard from './dashboard/dashboard';
import './app.scss';
import logo from '../../dist/logo_transparent2.png';
import Error404 from './general/error404';
import io from "socket.io-client";
import axios from 'axios';

class App extends Component {
    state = {
        response: {}
    }

    componentDidMount() {
        this.getLocation();

    }

    async getIP(locationData){
        let url = window.location.href.split('/');
        let newURL= 'wholeliving.info';
        let userIP = await axios.get('/api/user/ip');
        let city = '';
        let state = '';
        let lat = '';
        let lng = '';
        let house_number = '';
        let road = '';

        if(url[2] == 'localhost:3000'){
            newURL = '';
        }

        if(locationData == undefined){
            city = 'denied';
            state = 'denied';
            road = 'denied';
        } else {
            // console.log(locationData);
            city = locationData.data.address.city;
            state = locationData.data.address.state;
            house_number = locationData.data.address.house_number;
            road = locationData.data.address.road;
            lat = locationData.data.lat;
            lng = locationData.data.lon;
        }

        const socket = io( newURL, {
            reconnect: true,
            perMessageDeflate: false,
            secure: true,
            transports: ['websocket'],
            query: `IP=${userIP.data.ip}`,
        });

        socket.emit('location', {city: city, state: state, lat: lat, lng: lng, house_number: house_number, road:road });

        socket.on("userCount", (data) => {
            this.setState({response: data})
        });

        socket.on("reconnect_attempt", (data) => {
            // console.log('Reconnection occurring');
            // socket.emit('disconnectALL', {data: data});
            // this.getLocation();

            location.reload();
        });
    }

    async getLocation() {
        var options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: Infinity
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position, error, options)=>{
                // console.log(position);
                var locationData = await axios.post('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1',{
                    dataType: 'json',
                });
                this.getIP(locationData);
                return locationData;
                }, (error) => {
                this.getIP();
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            this.getIP();
        }
    }

    render(){
        return(
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
                        {/*<Route path='/dashboard' component={Dashboard}/>*/}
                        <Route exact path={['/dashboard']} render={(props) => <Dashboard {...props} userCount={this.state.response.userCount} users={this.state.response.users}/>} />
                        <Route path={['/dashboard/:socket']} render={(props) => <Dashboard {...props} userCount={this.state.response.userCount} users={this.state.response.users}/>} />


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
        )
    }
}

export default App;