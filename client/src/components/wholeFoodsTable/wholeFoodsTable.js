import React, {Component} from 'react';
import axios from 'axios';
import {withRouter, Link} from 'react-router-dom';
import AllWholeFoodsLocations from "../map/mapContainer";
import './wholeFoodsTable.scss';
import ReactDOM from "react-dom";

class WholeFoodsTable extends Component {

    state = {
        allWholeFoods: null,
        byState: null,
        byId: null,
        crossReferenceUserInput: null,
        crossReferenceWholeFoods: null,
        keyword: '',
        generalMap: false,
        userInput: []
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

    async crossReference(){
        // console.log('Whole Foods Table Cross Reference!');
        let path = this.props.match;
        let keyword = path.params.keyword;
        let location = path.params.location;
        let range = path.params.range;
        let lat = '';
        let lng = '';

        let userInput = await axios.post(`/api/places`, {
            keyword: keyword,
            location: location
        });

        userInput = userInput.data.geoJson;

        if(userInput.features.length > 0){
            lat = userInput.features[0].geometry.coordinates[1];
            lng = userInput.features[0].geometry.coordinates[0];
        } else {
            // console.log('Whole Foods Table: We have no results!');

            M.toast({
                html: 'We have no results, please try a new search!',
                displayLength: 2000,
                classes: 'pulse'
            })
        }

        let wholefoods = await axios.post('/api/geoSpacial', {
            lat: lat,
            lng: lng,
            range: range
        });

        this.setState({
            crossReferenceUserInput: userInput,
            crossReferenceWholeFoods: wholefoods,
            keyword: keyword
        })
        this.createTableEntriesForUserSelection();

    }

    componentDidMount() {
        const path = this.props.history.location.pathname;

        if(path === '/'){
            this.getAllWholeFoods();
        } else if (path === '/generalMap'){
            this.setState({
                allWholeFoods: null,
                byState: null,
                byId: null,
                generalMap: true
            })
        } else if (path.match('/byState/') ){
            this.getWholeFoodsByState();
        } else if (path.match('/location/') ){
            this.getLocationById();
        } else if (path.match('/crossReference/')){
            this.crossReference();
        }

        const node = ReactDOM.findDOMNode(this);
        let elem = null;

        if (node instanceof HTMLElement) {
            elem = document.querySelector('.collapsible.popout');
        }

        var instance = M.Collapsible.init(elem, {
            accordion: true
        });
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
                    byId: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    generalMap: true
                })

            } else if (path.match('/byState/') ){
                this.getWholeFoodsByState();
            } else if (path.match('/location/') ){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null
                })
                this.getLocationById();
            } else if (path.match('/crossReference/')){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null
                })
                this.crossReference();

            }
            const node = ReactDOM.findDOMNode(this);
            let elem = null;

            if (node instanceof HTMLElement) {
                elem = document.querySelector('.collapsible.popout');
            }

            var instance = M.Collapsible.init(elem, {
                accordion: true
            });
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

    createTableEntriesForUserSelection(){
        const userInput = [];

        for(const [index, value] of this.state.crossReferenceUserInput.features.entries()){
            // console.log(value.properties.PlaceId);
            let getMoreData = this.getDetailedData(value.properties.PlaceId);
            getMoreData.then((value)=> {
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
                    website = <a target="_blank" href={value.data.data.result.website}>Link</a>;
                }

                // console.log(value.data.data.result);
                var userInputData = value.data.data.result;
                userInput.push(<tr className='white-text' key={index}><td>[{index+1}]</td><td>{userInputData.name}</td><td>{userInputData.formatted_address}</td><td>{userInputData.formatted_phone_number}</td><td>{hours}</td><td>{website}</td></tr>)
                this.setState({
                    userInput: userInput
                })
            })
        }
    }

    render(){
        const items = [];
        const userInput = [];
        // console.log('State Response: ', this.state.resp);

        if(this.state.allWholeFoods){
            // console.log(this.state.resp.data.wholefoods);
            for(const [index, value] of this.state.allWholeFoods.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
            }
        } else if(this.state.byState){
            // console.log(this.state.byState.data.geoJson.features);
            for(const [index, value] of this.state.byState.data.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
            }
        } else if(this.state.byId){
            // console.log(this.state.byState.data.geoJson.features);
            for(const [index, value] of this.state.byId.data.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
            }
        } else if(this.state.crossReferenceUserInput && this.state.crossReferenceWholeFoods){
            // console.log('We have wholefoods cross reference data!');
            this.state.keyword = this.state.keyword.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            for(const [index, value] of this.state.crossReferenceWholeFoods.data.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
            }

            return(
            <ul className="collapsible popout">
                <li>
                    <div className="collapsible-header"><i className="material-icons">filter_drama</i>Whole Foods</div>
                    <div className="collapsible-body">
                        <table className='responsive-table'>
                            <thead>
                            <tr className='white-text'>
                                <th>#</th>
                                <th>State</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>Zip</th>
                                <th>Phone</th>
                                <th>Hours</th>
                            </tr>
                            </thead>

                            <tbody>
                            {items}
                            </tbody>
                        </table>
                    </div>
                </li>
                <li>
                    <div className="collapsible-header"><i className="material-icons">place</i>{this.state.keyword}</div>
                    <div className="collapsible-body">
                        <table className='responsive-table'>
                            <thead>
                            <tr className='white-text'>
                                <th>#</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Phone</th>
                                <th>Hours</th>
                                <th>Website</th>
                            </tr>
                            </thead>

                            <tbody>
                            {this.state.userInput}
                            </tbody>
                        </table>
                    </div>
                </li>
            </ul>
            )
        } else if (this.state.generalMap) {
            return (
                <ul className="collapsible popout">
                    <li></li>
                </ul>
            )
        }

        return(
            <ul className="collapsible popout">
                <li>
                    <div className="collapsible-header"><i className="material-icons">filter_drama</i>Whole Foods</div>
                    <div className="collapsible-body">
                        <table className='responsive-table'>
                            <thead>
                            <tr className='white-text'>
                                <th>#</th>
                                <th>State</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>Zip</th>
                                <th>Phone</th>
                                <th>Hours</th>
                            </tr>
                            </thead>

                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    </div>
                </li>
            </ul>
        )
    }
}

export default withRouter(WholeFoodsTable);