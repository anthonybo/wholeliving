import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const MapboxDirections = require('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions');
mapboxgl.accessToken = 'pk.eyJ1IjoiYW50aG9ueWJvIiwiYSI6ImNqc25rbzdpejBkY3E0M3JyaWNob250d3AifQ.4SL7BrQE_33BETs630EOww';
import axios from "axios";
import {withRouter} from 'react-router-dom';
import ReactDOM from "react-dom";

class LocateByBusId extends Component {

    state = {
        business: null,
        center: [-97.2263, 37.7091],
        zoom: 18,
        id: '',
        state: '',
        city: '',
        directionsOpen: false
    }

    async getData() {
        let path = this.props.history.location.pathname.split('/');
        let id = path[2];
        let businessInfo = {};
        var d = new Date();
        let Hours = 'unavailable';

        let businessData = await axios.post(`/api/places/details`, {
            places_id: id
        });

        businessData = businessData.data.data.result;
        if(businessData.opening_hours){
            Hours = businessData.opening_hours.weekday_text[d.getDay()-1 ];
        }

        businessInfo.type = "Feature",
            businessInfo.geometry = {
                type:"Point",
                coordinates:[businessData.geometry.location.lng, businessData.geometry.location.lat]
            };
        businessInfo.properties = {
            Address: businessData.formatted_address,
            Name: businessData.name,
            Rating: businessData.rating,
            website: businessData.website,
            Phone: businessData.formatted_phone_number,
            Hours: Hours
        }

        let business = {
            success:true,
            geoJson: {
                type:"FeatureCollection",
                features: [businessInfo]
            }
        }

        let center = business.geoJson.features[0].geometry.coordinates;
        business = business.geoJson;
        this.setState({
            business: business,
            center: center
        })

        if(business !== null){
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
                placeholderDestination: (this.state.business.features[0].geometry.coordinates[0]+','+ this.state.business.features[0].geometry.coordinates[1])
            });

            this.locateUser = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: false,
                    timeout: 6000
                },
                trackUserLocation: true,
                showUserLocation: false,
            });
            this.fullScreen = new mapboxgl.FullscreenControl();
            this.map.addControl(this.fullScreen);
            this.map.addControl(this.directions, 'top-left');
            this.map.addControl(this.locateUser);

            this.directions.setDestination(this.state.business.features[0].geometry.coordinates);

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
            this.map.removeControl(this.fullScreen);
            // this.map.disable(this.map.transform);
            //mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen

            // const node = ReactDOM.findDOMNode(this);
            // let elem = null;
            //
            // if (node instanceof HTMLElement) {
            //     elem = document.querySelector('.mapboxgl-ctrl.mapboxgl-ctrl-group');
            //
            // }
            // // console.log(elem);
            //
            // if(elem) {
            //     elem.remove();
            // }

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

    createMap(){
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            center: this.state.center,
            zoom: this.state.zoom,
            pitch: 45,
            attributionControl: false
            // minZoom: 7,
            // maxZoom: 20
        });

        this.map.on('style.load', () => {
            // this.rotateCamera(0);
            // this.map.addControl(new mapboxgl.FullscreenControl());

            // this.createDirections();

            // this.map.addControl(new MapboxDirections({
            //     accessToken: mapboxgl.accessToken
            // }), 'top-left');

            // MapboxDirections.setDestination('test');
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
            this.map.addSource('business', {
                type: 'geojson',
                data: this.state.business
            });

            // add heatmap layer here
            this.map.addLayer({
                id: 'business-heat',
                type: 'heatmap',
                source: 'business',
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
                id: 'business-point',
                type: 'circle',
                source: 'business',
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

            this.map.on('click', 'business-point', (e) => {
                // console.log(e.features[0].properties);
                let busInfo = e.features[0].properties;
                let hours = busInfo.Hours;
                let website = 'unavailable';
                // console.log(value.data.data.result);
                if(busInfo.website) {
                    // console.log('We have a website');
                    website = '<a target="_blank" href="' + busInfo.website + '">' + 'Link' + '</a>';
                }

                // this.createFeatureButtonLink();
                new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML('<b>' + busInfo.Name + '</b>' + '<br><b>Rating:</b> ' + busInfo.Rating + '<br><b>Address:</b> ' + busInfo.Address + '<br><b>Phone:</b> ' + e.features[0].properties.Phone + '<br><b>Website: </b>' + website + '<br><b>Hours:</b> ' + hours )
                    .addTo(this.map);
                // var features = e.features[0];
            });

            let busInfo = this.state.business.features[0].properties;
            let hours = busInfo.Hours;
            let website = 'unavailable';
            // console.log(value.data.data.result);
            if(busInfo.website) {
                // console.log('We have a website');
                website = '<a target="_blank" href="' + busInfo.website + '">' + 'Link' + '</a>';
            }

            new mapboxgl.Popup()
                .setLngLat(this.state.business.features[0].geometry.coordinates)
                .setHTML('<b>' + busInfo.Name + '</b>' + '<br><b>Rating:</b> ' + busInfo.Rating + '<br><b>Address:</b> ' + busInfo.Address + '<br><b>Phone:</b> ' + busInfo.Phone + '<br><b>Website: </b>' + website + '<br><b>Hours:</b> ' + hours )
                .addTo(this.map);
        });

        // this.displayCurrentState();
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {


    }

    render(){
        const { business } = this.state;

        if(business){
            return(
                <Fragment>

                    <div id='map'>
                        <div id="div" className="mapboxgl-ctrl-bottom-right">
                            <a onClick={this.createDirections} className="directions-btn"><i className="material-icons
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

export default withRouter(LocateByBusId);