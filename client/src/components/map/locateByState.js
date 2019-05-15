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
        state: ''
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

    createMap(){
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

        stateData.features.map ((item, index) => {
            if(item.properties.STATE_ABB == this.state.state){
                // stateData.features.splice(index, 1);
                stateOutline = item;
                if(this.state.state == 'CA'){
                    coords = item.geometry.coordinates[5][0];
                } else if (this.state.state == 'FL' || this.state.state == 'RI'){
                    coords = item.geometry.coordinates[1][0];
                } else {
                    coords = item.geometry.coordinates[0];
                }

                var bounds = new mapboxgl.LngLatBounds();

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

            // this.map.addSource("warnings", {
            //     "type": "geojson",
            //     "data": stateData
            // });
            //
            // this.map.addLayer({
            //     "id": "warnings",
            //     "type": "fill",
            //     "source": "warnings",
            //     "paint": {
            //         "fill-outline-color": "#fa0000",
            //         "fill-opacity": 0.5,
            //     }
            // });

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
                // console.log(e.features[0].properties);

                // this.createFeatureButtonLink();
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML('<b>' + '<a href="/location/'+ e.features[0].id +'">' +'Whole Foods' + '</a>' + '</b>' + '<br><b>State:</b> ' + e.features[0].properties.State + '<br><b>Address:</b> ' + e.features[0].properties.Address + '<br><b>City:</b> ' + e.features[0].properties.City + '<br><b>Zip:</b> ' + e.features[0].properties.Zip + '<br><b>Phone:</b> ' + e.features[0].properties.Phone + '<br><b>Hours:</b> ' + e.features[0].properties.Hours)
                    .addTo(this.map);
                // var features = e.features[0];
            });

            this.map.on('zoomend', (e)=>{
                var zoom = this.map.getZoom();
                // console.log(zoom);
                if(zoom > 8){
                    // this.map.setPitch(0);
                    // this.map.easeTo(latlng, zoom, bearing, 0, options);
                    this.map.easeTo({bearing:60, duration:3000, pitch:0});
                } else {
                    // this.map.setPitch(45);
                    this.map.easeTo({bearing:0, duration:3000, pitch:45});
                }
            })
        });

        // this.displayCurrentState();
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.location.pathname !== this.props.location.pathname) {
            if(this.map !== undefined){
                this.map.remove();
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