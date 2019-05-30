const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
import React, {Component, Fragment} from 'react';
import axios from 'axios';
import './map.scss';
import {withRouter, Link} from 'react-router-dom';

class CrossReference extends Component {

    state = {
        wholefoods: null,
        wholefoodsLength: 0,
        keyword: null,
        keywordLength: 0,
        center: [-97.2263, 37.7091],
        loading: false,
        noResults: false,
        email: '',
        user_id: 0,
        popup: null,
        coords: []
    }

    async getData() {
        this.setState({
            loading: true
        })
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
        // console.log(userInput);

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

        if(this.mounted){
            this.setState({
                wholefoods: wholefoodsLimited,
                wholefoodsLength: wholefoodsLimitedLength,
                keyword: userInput,
                keywordLength: userInput.features.length,
                center: center
            })

            if(wholefoodsLimited !== null){
                this.createMap();
            } else {
                this.setState({
                    loading: false,
                    noResults: true
                })
            }
        }
    }

    async getDetailedData(places_id){
        // console.log('Getting Detailed Data...')
        let detailedData = await axios.post(`/api/places/details`, {
            places_id: places_id
        });
        // console.log(detailedData);

        return detailedData;
    }

    displayCurrentState = () => {
        let mapDiv = document.getElementById('map');
        let cityPre = document.createElement('pre');
        let citySpan = document.createElement('span');
        let keywordSpan = document.createElement('span');

        let path = this.props.match.params;
        let city = path.location;
        let keyword = path.keyword;
        keyword = keyword.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (city.indexOf(',') > -1){
            city = city.substr(0,city.length-3)
        }
        city = city.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        cityPre.id = 'currentStateContainer';
        citySpan.innerText = 'Current City: ' + city;
        keywordSpan.innerText = 'Keyword: ' + keyword;
        mapDiv.append(cityPre);
        cityPre.append(keywordSpan,citySpan);
    }

    createMap =()=> {
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
                    'circle-color': 'rgb(108,0,2)',
                    'circle-stroke-color': 'rgb(255,0,10)',
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

            this.map.on('click', 'keyword-point', (e) => {
                var favoriteElem = null;
                var self = this;
                if(this.state.email !== '' && this.state.user_id !== 0){
                    let star_type = this.businessCheckFavorites(e.features[0].properties.PlaceId);
                    star_type.then(doWork.bind(null, e.features));
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

                    self.setState({
                        loading: true
                    })
                    // console.log(e.features[0]);
                    let keyword = popValue[0];
                    let detailedData = self.getDetailedData(keyword.properties.PlaceId);

                    detailedData.then((value)=>{
                        let hours = 'unavailable';
                        let website = 'unavailable';
                        // console.log(value.data.data.result);
                        if(value.data.data.result.opening_hours){
                            var d = new Date();
                            // console.log(d.getDay()-1 );
                            hours = value.data.data.result.opening_hours.weekday_text[d.getDay()-1 ];
                        }
                        if(value.data.data.result.website) {
                            // console.log('We have a website');
                            website = '<a target="_blank" href="' + value.data.data.result.website + '">' + 'Link' + '</a>';
                        }

                        var popup = new mapboxgl.Popup()
                            .setLngLat(keyword.geometry.coordinates)
                            .setHTML('<b>' + '<a href="/busLookup/'+ keyword.properties.PlaceId +'">' + keyword.properties.Name + '</a>' +'</b>' + '<br><b>Rating:</b> ' + keyword.properties.Rating + '<br><b>Address:</b> ' + keyword.properties.Address + '<br><b>Phone:</b> ' + value.data.data.result.formatted_phone_number + '<br><b>Website: </b>' + website + '<br><b>Hours:</b> ' + hours + '<br/>' + favoriteElem)
                            .addTo(self.map);

                        self.setState({
                            loading: false,
                            popup: popup,
                            coords: keyword.geometry.coordinates
                        })

                        if(self.state.email !== '' && self.state.user_id !== 0){
                            var target = keyword.properties.PlaceId;
                            var name = keyword.properties.Name;
                            var address = keyword.properties.Address;
                            var elem = document.getElementById("favoriteLocation");
                            if(elem !== null){
                                elem.addEventListener('click', ()=>self.businessFavoriteLocation(target,name,address));
                            }
                        }
                    })
                }
            });
            this.setState({
                loading: false
            })

            // this.displayCurrentState();
        });
    }

    async businessFavoriteLocation (target,name,addr) {
        if(this.state.email !== ''){
            let checkBusinessFavorite = await axios.post('/api/user/get/business/favorites', {
                user_id: this.state.user_id,
                business_id: target
            })

            if(!checkBusinessFavorite.data.success){
                let insertFavorite = await axios.post('/api/user/insert/business/favorites', {
                    user_id: this.state.user_id,
                    business_id: target,
                    business_name: name,
                    business_addr: addr
                })
            } else {
                let removeFavorite = await axios.post('/api/user/delete/business/favorites', {
                    user_id: this.state.user_id,
                    business_id: target
                })
            }

            if(this.state.popup.isOpen()){
                this.state.popup.remove();
                this.map.fire('click', {lngLat: this.state.popup._lngLat, point: this.state.popup._pos});
            }
        } else {
            console.log('You must be logged in!')
        }
    }

    async businessCheckFavorites (target) {
        let checkBusinessFavorite = await axios.post('/api/user/get/business/favorites', {
            user_id: this.state.user_id,
            business_id: target
        })

        let star_type = '<i class="far fa-star"></i>';

        if(checkBusinessFavorite.data.success){
            star_type = '<i class="fas fa-star"></i>'
        }

        return star_type;
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
        // this.createMap();
        if(this.props.email !== '' && this.props.user_id !== 0){
            this.setState({
                email: this.props.email,
                user_id: this.props.user_id
            })
        }

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
                let currentStateContainer = document.getElementById('currentStateContainer');
                if(currentStateContainer !== null){
                    currentStateContainer.remove();
                }
            }
            this.getData();
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
        const { wholefoods, keyword, keywordLength, wholefoodsLength, loading } = this.state;

        if(loading){
            return (
                <Fragment>
                    <div id='map'>
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>

                        <span className="new badge red" data-badge-caption="Found">{keywordLength}</span>
                        <span className="new badge green" data-badge-caption="Found">{wholefoodsLength}</span>
                    </div>
                </Fragment>

            )
        } else if(wholefoods && keyword || this.state.noResults){
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