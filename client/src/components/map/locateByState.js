import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
import axios from "axios";
import {withRouter} from 'react-router-dom';
import stateData from './us_states';

class LocateByState extends Component {

    state = {
        wholefoods: null,
        center: [-97.2263, 37.7091],
        zoom: 4,
        state: '',
        email: '',
        user_id: 0,
        popup: null,
        coords: []
    }

    async getData() {
        let path = this.props.history.location.pathname;
        let state = path.match( /byState\/(\w\w)/ )[1];

        let wholefoods = await axios.post('/api/wholefoods/state', {
            state: state
        });

        if(wholefoods.data.geoJson.features.length < 1){
            console.log('No Results')

            this.setState({
                zoom: 3,
                state: state
            })
        } else {
            // console.log(wholefoods.data.geoJson.features[0].geometry.coordinates);
            let center = wholefoods.data.geoJson.features[0].geometry.coordinates;

            wholefoods = wholefoods.data.geoJson;

            this.setState({
                wholefoods: wholefoods,
                center: center,
                state: state
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

        statePre.id = 'currentStateContainer';
        stateSpan.innerText = 'Current State: ' + this.state.state;
        wfCount.innerText = 'WF Count: ' + this.state.wholefoods.features.length;
        // console.log(this.state.wholefoods.features.length);
        mapDiv.append(statePre);
        statePre.append(wfCount, stateSpan);
    }

    createMap =()=> {
        // console.log(this.state.state);
        // console.log(stateData);

        this.map = new mapboxgl.Map({
            container: 'map',
            // style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            style: 'mapbox://styles/anthonybo/cjvoh2yx00d4c1cnv3gmbgnol',
            // center: this.state.center,
            zoom: this.state.zoom,
            pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });

        let coords = [];
        let stateOutline = null;
        let bounds;

        stateData.features.map ((item, index) => {
            if(item.properties.STATE_ABB == this.state.state){
                // stateData.features.splice(index, 1);
                stateOutline = item;
                let tmp = item.geometry.coordinates;
                if(this.state.state == 'CA'){
                    coords = [ ...tmp[0][0], ...tmp[1][0], ...tmp[2][0], ...tmp[3][0], ...tmp[4][0], ...tmp[5][0] ]
                } else if (this.state.state == 'FL' || this.state.state == 'RI'){
                    coords = [ ...tmp[0][0], ...tmp[1][0] ];
                } else if (this.state.state == 'HI') {
                    coords = [ ...tmp[4][0], ...tmp[5][0], ...tmp[6][0], ...tmp[7][0], ...tmp[8][0], ...tmp[9][0], ...tmp[10][0] ];
                } else {
                    coords = item.geometry.coordinates[0];
                }

                bounds = new mapboxgl.LngLatBounds();

                coords.forEach(function(feature) {
                    bounds.extend(feature);
                });
                
                this.map.fitBounds(bounds);
                // this.map.setMaxBounds(bounds);
            }
        });

        this.map.on('style.load', () => {
            // this.rotateCamera(0);
            this.map.addControl(new mapboxgl.FullscreenControl());

            class MapboxGLButtonControl {
                constructor({
                                className = "",
                                title = "",
                                eventHandler = evtHndlr
                            }) {
                    this._className = className;
                    this._title = title;
                    this._eventHandler = eventHandler;
                }

                onAdd(map) {
                    this._btn = document.createElement("button");
                    this._btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
                    this._btn.type = "button";
                    this._btn.title = this._title;
                    this._btn.onclick = this._eventHandler;

                    this._container = document.createElement("div");
                    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
                    this._container.appendChild(this._btn);

                    return this._container;
                }

                onRemove() {
                    this._container.parentNode.removeChild(this._container);
                    this._map = undefined;
                }
            }

            const ctrlCenter = new MapboxGLButtonControl({
                className: "mapbox-gl-center",
                title: "Center camera",
                eventHandler: ()=>{this.map.fitBounds(bounds);}
            });

            this.map.addControl(ctrlCenter, "top-right");

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

            this.map.addSource("stateOutline", {
                "type": "geojson",
                "data": stateOutline
            });

            this.map.addLayer({
                "id": "stateOutline",
                "type": "line",
                "source": "stateOutline",
                "paint": {
                    "line-color": "rgb(50,188,210)",
                    "line-opacity": .6,
                    "line-gap-width": 1,
                    "line-blur": 2,
                    "line-dasharray": [10, 3, 2, 3]
        },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
            });

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


            // add circle layer here
            this.map.addLayer({
                id: 'wholefoods-point',
                type: 'circle',
                source: 'wholefoods',
                minzoom: 1,
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
                    'circle-color': 'rgb(48,108,9)',
                    'circle-stroke-color': 'rgb(116,255,10)',
                    'circle-stroke-width': 3,
                    'circle-opacity': {
                        stops: [
                            [14, 1],
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
            });

            this.map.on('zoomend', (e)=>{
                var zoom = this.map.getZoom();
                // console.log(zoom);
                if(zoom > 8){
                    // this.map.setPitch(0);
                    // this.map.easeTo(latlng, zoom, bearing, 0, options);
                    this.map.easeTo({bearing:60, duration:1200, pitch:0});
                } else {
                    // this.map.setPitch(45);
                    this.map.easeTo({bearing:0, duration:1200, pitch:45});
                }
            })
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
                    <div id='map'></div>
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