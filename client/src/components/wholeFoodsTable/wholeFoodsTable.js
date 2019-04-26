import React, {Component, Fragment} from 'react';
import axios from 'axios';
import {withRouter, Link} from 'react-router-dom';
import AllWholeFoodsLocations from "../map/mapContainer";
import './wholeFoodsTable.scss';
import ReactDOM from "react-dom";
var zipcodes = require('zipcodes');

class WholeFoodsTable extends Component {

    state = {
        allWholeFoods: null,
        byState: null,
        byId: null,
        crossReferenceUserInput: null,
        crossReferenceWholeFoods: null,
        keyword: '',
        generalMap: false,
        userInput: [],
        byBusId: null,
        medianHousingPrices: [],
        city: '',
        nearByLocations: [],
        cityDesc: [],
        noResults: false,
        loadingTextDesc: true,
        loadingTextMedianHousing: true
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

    async getLocationByBusId(){
        let path = this.props.history.location.pathname.split('/');
        let id = path[2];

        let businessData = await axios.post(`/api/places/details`, {
            places_id: id
        });

        this.setState({
            byBusId: businessData
        })

        let userInputData = businessData.data.data.result;
        let hours = 'unavailable';
        let website = 'unavailable';
        let phone = 'unavailable';
        let userInput = [];

        if(userInputData.opening_hours){
            var d = new Date();
            // console.log(d.getDay()-1 );
            hours = userInputData.opening_hours.weekday_text[d.getDay()-1 ];
        }
        if(userInputData.website) {
            // console.log('We have a website');
            website = <a target="_blank" href={userInputData.website}>Link</a>;
        }
        if(userInputData.formatted_phone_number){
            phone = userInputData.formatted_phone_number
        }

        userInput.push(<tr className='white-text' key='1'><td><Link to={'/busLookup/'+ id}>[1]</Link></td><td>{userInputData.name}</td><td>{userInputData.formatted_address}</td><td>{phone}</td><td>{hours}</td><td>{website}</td></tr>)

        this.setState({
            userInput: userInput
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

            // this.nearByLocations(true);

            this.setState({
                crossReferenceUserInput: null,
                crossReferenceWholeFoods: null,
                keyword: keyword,
                noResults: true
            });

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
        this.housingMedian();
        this.walkScore();
        this.nearByLocations();
        this.wikiData();
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
        } else if (path.match('/busLookup/')){
            this.getLocationByBusId();
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

    async housingMedian(){
        // console.log('Getting Median Housing Prices....');
        let path = this.props.match;
        let keyword = path.params.keyword;
        let location = path.params.location;
        let range = path.params.range;
        let zip = 0;
        let medianHousingPricesList = [];
        let city = '';
        let state = '';

        var lookup = zipcodes.lookupByName(location, state);

        if(!lookup.length < 1){
            zip = lookup[0].zip;
        } else if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            // console.log('WHolfoods: ',this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.Zip);
            zip = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.Zip;
            city = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.City.substr(1);
            state = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.State;
        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            // let wfContainer = document.getElementById('wf-container');
            // wfContainer.style.display === 'hide';
            // console.log('Busness Zip: ',this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(3));
            zip = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(4);
            city = this.props.match.params.location;
            state = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(1,2);
        }

        zip = zip.substring(0, 5);

        let medianHousingPrices = await axios.post(`/api/housing/median`, {
            zip: zip
        });

        if(medianHousingPrices.data.median_prices.quandl_error !== undefined) {
            console.log('Failed to get median price data!, Running counter measures...')
            var rad = zipcodes.radius(zip, 5);
            for(var index = 0; index < rad.length; index++){
                medianHousingPrices = await axios.post(`/api/housing/median`, {
                    zip: rad[index]
                });

                if(medianHousingPrices.data.median_prices.quandl_error == undefined){
                    break;
                }
            }
        }

        if(medianHousingPrices.data.median_prices.hasOwnProperty('dataset')){
            for(const [index, value] of medianHousingPrices.data.median_prices.dataset.data.entries()) {
                // console.log(value);
                medianHousingPricesList.push(<tr className='white-text' key={index}>
                    <td>{value[0]}</td>
                    <td>${value[1].toLocaleString()}</td>
                </tr>)
            }
        } else {
            medianHousingPricesList.push(<tr className='white-text' key='0912389123'>
                <td>No Data Available</td>
                <td>No Data Available</td>
            </tr>);
            location = 'unavailable'
        }


        this.setState({
            medianHousingPrices: medianHousingPricesList,
            city: location,
            loadingTextMedianHousing: false
        })
    }

    async walkScore(){
        // Walk Score Resource: https://www.walkscore.com/professional/api.php
        const circle = document.querySelector('.js-circle');
        const circleBike = document.querySelector('.js-bike-circle');
        const scoreText = document.querySelector('.js-text');
        const scoreBikeText = document.querySelector('.js-bike-text');
        const scoreDescText = document.querySelector('.score-desc-text');
        const scoreBikeDescText = document.querySelector('.score-bike-desc-text');
        let address = '';
        let lat = 0;
        let lng = 0;

        if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            address = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.Address;
            lat = this.state.crossReferenceWholeFoods.data.geoJson.features[0].geometry.coordinates[1];
            lng = this.state.crossReferenceWholeFoods.data.geoJson.features[0].geometry.coordinates[0];

        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            // console.log(this.state.crossReferenceUserInput);
            lat = this.state.crossReferenceUserInput.features[0].geometry.coordinates[1];
            lng = this.state.crossReferenceUserInput.features[0].geometry.coordinates[0];
            address = this.state.crossReferenceUserInput.features[0].properties.Address;
        }

        let walkScore = await axios.post(`/api/walkscore`, {
            address: address,
            lat: lat,
            lng: lng
        });

        let walkscoreNum = 0;
        let walkingDesc = 'unavailable';
        let bikescoreNum = 0;
        let bikeDesc = 'unavailable';
        if(walkScore.data.walkscore.hasOwnProperty('bike')){
            bikescoreNum = walkScore.data.walkscore.bike.score;
            bikeDesc = walkScore.data.walkscore.bike.description;
        }

        if(walkScore.data.walkscore.hasOwnProperty('walkscore')){
            walkscoreNum = walkScore.data.walkscore.walkscore;
            walkingDesc = walkScore.data.walkscore.description;
        }

        const radius = circle.getAttribute('r');
        const diameter = Math.round(Math.PI * radius * 2);
        const getOffset = (val = 0) => Math.round((100 - val) / 100 * diameter);

        const bikeradius = circleBike.getAttribute('r');
        const bikediameter = Math.round(Math.PI * bikeradius * 2);
        const bikegetOffset = (val = 0) => Math.round((100 - val) / 100 * bikediameter);

        circle.style.strokeDashoffset = getOffset(walkscoreNum);
        circleBike.style.strokeDashoffset = bikegetOffset(bikescoreNum);

        scoreText.textContent = `${walkscoreNum}%`;
        scoreDescText.textContent = `${walkingDesc}`;

        scoreBikeText.textContent = `${bikescoreNum}%`;
        scoreBikeDescText.textContent = `${bikeDesc}`;
    }

    nearByLocations(noLocations){

        // Zip Code Resource: https://www.npmjs.com/package/zipcodes
        let zip = 0;
        let city = '';
        let cityList = [];
        let nearByLocations = [];

        if(noLocations){
            console.log('We have no locations, FALL BACK PLAN!')
            zip = 92653;
        } else if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            zip = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.Zip;
            city = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.City.substr(1)

        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            zip = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(4);
            city = this.props.match.params.location;
        }

        let radius = zipcodes.radius(zip, 10);
        // radius = radius.slice(0,10);
        for(let index = 0; index < radius.length; index++){
            var lookup = zipcodes.lookup(radius[index]);
            // console.log(lookup.city);
            cityList.push(lookup.city);
        }

        cityList = cityList.filter((item,index,self) => self.indexOf(item)==index);
        cityList = cityList.slice(0,10);

        for(const [index, value] of cityList.entries()) {
            nearByLocations.push(<span className='city-items' onClick={() => this.updateLocation(value)} value={value} key={index}>
                {value}
            </span>)

            // nearByLocations.push(<tr className='white-text' onClick={() => this.updateLocation(value)} value={value} key={index}>
            //     <td>{value}</td>
            // </tr>)
        }
        this.setState({
            nearByLocations: nearByLocations
        })
    }

    updateLocation(city){
        let path = this.props.match;
        let keyword = path.params.keyword;
        let location = path.params.location;
        let range = path.params.range;
        let state = '';

        if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            state = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.State;
        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            state = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(1,2);
        }
        this.props.history.push(`/crossReference/` + keyword + '/' + city+','+state + '/' + range);
    }

    async wikiData(){
        let state = '';
        let city = '';
        let cityDesc = [];

        if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            state = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.State;
            // city = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.City.substr(1);
        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            state = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(1,2);
            // city = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[1].substr(1);
        }

        city = this.props.match.params.location;

        if (city.indexOf(',') > -1){
            city = city.substr(0,city.length-3)
        }

        city = city.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        let cityInfo = await axios.post('/api/wiki', {
            city: city,
            state: state
        });

        cityInfo = cityInfo.data.wiki.query.pages;
        cityInfo = cityInfo[Object.keys(cityInfo)[0]].extract;

        if(cityInfo == undefined){
            cityInfo = 'Sorry, data currently unavailable.';
        }

        cityDesc.push(<tr className='white-text' key='123890'><td>{cityInfo}</td></tr>)
        this.setState({
            cityDesc: cityDesc,
            loadingTextDesc: false
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const path = this.props.history.location.pathname;

        if(prevProps.location.pathname !== this.props.location.pathname){
            if(path === '/'){
                this.getAllWholeFoods();
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    generalMap: true,
                    noResults: false
                })
            } else if (path === '/generalMap'){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    generalMap: true,
                    noResults: false
                })

            } else if (path.match('/byState/') ){
                this.getWholeFoodsByState();
            } else if (path.match('/location/') ){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    noResults: false
                })
                this.getLocationById();
            } else if (path.match('/crossReference/')){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null,
                    medianHousingPrices: [],
                    nearByLocations: [],
                    city: '',
                    cityDesc: [],
                    noResults: false,
                    loadingTextDesc: true,
                    loadingTextMedianHousing: true
                })
                this.crossReference();
            } else if (path.match('/busLookup/')){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    noResults: false
                })
                this.getLocationByBusId();
            }
            const node = ReactDOM.findDOMNode(this);
            let elem = null;

            if (node instanceof HTMLElement) {
                elem = document.querySelector('.collapsible.popout');
            }

            M.Collapsible.init(elem, {
                accordion: true
            });

            var instance = M.Collapsible.getInstance(elem);

            instance.close(0);
            instance.close(1);
            instance.close(2);
            instance.close(3);
        }
    }

    async getDetailedData(places_id){
        let detailedData = await axios.post(`/api/places/details`, {
            places_id: places_id
        });

        return detailedData;
    }

    createTableEntriesForUserSelection(){
        const userInput = [];
        let placeId = '';

        for(const [index, original_value] of this.state.crossReferenceUserInput.features.entries()){
            // console.log(value.properties.PlaceId);
            let getMoreData = this.getDetailedData(original_value.properties.PlaceId);
            getMoreData.then((value)=> {
                let userInputData = value.data.data.result;
                let hours = 'unavailable';
                let website = 'unavailable';
                let phone = 'unavailable';
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
                if(value.data.data.result.formatted_phone_number){
                    phone = userInputData.formatted_phone_number
                }
                placeId = original_value.properties.PlaceId;

                userInput.push(<tr className='white-text' key={index}><td><Link to={'/busLookup/'+ placeId}>[{index+1}]</Link></td><td>{userInputData.name}</td><td>{userInputData.formatted_address}</td><td>{phone}</td><td>{hours}</td><td>{website}</td></tr>)
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

            if(this.state.noResults){
                items.push(<tr className='white-text' key='1342'><td></td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td></tr>)
            }
            else if(this.state.allWholeFoods){
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
            this.state.keyword = this.state.keyword.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            // console.log('We have wholefoods cross reference data!');
            if(this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1){
                items.push(<tr className='white-text' key='1342'><td></td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td></tr>)
            } else {
                for(const [index, value] of this.state.crossReferenceWholeFoods.data.geoJson.features.entries()){
                    // console.log(value.properties);
                    items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
                }
            }

            return(
                <Fragment>
                    <ul className="collapsible popout">
                        <li id='wf-container'>
                            <div className="collapsible-header"><i className="material-icons">filter_drama</i>Whole Foods [{this.state.crossReferenceWholeFoods.data.geoJson.features.length}]</div>
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
                            <div className="collapsible-header"><i className="material-icons">place</i>{this.state.keyword} [{this.state.userInput.length}]</div>
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
                        <li>
                            <div className="collapsible-header"><i className="material-icons">local_atm</i>
                                {
                                    this.state.loadingTextMedianHousing ? <span className='wait'>Median Housing - Loading</span> : <span>Median Housing [{this.state.city}]</span>
                                }
                            </div>
                            <div className="collapsible-body">
                                <table className='responsive-table'>
                                    <thead>
                                    <tr className='white-text'>
                                        <th>Date</th>
                                        <th>Price</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {this.state.medianHousingPrices}
                                    </tbody>
                                </table>
                            </div>
                        </li>

                        <li>
                            <div className="collapsible-header"><i className="material-icons">description</i>
                                {
                                    this.state.loadingTextDesc ? <span id='wait' className='wait'>City Description - Loading</span> : <span id='wait' className=''>City Description</span>
                                }
                            </div>
                            <div className="collapsible-body">
                                <table className='centered'>
                                    <tbody>
                                    {this.state.cityDesc}
                                    </tbody>
                                </table>
                            </div>
                        </li>
                    </ul>

                    <ul className="city-hList">
                        <li>
                            <span className="city-menu">
                                <h2 className="city-menu-title">Nearby Cities</h2>
                                <ul className="city-menu-dropdown">
                                    {this.state.nearByLocations}
                                </ul>
                            </span>
                        </li>
                    </ul>

                    <div className='scores-container'>
                        <svg className="score" width="200" height="200" viewBox="-25 -25 400 400">
                            <circle className="score-empty" cx="175" cy="175" r="175" strokeWidth="25"
                                    fill="none"></circle>
                            <circle className="js-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175"
                                    r="175" strokeDasharray="1100" strokeWidth="25" strokeDashoffset="1100"
                                    fill="none"></circle>
                            <text className="js-text score-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                            <text className="score-text-name" x="50%" y="50%" dx="-25" textAnchor="middle">WalkScore</text>
                            <text className="score-desc-text" x="50%" y="60%" dx="-25" textAnchor="middle"></text>
                        </svg>

                        <svg className="bike-score" width="200" height="200" viewBox="-25 -25 400 400">
                            <circle className="score-empty" cx="175" cy="175" r="175" strokeWidth="25"
                                    fill="none"></circle>
                            <circle className="js-bike-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175"
                                    r="175" strokeDasharray="1100" strokeWidth="25" strokeDashoffset="1100"
                                    fill="none"></circle>
                            <text className="js-bike-text score-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                            <text className="score-text-name" x="50%" y="50%" dx="-25" textAnchor="middle">BikeScore</text>
                            <text className="score-bike-desc-text" x="50%" y="60%" dx="-25" textAnchor="middle"></text>
                        </svg>
                    </div>
                </Fragment>
            )
        } else if (this.state.generalMap) {
            return (
                <ul className="collapsible popout">
                    <li></li>
                </ul>
            )
        } else if (this.state.byBusId){
            return(
                <ul className="collapsible popout">
                    <li>
                        <div className="collapsible-header"><i className="material-icons">place</i>{this.state.byBusId.data.data.result.name}</div>
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