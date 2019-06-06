import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';

class userMap extends Component {

    state = {
        usersObj: {}
    }

    createUserData() {
        if(this.props.users !== undefined){
            console.log(this.props.users)

            let users = this.props.users;

            users = users.map(item =>{
                if(item.lat !== ''){
                    console.log(item)
                    item.type = "Feature",
                        item.geometry = {
                            type:"Point",
                            coordinates:[item.lng, item.lat]
                        };
                    item.properties = {
                        Address: item['house_number']+item['road'],
                        City: item['city'],
                        State: item['state'],
                    }

                    delete item.lng;
                    delete item.lat;
                    delete item.road;
                    delete item.house_number;
                    delete item.city;
                    delete item.state;
                    return item;
                }
            })

            var usersObj = {
                geoJson: {
                    type: "FeatureCollection",
                    features: users
                }
            }

            this.setState({
                usersObj: usersObj
            })
        }
    }

    createMap =()=> {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            // center: this.state.center,
            // zoom: 10.6,
            // pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });

        this.map.fitBounds([-125.0011, 24.9493, -66.9326, 49.5904]);

        this.map.on('style.load', () => {
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
            this.map.addSource('users', {
                type: 'geojson',
                data: this.state.usersObj
            });

            // add circle layer here
            this.map.addLayer({
                id: 'user-point',
                type: 'circle',
                source: 'users',
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

            this.map.on('click', 'user-point', (e) => {

            });


        });
    }

    componentDidMount() {
        this.createUserData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(prevProps.users , ' ' , this.props.users)
        if(prevProps.users !== this.props.users){
            this.createUserData();
        }
    }

    render(){
        return(
            <div id='map'>
                <span className="new badge red" data-badge-caption="Found">5</span>
                <span className="new badge green" data-badge-caption="Found">10</span>
            </div>
        )
    }
}

export default userMap;