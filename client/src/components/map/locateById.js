import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
const MapboxDirections = require('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions');
import axios from "axios";
import {withRouter} from 'react-router-dom';

class LocateByState extends Component {
    state = {
        wholefoods: null,
        center: [-97.2263, 37.7091],
        zoom: 18,
        id: 0,
        state: '',
        city: '',
        user_id: 0,
        popup: null,
        coords: []
    }

    async getData() {
        let path = this.props.history.location.pathname;
        let id = path.match( /location\/(\d+)/ )[1];

        let wholefoods = await axios.post('/api/location', {
            id: id
        });

        if(wholefoods.data.geoJson.features.length < 1){
            console.log('No Results')

            this.setState({
                zoom: 3,
                state: 'Not Found'
            })
        } else {
            // console.log(wholefoods.data.geoJson.features[0].geometry.coordinates);
            let center = wholefoods.data.geoJson.features[0].geometry.coordinates;

            wholefoods = wholefoods.data.geoJson;
            // console.log(wholefoods.features[0].properties.City);
            let state = wholefoods.features[0].properties.State;
            let city = wholefoods.features[0].properties.City;
            
            this.setState({
                wholefoods: wholefoods,
                center: center,
                state: state,
                city: city
            })
        }

        if(wholefoods !== null) {
            this.createMap();
        }
    }

    displayCurrentState = () => {
        let mapDiv = document.getElementById('map');
        let statePre = document.createElement('pre');
        let stateSpan = document.createElement('span');
        let wfCount = document.createElement('span');
        let citySpan = document.createElement('span');


        statePre.id = 'currentStateContainer';
        stateSpan.innerText = 'State: ' + this.state.state;
        citySpan.innerText = 'City: ' + this.state.city;
        // wfCount.innerText = 'WF Count: ' + this.state.wholefoods.features.length
        // console.log(this.state.wholefoods.features.length);
        mapDiv.append(statePre);
        statePre.append(stateSpan, citySpan);
    }

    createDirections =()=> {
        if (!this.state.directionsOpen){
            // this.map.addControl(new mapboxgl.FullscreenControl());

            this.directions = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                interactive: false,
                controls: {
                    inputs: true,
                    instructions: true,
                    profileSwitcher: false
                },
                placeholderDestination: (this.state.wholefoods.features[0].properties.Address)
            });

            this.locateUser = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: false,
                    timeout: 6000
                },
                trackUserLocation: true,
                showUserLocation: false,
            });

            this.locateUser.on('error', (e)=>{
                // console.log('Timeout has occurred: ', e);

                let coords = sessionStorage.getItem('coords');
                if(coords !== null){
                    this.directions.setOrigin(coords);
                }
            })

            // this.fullScreen = new mapboxgl.FullscreenControl();
            // this.map.addControl(this.fullScreen);
            this.map.addControl(this.directions, 'top-left');
            this.map.addControl(this.locateUser);

            this.directions.setDestination(this.state.wholefoods.features[0].properties.Address + ' ' + this.state.wholefoods.features[0].properties.City);

            this.locateUser.on('geolocate', (e)=> {
                // console.log(e);
                // this.directions.placeholderOrigin = 'test';
                this.directions.setOrigin([e.coords.longitude, e.coords.latitude]);
                // this.directions.query();
            })
            this.setState({
                directionsOpen: true
            })
        } else {
            this.map.removeControl(this.directions);
            this.map.removeControl(this.locateUser);
            // this.map.removeControl(this.fullScreen);
            // this.map.disable(this.map.transform);

            this.map.flyTo({
                center: this.state.center,
                speed: 0.6,
                curve: 1,
                easing: function (t) { return t; }
            })

            this.setState({
                directionsOpen: false
            })
        }
    }
    // rotator=()=>{
    //     console.log('Rotator');
    //     this.map.easeTo({bearing:60, duration:5000, pitch:55, zoom:14});
    //     window.setTimeout(()=>{
    //         this.map.easeTo({bearing:180, duration:8000, pitch:0, zoom:10});
    //         window.setTimeout(()=>{
    //             this.map.easeTo({bearing:220, duration:7000, pitch:70, zoom:13});
    //             window.setTimeout(()=>{
    //                 this.rotator();
    //             }, 5000)
    //         }, 8000)
    //     }, 7000)
    // }
    createMap =()=> {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            center: this.state.center,
            zoom: this.state.zoom,
            pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });
        
        this.map.on('style.load', () => {
            // this.rotator();
            // this.rotateCamera(0);
            this.map.addControl(new mapboxgl.FullscreenControl());

            // if(!document.getElementById("menu")) {
            //     this.createMenu();
            // }

            /**
             * Allow the ability to create 3D Buildings
             * */
                // Insert the layer beneath any symbol layer.
            var layers = this.map.getStyle().layers;

            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            this.map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',

                    // use an 'interpolate' expression to add a smooth transition effect to the
                    // buildings as the user zooms in
                    'fill-extrusion-height': [
                        "interpolate", ["linear"], ["zoom"],
                        15, 0,
                        15.05, ["get", "height"]
                    ],
                    'fill-extrusion-base': [
                        "interpolate", ["linear"], ["zoom"],
                        15, 0,
                        15.05, ["get", "min_height"]
                    ],
                    'fill-extrusion-opacity': .6
                }
            }, labelLayerId);

            /**
             * Adding the source for the crime data
             * Display the data with heat maps and pin points
             * */
            this.map.addSource('wholefoods', {
                type: 'geojson',
                data: this.state.wholefoods
            });

            // add heatmap layer here
            this.map.addLayer({
                id: 'wholefoods-heat',
                type: 'heatmap',
                source: 'wholefoods',
                maxzoom: 15,
                paint: {
                    // increase weight as diameter breast height increases
                    'heatmap-weight': {
                        property: 'dbh',
                        type: 'exponential',
                        stops: [
                            [1, 0],
                            [62, 1]
                        ]
                    },
                    // increase intensity as zoom level increases
                    'heatmap-intensity': {
                        stops: [
                            [11, 1],
                            [15, 3]
                        ]
                    },
                    // assign color values be applied to points depending on their density
                    // R: 93 G: 188 B: 210
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(93,188,210,0)',
                        0.2, 'rgb(80,188,210)',
                        0.4, 'rgb(70,188,210)',
                        0.6, 'rgb(60,188,210)',
                        0.8, 'rgb(50,188,210)'
                    ],
                    // increase radius as zoom increases
                    'heatmap-radius': {
                        stops: [
                            [11, 15],
                            [15, 20]
                        ]
                    },
                    // decrease opacity to transition into the circle layer
                    'heatmap-opacity': {
                        default: 1,
                        stops: [
                            [14, 1],
                            [15, 0]
                        ]
                    },
                }
            }, 'waterway-label');

            // add circle layer here
            this.map.addLayer({
                id: 'wholefoods-point',
                type: 'circle',
                source: 'wholefoods',
                minzoom: 14,
                paint: {
                    // increase the radius of the circle as the zoom level and dbh value increases
                    'circle-radius': {
                        property: 'dbh',
                        type: 'exponential',
                        stops: [
                            [{ zoom: 15, value: 1 }, 5],
                            [{ zoom: 15, value: 62 }, 10],
                            [{ zoom: 22, value: 1 }, 20],
                            [{ zoom: 22, value: 62 }, 50],
                        ]
                    },
                    'circle-color': {
                        property: 'dbh',
                        type: 'exponential',
                        stops: [
                            [0, 'rgba(236,222,239,0)'],
                            [10, 'rgb(236,222,239)'],
                            [20, 'rgb(208,209,230)'],
                            [30, 'rgb(166,189,219)'],
                            [40, 'rgb(103,169,207)'],
                            [50, 'rgb(28,144,153)'],
                            [60, 'rgb(1,108,89)']
                        ]
                    },
                    'circle-stroke-color': 'green',
                    'circle-stroke-width': 1,
                    'circle-opacity': {
                        stops: [
                            [14, 0],
                            [15, 1]
                        ]
                    }
                }
            }, 'waterway-label');

            this.map.on('click', 'wholefoods-point', (e) => {
                var favoriteElem = null;
                var self = this;
                if(this.state.email !== '' && this.state.user_id !== 0){
                    var popupValues = e;
                    let star_type = this.checkFavorites(e.features[0].id);
                    star_type.then(doWork.bind(null, popupValues.features));
                } else {
                    favoriteElem = '';
                    var popupValues = e;
                    doWork(popupValues.features,'');
                }


            });

            var favoriteElem = null;
            var self = this;
            if(this.state.email !== '' && this.state.user_id !== 0){
                var popupValues = this.state.wholefoods;
                let star_type = this.checkFavorites(this.state.wholefoods.features[0].id);
                star_type.then(doWork.bind(null, popupValues.features));
            } else {
                favoriteElem = '';
                var popupValues = this.state.wholefoods;
                doWork(popupValues.features,'');
            }

            function doWork (popValue, data) {
                if(data !== ''){
                    favoriteElem = '<span id="favoriteLocation">' + data + '</span>';
                } else {
                    favoriteElem = '';
                }

                var popup = new mapboxgl.Popup()
                    .setLngLat(popValue[0].geometry.coordinates)
                    .setHTML('<b>'+ '<a href="/location/'+ popValue[0].id +'">' +'Whole Foods' + '</a>' +'</b>' + '<br><b>State:</b> ' + popValue[0].properties.State + '<br><b>Address:</b> ' + popValue[0].properties.Address + '<br><b>City:</b> ' + popValue[0].properties.City + '<br><b>Zip:</b> ' + popValue[0].properties.Zip + '<br><b>Phone:</b> ' + popValue[0].properties.Phone + '<br><b>Hours:</b> ' + popValue[0].properties.Hours + '<br/>' + favoriteElem)
                    .addTo(self.map);

                self.setState({
                    popup: popup,
                    coords: popValue[0].geometry.coordinates
                })
                // var features = e.features[0];
                if(self.state.email !== '' && self.state.user_id !== 0){
                    var target = popValue[0].id;
                    var elem = document.getElementById("favoriteLocation");
                    elem.addEventListener('click', ()=>self.favoriteLocation(target));
                }

                if(self.state.email == ''){
                    var elem = document.getElementById('favoriteLocation');
                    if(elem !== null){
                        elem.parentNode.removeChild(elem);
                    }
                }
            }

            new mapboxgl.Popup()
                .setLngLat(this.state.wholefoods.features[0].geometry.coordinates)
                .setHTML('<b>Whole Foods</b>' + '<br><b>State:</b> ' + this.state.wholefoods.features[0].properties.State + '<br><b>Address:</b> ' + this.state.wholefoods.features[0].properties.Address + '<br><b>City:</b> ' + this.state.wholefoods.features[0].properties.City + '<br><b>Zip:</b> ' + this.state.wholefoods.features[0].properties.Zip + '<br><b>Phone:</b> ' + this.state.wholefoods.features[0].properties.Phone + '<br><b>Hours:</b> ' + this.state.wholefoods.features[0].properties.Hours)
                .addTo(this.map);
        });

        // this.displayCurrentState();
    }

    async checkFavorites (target) {
        let checkFavorite = await axios.post('/api/user/check/favorites', {
            email: this.state.email,
            user_id: this.state.user_id,
            location: target,
        })

        let star_type = '<i class="far fa-star"></i>';

        if(checkFavorite.data.results.length > 0){
            star_type = '<i class="fas fa-star"></i>'
        }

        return star_type;
    }

    async favoriteLocation (target) {
        if(this.state.email !== ''){
            let checkFavorite = await axios.post('/api/user/check/favorites', {
                email: this.state.email,
                user_id: this.state.user_id,
                location: target,
            })

            if(!checkFavorite.data.results.length > 0){
                let insertFavorite = await axios.post('/api/user/insert/favorites', {
                    location: target,
                    email: this.state.email,
                    user_id: this.state.user_id
                })

            } else {
                let removeFavorites = await axios.post('/api/user/remove/favorites', {
                    location: target,
                    user_id: this.state.user_id
                })

            }
            if(this.state.popup.isOpen()){
                this.state.popup.remove();
                this.map.fire('click', {lngLat: this.state.popup._lngLat, point: this.state.popup._pos});
                // this.flyIntoCluster(this.map, this.state.coords,this.map.getZoom() );
            }
        } else {
            console.log('You must be logged in!')
        }
    }

    componentDidMount() {
        if(this.props.email !== '' && this.props.user_id !== 0){
            this.setState({
                email: this.props.email,
                user_id: this.props.user_id
            })
        }

        this.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.location.pathname !== this.props.location.pathname) {
            if(this.map !== undefined){
                this.map.remove();
            }
        }

        if(this.props.email !== prevState.email && this.props.user_id !== prevState.user_id){
            this.setState( {
                email: this.props.email,
                user_id: this.props.user_id
            })

            if(this.map !== undefined && this.state.popup !== null){
                if(this.state.popup.isOpen()){
                    this.state.popup.remove();
                    this.map.fire('click', {lngLat: this.state.popup._lngLat, point: this.state.popup._pos});
                    // this.flyIntoCluster(this.map, this.state.coords,this.map.getZoom() );
                }
            }
        }
    }

    render(){
        const { wholefoods } = this.state;

        if(wholefoods){
            return(
                <Fragment>
                    <div id='map'>
                        <div id="div" className="mapboxgl-ctrl-bottom-right">
                            <a onClick={this.createDirections} className="btn-floating btn-large waves-effect waves-light blue"><i className="material-icons
   right">directions_car</i>Directions</a>
                        </div>
                    </div>
                </Fragment>
            )
        } else {
            return (
                <div className='spinnerContainer'>
                    <div className="preloader-wrapper big active">
                        <div className="spinner-layer spinner-red">
                            <div className="circle-clipper left">
                                <div className="circle"></div>
                            </div>
                            <div className="gap-patch">
                                <div className="circle"></div>
                            </div>
                            <div className="circle-clipper right">
                                <div className="circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default withRouter(LocateByState);