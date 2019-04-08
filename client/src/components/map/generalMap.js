import React, {Component, Fragment} from 'react';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBhZGlsbGExODg2IiwiYSI6ImNqc2t6dzdrMTFvdzIzeW41NDE1MTA5cW8ifQ.wmQbGUhoixLzuiulKHZEaQ';
import stateData from './us_states';
import axios from "axios";
import {withRouter} from 'react-router-dom';

class GeneralMap extends Component {

    createMap () {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/anthonybo/cjsyvu6032n4u1fo9vso1qzd4',
            center: [-97.2263, 37.7091],
            zoom: 2.6,
            pitch: 45,
            // minZoom: 7,
            // maxZoom: 20
        });

        var hoveredStateId =  null;


        this.map.on('style.load', () => {
            // this.rotateCamera(0);
            this.map.addControl(new mapboxgl.FullscreenControl());

            this.map.addSource("states", {
                "type": "geojson",
                // "data": "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
                "data": stateData
            });

            this.map.addLayer({
                "id": "state-fills",
                "type": "fill",
                "source": "states",
                "layout": {},
                "paint": {
                    "fill-color": "#627BC1",
                    "fill-opacity": ["case",
                        ["boolean", ["feature-state", "hover"], false],
                        1,
                        0.5
                    ]
                }
            });

            this.map.addLayer({
                "id": "state-borders",
                "type": "line",
                "source": "states",
                "layout": {},
                "paint": {
                    "line-color": "#627BC1",
                    "line-width": 2
                }
            });

            // When the user moves their mouse over the state-fill layer, we'll update the
// feature state for the feature under the mouse.
            this.map.on("mousemove", "state-fills", (e) => {
                if (e.features.length > 0) {
                    if (hoveredStateId) {
                        this.map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
                    }
                    hoveredStateId = e.features[0].id;
                    this.map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: true});
                }
            });

// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
            this.map.on("mouseleave", "state-fills", () => {
                if (hoveredStateId) {
                    this.map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
                }
                hoveredStateId =  null;
            });

            this.map.on("click", "state-fills", (e) => {
                console.log(e.features[0].properties);

                // console.log(hoveredStateId);

                this.locateWF(e.features[0].properties.STATE_ABB);
            });

        });
    }

    async locateWF(state){
        console.log('Locate the wfs function');
        console.log(this.props.history);



        const postResp = await axios.post('/api/wholefoods/state', {
            state: state
        });

        console.log(postResp.data.geoJson.features);

        let wholefoodsCount = postResp.data.geoJson.features.length;

        if(wholefoodsCount < 1){
            console.log('No Results!');

            M.toast({
                html: 'No Wholefoods! \n Search again!',
                displayLength: 2000,
                classes: 'pulse'
            })
        } else {
            this.props.history.push('/byState/' + state);
        }

    }

    componentDidMount() {
        this.createMap();
    }

    render() {
        return (
            <Fragment>
                <div id='map'></div>
            </Fragment>
        )
    }
}

export default withRouter(GeneralMap);