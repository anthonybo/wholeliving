import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';

class userMap extends Component {

    state = {
        usersObj: {},
        userCount: 0
    }

    createUserData() {
        if(this.props.users !== undefined){
            let users = JSON.parse(JSON.stringify(this.props.users));
            users = users.map(item =>{
                if(item.lat !== ''){
                    item.type = "Feature",
                        item.geometry = {
                            type:"Point",
                            coordinates:[item.lng, item.lat]
                        };
                    item.properties = {
                        Address: item['house_number']+ ' ' +item['road'],
                        City: item['city'],
                        State: item['state'],
                        SocketIP: item.socketIP,
                        SocketID: item.socketID
                    }

                    delete item.lng;
                    delete item.lat;
                    delete item.road;
                    delete item.house_number;
                    delete item.city;
                    delete item.state;
                    delete item.socketID;
                    delete item.socketIP;
                    return item;
                }
            })

            for(var index = 0; index < users.length; index++){
                if (users[index] == undefined){
                    users.splice(index, 1);
                }
            }

            // if(this.map !== undefined){
            //     // console.log('Map Exists!');
            //     var testRec = {
            //         type: "Feature",
            //         geometry: {
            //             type:"Point",
            //             coordinates:[-111.641, 35.1913]
            //         },
            //     properties: {
            //         Address: 'test',
            //         City: 'test',
            //         State: 'test',
            //     }
            //     }
            //     users.push(testRec)
            // }

            var usersObj = {
                geoJson: {
                    type: "FeatureCollection",
                    features: users
                }
            }

            usersObj = usersObj.geoJson;

            this.setState({
                usersObj: usersObj,
                userCount: usersObj.features.length
            })

            if(this.map !== undefined){
                // console.log('Map Exists!');
                this.map.getSource('users').setData(usersObj);
                this.map.setPaintProperty('user-point', 'circle-color', this.getRandomColor());
                this.map.setPaintProperty('user-point', 'circle-stroke-color', this.getRandomColor());

                this.map.panTo(usersObj.features[usersObj.features.length-1].geometry.coordinates);

                this.map.flyTo({
                    center: usersObj.features[usersObj.features.length-1].geometry.coordinates,
                    zoom: 18,
                    bearing: 45,
                    maxZoom: 18,
                    pitch: 45,
                    speed: 2, // make the flying slow
                    curve: 1, // change the speed at which it zooms out

                    easing: function (t) {
                        return t;
                    }
                });

            } else {
                this.createMap();
            }
        }
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    createMap =()=> {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            // center: this.state.center,
            // zoom: 10.6,
            // pitch: 45,
            // minZoom: 7,
            maxZoom: 18
        });

        this.map.fitBounds([-125.0011, 24.9493, -66.9326, 49.5904]);

        this.map.on('style.load', () => {
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
                eventHandler: ()=>{
                    this.map.setPitch(0);
                    this.map.fitBounds([-125.0011, 24.9493, -66.9326, 49.5904]);
                }
            });

            this.map.addControl(ctrlCenter, "top-left");


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
                    'circle-color': this.getRandomColor(),
                    'circle-stroke-color': this.getRandomColor(),
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
                e = e.features[0];

                var popup = new mapboxgl.Popup()
                    .setLngLat(e.geometry.coordinates)
                    .setHTML('<b>City:</b> ' + e.properties.City + '<br><b>State:</b> ' + e.properties.State + '<br><b>Address:</b> ' + e.properties.Address + '<br><b>IP:</b> ' + e.properties.SocketIP + '<br><b>Socket:</b> ' + e.properties.SocketID)
                    .addTo(this.map);
            });

            this.map.on('click', (e) => {
                const coordinates = e.lngLat;
                const currentZoom = this.map.getZoom();

                var zoom = this.map.getZoom();
                if(zoom < 17){
                    this.flyIntoCluster(this.map, coordinates, currentZoom);
                }
            });

            this.map.on('zoomend', (e)=>{
                var zoom = this.map.getZoom();
                // console.log(zoom);
                if(zoom < 8){
                    // this.map.setPitch(0);
                    // this.map.easeTo(latlng, zoom, bearing, 0, options);
                    this.map.easeTo({bearing:0, duration:1200, pitch:0});
                }
            })
        });
    }

    flyIntoCluster(map, coordinates, currentZoom){
        var zoom = map.getZoom();
        const maxZoom = 16;

        map.flyTo({
            center: coordinates,
            zoom: zoom < 17 ? zoom+2 : zoom,
            bearing: 0,
            maxZoom: 18,
            speed: 1, // make the flying slow
            curve: 1, // change the speed at which it zooms out

            easing: function (t) {
                return t;
            }
        });
    }

    componentDidMount() {
        this.createUserData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.users !== this.props.users){
            this.createUserData();
        }

        // if(this.map !== undefined){
        //     console.log('Map Exists!')
        // }
    }

    render(){
        return(
            <div id='map'>
                <span className="new badge green" data-badge-caption="Found">{this.state.userCount}</span>
            </div>
        )
    }
}

export default userMap;