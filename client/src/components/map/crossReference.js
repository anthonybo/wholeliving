const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
import React, {Component, Fragment} from 'react';
import axios from 'axios';
import './map.scss';
import {withRouter} from 'react-router-dom';

class CrossReference extends Component {

    state = {
        wholefoods: null,
        wholefoodsLength: 0,
        keyword: null,
        keywordLength: 0,
        center: [-97.2263, 37.7091]
    }

    async getData() {
        // let wholefoods = await axios.get(`/api/wholefoods`);
        let wholefoodsLimited = null;
        let wholefoodsLimitedLength = 0;
        let path = this.props.location.pathname;
        let center = [];

        let keyword = this.props.match.params.keyword;
        let location = this.props.match.params.location;
        let range = this.props.match.params.range;
        // console.log(keyword, ' ', location, ' ', range);

        let userInput = await axios.post(`/api/places`, {
            keyword: keyword,
            location: location
        });

        userInput = userInput.data.geoJson;
        // console.log(userInput.features.length);
        // wholefoods = wholefoods.data.geoJson;

        if(userInput.features.length == 0){
            center = [-97.2263, 37.7091];
        } else {
            center = userInput.features[0].geometry.coordinates;

            let lat = userInput.features[0].geometry.coordinates[1];
            let lng = userInput.features[0].geometry.coordinates[0];

            wholefoodsLimited = await axios.post('/api/geoSpacial', {
                lat: lat,
                lng: lng,
                range: range
            });

            wholefoodsLimited = wholefoodsLimited.data.geoJson;
            wholefoodsLimitedLength = wholefoodsLimited.features.length;
        }

        this.setState({
            wholefoods: wholefoodsLimited,
            wholefoodsLength: wholefoodsLimitedLength,
            keyword: userInput,
            keywordLength: userInput.features.length,
            center: center
        })

        if(wholefoodsLimited !== null){
            this.createMap();
        }
    }

    createMap(){
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            center: this.state.center,
            zoom: 10.6,
            pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });

        this.map.on('style.load', () => {
            // this.rotateCamera(0);
            // this.map.addControl(new mapboxgl.FullscreenControl());

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
             * Adding the source for the data
             * Display the data with pin points
             * */
            this.map.addSource('wholefoods', {
                type: 'geojson',
                data: this.state.wholefoods
            });

            this.map.addSource('keyword', {
                type: 'geojson',
                data: this.state.keyword
            });



            // add circle layer here
            this.map.addLayer({
                id: 'wholefoods-point',
                type: 'circle',
                source: 'wholefoods',
                // minzoom: 14,
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

            // add circle layer here
            this.map.addLayer({
                id: 'keyword-point',
                type: 'circle',
                source: 'keyword',
                // minzoom: 14,
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
                    'circle-stroke-color': 'red',
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
                // console.log(e.features[0].properties);

                // this.createFeatureButtonLink();
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML('<b>Whole Foods</b>' + '<br><b>State:</b> ' + e.features[0].properties.State + '<br><b>Address:</b> ' + e.features[0].properties.Address + '<br><b>City:</b> ' + e.features[0].properties.City + '<br><b>Zip:</b> ' + e.features[0].properties.Zip + '<br><b>Phone:</b> ' + e.features[0].properties.Phone + '<br><b>Hours:</b> ' + e.features[0].properties.Hours)
                    .addTo(this.map);
                // var features = e.features[0];
            });

            this.map.on('click', 'keyword-point', (e) => {
                console.log(e.features[0]);

                // this.createFeatureButtonLink();
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML('<b>'+ e.features[0].properties.Name +'</b>' + '<br><b>Rating:</b> ' + e.features[0].properties.Rating + '<br><b>Address:</b> ' + e.features[0].properties.Address + '<br><b>Phone:</b> ' + e.features[0].properties.Phone + '<br><b>Hours:</b> ' + e.features[0].properties.Hours)
                    .addTo(this.map);
                // var features = e.features[0];
            });
        });
    }

    componentDidMount() {
        // this.createMap();
        this.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.location.pathname !== this.props.location.pathname) {
            this.getData();
        }
    }

    render(){
        const { wholefoods, keyword, keywordLength, wholefoodsLength } = this.state;

        if(wholefoods && keyword ){
            // let search_term = this.props.match.params.keyword;
            return(
                <Fragment>
                    <div id='map'>
                        <span className="new badge red" data-badge-caption="Found">{keywordLength}</span>
                        <span className="new badge green" data-badge-caption="Found">{wholefoodsLength}</span>

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

export default withRouter(CrossReference);