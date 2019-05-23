const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
import React, {Component, Fragment} from 'react';
import axios from 'axios';
import './map.scss';
import {withRouter} from 'react-router-dom';

class AllWholeFoodsLocations extends Component {

    state = {
        wholefoods: null,
        email: '',
        user_id: 0,
        popup: null,
        coords: []
    }

    async getData() {
        let wholefoods = await axios.get(`/api/wholefoods`);

        // console.log(wholefoods);

        wholefoods = wholefoods.data.geoJson;

        if(this.mounted){
            this.setState({
                wholefoods: wholefoods
            })
        }

        if(wholefoods !== null){
            this.createMap();
        }
    }

     createMap =()=> {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            // center: [-97.2263, 37.7091],
            zoom: 2.6,
            minZoom: 2,
            maxZoom: 18,
            pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });

        this.map.fitBounds([-125.0011, 24.9493, -66.9326, 49.5904]);

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
                eventHandler: ()=>{this.map.fitBounds([-125.0011, 24.9493, -66.9326, 49.5904]);}
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
                maxzoom: 6,
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
                minzoom: 5,
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

            this.map.on('click', (e) => {
                const cluster = this.map.queryRenderedFeatures(e.point, { layers: ["wholefoods-heat"] });
                const coordinates = e.lngLat;
                const currentZoom = this.map.getZoom();

                var zoom = this.map.getZoom();
                if(zoom < 17){
                    this.flyIntoCluster(this.map, coordinates, currentZoom);
                }
            })
        });
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
        if(this.props.email !== '' && this.props.user_id !== 0){
            this.setState({
                email: this.props.email,
                user_id: this.props.user_id
            })
        }

        // this.createMap();
        this.mounted = true;
        this.getData();
    }

    componentWillUnmount() {
        this.mounted = false;
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

export default withRouter(AllWholeFoodsLocations);