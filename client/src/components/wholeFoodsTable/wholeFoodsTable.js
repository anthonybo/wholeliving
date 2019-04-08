import React, {Component} from 'react';
import axios from 'axios';
import {withRouter, Link} from 'react-router-dom';
import AllWholeFoodsLocations from "../map/mapContainer";
import './wholeFoodsTable.scss';

class WholeFoodsTable extends Component {

    state = {
        allWholeFoods: null,
        byState: null,
        byId: null
    }

    async getAllWholeFoods(){
        const resp = await axios('/api/wholefoods');

        // console.log(resp.data);

        this.setState({
            allWholeFoods: resp.data
        })
    }

    async getWholeFoodsByState(){
        let path = this.props.history.location.pathname;
        let state = path.match( /byState\/(\w\w)/ )[1];

        let wholefoods = await axios.post('/api/wholefoods/state', {
            state: state
        });

        this.setState({
            byState: wholefoods
        })
    }

    async getLocationById(){
        let path = this.props.history.location.pathname;
        let id = path.match( /location\/(\d+)/ )[1];

        let wholefoods = await axios.post('/api/location', {
            id: id
        });

        this.setState({
            byId: wholefoods
        })
    }

    async componentDidMount() {
        const path = this.props.history.location.pathname;

        if(path === '/'){
            this.getAllWholeFoods();
        } else if (path === '/generalMap'){
            this.setState({
                allWholeFoods: null,
                byState: null,
                byId: null
            })
        } else if (path.match('/byState/') ){
            this.getWholeFoodsByState();
        } else if (path.match('/location/') ){
            this.getLocationById();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const path = this.props.history.location.pathname;

        if(prevProps.location.pathname !== this.props.location.pathname){
            if(path === '/'){
                this.getAllWholeFoods();
            } else if (path === '/generalMap'){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null
                })
            } else if (path.match('/byState/') ){
                this.getWholeFoodsByState();
            } else if (path.match('/location/') ){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                })
                this.getLocationById();
            }
        }
    }

    render(){
        const items = [];
        // console.log('State Response: ', this.state.resp);

        if(this.state.allWholeFoods){
            // console.log(this.state.resp.data.wholefoods);
            for(const [index, value] of this.state.allWholeFoods.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<Link to={'/location/' + value.id} key={index}><li className='white-text wholefoods-details'>[{value.id}] {value.geometry.coordinates[1]} {value.geometry.coordinates[0]} {value.properties.State} {value.properties.Address} {value.properties.City} {value.properties.Zip} {value.properties.Phone} {value.properties.Hours}</li></Link>)
            }
        } else if(this.state.byState){
            // console.log(this.state.byState.data.geoJson.features);
            for(const [index, value] of this.state.byState.data.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<Link to={'/location/' + value.id} key={index}><li className='white-text wholefoods-details'>[{index+1}] {value.geometry.coordinates[1]} {value.geometry.coordinates[0]} {value.properties.State} {value.properties.Address} {value.properties.City} {value.properties.Zip} {value.properties.Phone} {value.properties.Hours}</li></Link>)
            }
        } else if(this.state.byId){
            // console.log(this.state.byState.data.geoJson.features);
            for(const [index, value] of this.state.byId.data.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<li key={index} className='white-text wholefoods-details'>[{index+1}] {value.geometry.coordinates[1]} {value.geometry.coordinates[0]} {value.properties.State} {value.properties.Address} {value.properties.City} {value.properties.Zip} {value.properties.Phone} {value.properties.Hours}</li>)
            }
        }

        return(
            <div>
                {items}
            </div>
        )
    }
}

export default withRouter(WholeFoodsTable);