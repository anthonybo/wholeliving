import React, {Component, Fragment} from 'react';
import axios from 'axios';
import {withRouter, Link} from 'react-router-dom';
import AllWholeFoodsLocations from "../map/mapContainer";
import './wholeFoodsTable.scss';
import ReactDOM from "react-dom";
var zipcodes = require('zipcodes');
import Walkscore from './walkscore';
const keys = require('../../../../keys');

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
        loadingTextMedianHousing: true,
        allWholeFoodsTable: [],
        wholeFoodsCount: 5,
        wholeFoodsIndex: 0,
        email: '',
        user_id: 0,
        byStateTable: [],
        crossReferenceWFItems: [],
        locationByIdItems: [],
        userInputCards: [],
        loading: false
    }

    async getAllWholeFoods(){
        const resp = await axios('/api/wholefoods');

        if(this.mounted) {
            this.setState({
                allWholeFoods: resp.data
            })
            this.getAllWholeFoodsCreateTable();
            this.fancyButtons();
        }
    }

    fancyButtons(){
        var btns = document.querySelectorAll('.btn-pagination');
        var paginationWrapper = document.querySelector('.pagination-wrapper');
        var bigDotContainer = document.querySelector('.big-dot-container');
        var littleDot = document.querySelector('.little-dot');

        for(var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', btnClick);
        }

        function btnClick() {
            if(this.classList.contains('btn--prev')) {
                paginationWrapper.classList.add('transition-prev');
            } else {
                paginationWrapper.classList.add('transition-next');
            }

            var timeout = setTimeout(cleanClasses, 500);
        }

        function cleanClasses() {
            if(paginationWrapper.classList.contains('transition-next')) {
                paginationWrapper.classList.remove('transition-next')
            } else if(paginationWrapper.classList.contains('transition-prev')) {
                paginationWrapper.classList.remove('transition-prev')
            }
        }
    }

    async getAllWholeFoodsCreateTable(){
        let items = [];
        let wholeFoodsCount = 10;
        let wholeFoodsIndex = 0;

        var behind = document.getElementById('behind');
        var forward = document.getElementById('forward');

        behind.addEventListener('click', async ()=> {
            if(this.state.wholeFoodsIndex >= 5 && this.state.wholeFoodsCount >= 10){
                this.state.wholeFoodsIndex -= 5;
                this.state.wholeFoodsCount -= 10;
                items = [];
                let wfDifference = this.state.wholeFoodsIndex - this.state.wholeFoodsCount;

                // console.log(this.state.wholeFoodsCount, ' ', this.state.wholeFoodsIndex);
                if( wfDifference > 5 || wfDifference < 5){
                    // console.error('We got an error! BEHIND');
                } else {
                    for(this.state.wholeFoodsCount; this.state.wholeFoodsCount < this.state.wholeFoodsIndex; this.state.wholeFoodsCount++){
                        // console.log('Count: ', this.state.wholeFoodsCount, ' ', wholeFoodsIndex);
                        // console.log(this.state.allWholeFoods.geoJson.features[this.state.wholeFoodsCount].properties);
                        let value = this.state.allWholeFoods.geoJson.features[this.state.wholeFoodsCount];

                        let star_type = await this.checkFavorites(value.id);

                        items.push(<tr className='white-text' key={this.state.wholeFoodsCount}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
                    }

                    this.setState({
                        allWholeFoodsTable: items,
                        wholeFoodsIndex: this.state.wholeFoodsIndex,
                        wholeFoodsCount: this.state.wholeFoodsCount
                    })
                }
            }
        })

        forward.addEventListener ('click', async ()=>{
            if(this.state.wholeFoodsIndex < 485){
                this.state.wholeFoodsIndex += 5;
                items = [];

                // console.log(this.state.wholeFoodsCount, ' ', this.state.wholeFoodsIndex);
                let wfDifference = this.state.wholeFoodsIndex - this.state.wholeFoodsCount;
                if( wfDifference > 5 || wfDifference < 5){
                    // console.error('We got an error! FORWARD');
                } else {
                    for(this.state.wholeFoodsCount; this.state.wholeFoodsCount < this.state.wholeFoodsIndex; this.state.wholeFoodsCount++){
                        // console.log('Count: ', this.state.wholeFoodsCount, ' ');
                        // console.log(this.state.allWholeFoods.geoJson.features[this.state.wholeFoodsCount].properties);
                        let value = this.state.allWholeFoods.geoJson.features[this.state.wholeFoodsCount];

                        let star_type = await this.checkFavorites(value.id);

                        items.push(<tr className='white-text' key={this.state.wholeFoodsCount}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
                    }

                    this.setState({
                        allWholeFoodsTable: items,
                        wholeFoodsIndex: this.state.wholeFoodsIndex,
                        wholeFoodsCount: this.state.wholeFoodsCount
                    })
                }
            }
        })

        for(const [index, value] of this.state.allWholeFoods.geoJson.features.entries()){
            // console.log(value.properties);
            if(index < this.state.wholeFoodsCount){
                let star_type = await this.checkFavorites(value.id);

                items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
                this.state.wholeFoodsIndex++;
            }
        }

        this.setState({
            allWholeFoodsTable: items,
            wholeFoodsIndex: this.state.wholeFoodsIndex
        })
    }

    async updateHomePageTable(){
        let items = [];
        let wholeFoodsCount = 10;
        let wholeFoodsIndex = 0;

        if(this.state.allWholeFoods !== null){
            for(const [index, value] of this.state.allWholeFoods.geoJson.features.entries()){
                if(index < this.state.wholeFoodsCount && this.state.wholeFoodsCount - index <= 5){
                    let star_type = await this.checkFavorites(value.id);

                    items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
                    // this.state.wholeFoodsIndex++;
                }
            }

            this.setState({
                allWholeFoodsTable: items,
                // wholeFoodsIndex: this.state.wholeFoodsIndex
            })
        }
    }

    async updateWFTableRecords(){
        let items = [];
        let wholeFoodsCount = 10;
        let wholeFoodsIndex = 0;

        if(this.state.allWholeFoods !== null){
            for(const [index, value] of this.state.allWholeFoods.geoJson.features.entries()){
                if(index < this.state.wholeFoodsCount && this.state.wholeFoodsCount - index <= 5){
                    let star_type = await this.checkFavorites(value.id);

                    items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
                    // this.state.wholeFoodsIndex++;
                }
            }

            this.setState({
                allWholeFoodsTable: items,
                // wholeFoodsIndex: this.state.wholeFoodsIndex
            })
        } else if(this.state.byState !== null){
            for(const [index, value] of this.state.byState.data.geoJson.features.entries()){
                let star_type = await this.checkFavorites(value.id);
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
            }

            this.setState({
                byStateTable: items
            })
        }
    }

    async checkFavorites(id){
        let checkFavorite = await axios.post('/api/user/check/favorites', {
            email: this.state.email,
            user_id: this.state.user_id,
            location: id
        })

        let star_type = 'star_border';

        if(checkFavorite.data.results.length > 0){
            star_type = 'star'
        }

        return star_type;
    }

    async addUserFavorite(location, fType) {
        let checkFavorite = await axios.post('/api/user/check/favorites', {
            email: this.state.email,
            user_id: this.state.user_id,
            location: location,
        })
        
        if(!checkFavorite.data.results.length > 0){
            let insertFavorite = await axios.post('/api/user/insert/favorites', {
                location: location,
                email: this.state.email,
                user_id: this.state.user_id
            })
            if(fType == 'cRef'){
                this.crossReferenceWFData();
            } else if (fType == 'byId'){
                this.locationByIdTable();
            } else {
                this.updateWFTableRecords();
            }
            // fType == 'cRef' ? this.crossReferenceWFData() : this.updateWFTableRecords();
        } else {
            let removeFavorites = await axios.post('/api/user/remove/favorites', {
                location: location,
                user_id: this.state.user_id
            })
            if(fType == 'cRef'){
                this.crossReferenceWFData();
            } else if (fType == 'byId'){
                this.locationByIdTable();
            } else {
                this.updateWFTableRecords();
            }
            // fType == 'cRef' ? this.crossReferenceWFData() : this.updateWFTableRecords();
        }
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

        this.createTableForStates();
    }

    async getLocationById(){
        let path = this.props.history.location.pathname;
        let id = path.match( /location\/(\d+)/ )[1];

        let wholefoods = await axios.post('/api/location', {
            id: id
        });

        if(this.mounted){
            this.setState({
                byId: wholefoods
            })

            this.locationByIdTable();
            this.housingMedian();
            this.walkScore();
            this.wikiData();
        }

    }

    async locationByIdTable(){
        let items = [];

        if(this.state.byId !== null){
            for(const [index, value] of this.state.byId.data.geoJson.features.entries()){
                let star_type = await this.checkFavorites(value.id);
                // console.log('Email: ', this.state.email);
                // console.log(value.id);
                // console.log(value.properties);
                // items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td>{value.properties.Hours}</td></tr>)
                items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id, 'byId')}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
            }

            this.setState({
                locationByIdItems: items
            })
        }
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
            var currentDay = d.getDay()-1;
            if(d.getDay()-1 < 0){
                currentDay = 6;
            }
            hours = userInputData.opening_hours.weekday_text[currentDay];
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

        this.housingMedian();
        this.walkScore();
        this.wikiData();
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

        for(const [index, original_value] of userInput.features.entries()){
            let checkBusinessFavorite = await axios.post('/api/user/get/business/favorites', {
                user_id: this.state.user_id,
                business_id: original_value.reference
            })

            if(checkBusinessFavorite.data.success){
                original_value.inDB = true;
            } else {
                original_value.inDB = false;
            }
        }

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
                classes: 'pulse noResultsToast'
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
        this.crossReferenceWFData();
        this.housingMedian();
        this.walkScore();
        this.nearByLocations();
        this.wikiData();
    }

    async crossReferenceWFData () {
        let items = [];

        if(this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1){
            items.push(<tr className='white-text' key='1342'><td></td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td></tr>)
        } else {
            for(const [index, value] of this.state.crossReferenceWholeFoods.data.geoJson.features.entries()){
                let star_type = await this.checkFavorites(value.id);
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id, 'cRef')}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
            }
        }

        this.setState({
            crossReferenceWFItems: items
        })
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        const path = this.props.history.location.pathname;

        if(this.props.email !== '' && this.props.user_id !== 0){
            console.log('Email: ',this.props.email);
            console.log('User ID: ',this.props.user_id);

            this.setState({
                email: this.props.email,
                user_id: this.props.user_id
            })
        }

        if(path === '/'){
            this.getAllWholeFoods();
        } else if (path === '/generalMap'){
            this.setState({
                allWholeFoods: null,
                byState: null,
                byId: null,
                generalMap: true,
                byStateTable: []
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
        var lookup = '';

        if(location !== undefined){
            lookup = zipcodes.lookupByName(location, state);
        }

        if(!lookup.length < 1){
            zip = lookup[0].zip;
        } else if (this.state.byBusId !== null){
            zip = this.state.byBusId.data.data.result.formatted_address.split(",")[2].substr(4);
        } else if(this.state.byId !== null){
            zip = this.state.byId.data.geoJson.features[0].properties.Zip;
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

        zip = zip.substr(0, 5);

        let medianHousingPrices = await axios.post(`/api/housing/median`, {
            zip: zip
        });

        if(medianHousingPrices.data.median_prices.quandl_error !== undefined) {
            // console.log('Failed to get median price data!, Running counter measures...')
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
        const arrow_container = document.querySelector('.arrow-container');
        const median_text = document.querySelector('.js-median-text');

        if(medianHousingPrices.data.median_prices.hasOwnProperty('dataset') && median_text !== null){
            const arrow_svg = document.querySelector('.arrow-svg');
            const arrow_bottom_txt = document.querySelector('.median-text-btm');
            const line = document.querySelector('line');
            const polygon = document.querySelector('polygon');


            let medianPrice = medianHousingPrices.data.median_prices.dataset.data;
            median_text.textContent = `$${medianPrice[0][1].toLocaleString()}`;
            arrow_container.style.display = 'block';
            if(medianPrice[0][1] - medianPrice[1][1] < 0){
                arrow_svg.style.transform = "rotate(90deg)";
                arrow_bottom_txt.style.transform = 'rotate(270deg) translate(-78%,31%)';
                line.style.stroke = 'red';
                polygon.style.fill = 'red';
            } else {
                arrow_svg.style.transform = "rotate(-90deg)";
                arrow_bottom_txt.style.transform = 'rotate(90deg)';
                line.style.stroke = 'green';
                polygon.style.fill = 'green';
            }

            for(const [index, value] of medianHousingPrices.data.median_prices.dataset.data.entries()) {
                // console.log(value);
                medianHousingPricesList.push(<tr className='white-text' key={index}>
                    <td>{value[0]}</td>
                    <td>${value[1].toLocaleString()}</td>
                </tr>)
            }
        } else {
            if(arrow_container !== null){
                arrow_container.style.display = 'none';
                medianHousingPricesList.push(<tr className='white-text' key='0912389123'>
                    <td>No Data Available</td>
                    <td>No Data Available</td>
                </tr>);
                location = 'unavailable'
            }
        }


        if(this.mounted){
            this.setState({
                medianHousingPrices: medianHousingPricesList,
                city: location,
                loadingTextMedianHousing: false
            })
        }

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

        if(this.state.byBusId !== null){
            address = this.state.byBusId.data.data.result.formatted_address;
            lat = this.state.byBusId.data.data.result.geometry.location.lat;
            lng = this.state.byBusId.data.data.result.geometry.location.lng;
        } else if(this.state.byId !== null){
            address = this.state.byId.data.geoJson.features[0].properties.Address;
            lat = this.state.byId.data.geoJson.features[0].geometry.coordinates[1];
            lng = this.state.byId.data.geoJson.features[0].geometry.coordinates[0];
        } else if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
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

        if(circle !== null){
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
        let path = this.props.location.pathname;

        if(this.mounted && path.match('/crossReference/')) {
            this.setState({
                nearByLocations: nearByLocations
            })

            this.props.onNearbyCity(nearByLocations);
        }
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

        if(this.state.byBusId !== null){
            state = this.state.byBusId.data.data.result.formatted_address.split(",")[2].substr(1,3);
            city = this.state.byBusId.data.data.result.formatted_address.split(",")[1].substr(1);
        } else if(this.state.byId !== null){
            state = this.state.byId.data.geoJson.features[0].properties.State;
            city = this.state.byId.data.geoJson.features[0].properties.City.substr(1);
        } else if(!this.state.crossReferenceWholeFoods.data.geoJson.features.length < 1) {
            state = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.State;
            // city = this.state.crossReferenceWholeFoods.data.geoJson.features[0].properties.City.substr(1);
        } else if (!this.state.crossReferenceUserInput.features.length < 1) {
            state = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[2].substr(1,2);
            // city = this.state.crossReferenceUserInput.features[0].properties.Address.split(",")[1].substr(1);
        }

        if(this.props.match.params.location !== undefined){
            city = this.props.match.params.location;

            if (city.indexOf(',') > -1){
                city = city.substr(0,city.length-3)
            }
            city = city.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        let cityInfo = await axios.post('/api/wiki', {
            city: city,
            state: state
        });

        cityInfo = cityInfo.data.wiki.query.pages;
        cityInfo = cityInfo[Object.keys(cityInfo)[0]].extract;

        if(cityInfo == undefined){
            cityInfo = 'Sorry, data currently unavailable.';
        }

        cityDesc.push(<tr className='white-text' key='123890'><td dangerouslySetInnerHTML={{__html: cityInfo}} /></tr>);
        this.setState({
            cityDesc: cityDesc,
            loadingTextDesc: false
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const path = this.props.history.location.pathname;

        if(this.props.email !== prevState.email && this.props.user_id !== prevState.user_id){
            this.setState( {
                email: this.props.email,
                user_id: this.props.user_id
            })
            // this.getAllWholeFoodsCreateTable();
            this.updateHomePageTable();
            this.createTableForStates();
            this.locationByIdTable();
            this.crossReference();
        }

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
                    noResults: false,
                    medianHousingPrices: [],
                    cityDesc: [],
                    loadingTextDesc: true,
                    byBusId: null,
                    allWholeFoodsTable: [],
                    wholeFoodsCount: 5,
                    wholeFoodsIndex: 0,
                    byStateTable: [],
                    crossReferenceWFItems: [],
                    locationByIdItems: [],
                    loading: false
                })
            } else if (path === '/generalMap'){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    byId: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    generalMap: true,
                    noResults: false,
                    medianHousingPrices: [],
                    cityDesc: [],
                    loadingTextDesc: true,
                    byBusId: null,
                    allWholeFoodsTable: [],
                    wholeFoodsCount: 5,
                    wholeFoodsIndex: 0,
                    byStateTable: [],
                    crossReferenceWFItems: [],
                    locationByIdItems: [],
                    loading: false
                })

            } else if (path.match('/byState/') ){
                this.getWholeFoodsByState();
            } else if (path.match('/location/') ){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    noResults: false,
                    medianHousingPrices: [],
                    cityDesc: [],
                    loadingTextDesc: true,
                    byBusId: null,
                    allWholeFoodsTable: [],
                    wholeFoodsCount: 5,
                    wholeFoodsIndex: 0,
                    byStatTable: [],
                    crossReferenceWFItems: [],
                    locationByIdItems: [],
                    loading: false
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
                    loadingTextMedianHousing: true,
                    byBusId: null,
                    allWholeFoodsTable: [],
                    wholeFoodsCount: 5,
                    wholeFoodsIndex: 0,
                    byStateTable: [],
                    crossReferenceWFItems: [],
                    locationByIdItems: [],
                    loading: false
                })
                this.crossReference();
            } else if (path.match('/busLookup/')){
                this.setState({
                    allWholeFoods: null,
                    byState: null,
                    crossReferenceUserInput: null,
                    crossReferenceWholeFoods: null,
                    noResults: false,
                    medianHousingPrices: [],
                    cityDesc: [],
                    loadingTextDesc: true,
                    byBusId: null,
                    allWholeFoodsTable: [],
                    wholeFoodsCount: 5,
                    wholeFoodsIndex: 0,
                    byStateTable: [],
                    crossReferenceWFItems: [],
                    locationByIdItems: [],
                    loading: false
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

    async createTableEntriesForUserSelection(){
        const userInput = [];
        const userInputCards = [];
        let placeId = '';

        this.setState({
            loading: true
        })

        for(const [index, original_value] of this.state.crossReferenceUserInput.features.entries()){
            let getMoreData = await this.getDetailedData(original_value.properties.PlaceId);
            let value = getMoreData;
            let userInputData = value.data.data.result;
            let hours = 'unavailable';
            let website = 'unavailable';
            let phone = 'unavailable';
            if(value.data.data.result.opening_hours){
                var d = new Date();
                hours = value.data.data.result.opening_hours.weekday_text[d.getDay()-1 ];
            }
            if(value.data.data.result.website) {
                website = <a target="_blank" href={value.data.data.result.website}>Link</a>;
            }
            if(value.data.data.result.formatted_phone_number){
                let unformatted_phone = '';
                phone = userInputData.formatted_phone_number;
                unformatted_phone = phone.replace(/\D+/g, "");
                phone = <a href={'tel:'+unformatted_phone}>{phone}</a>
            }
            placeId = original_value.properties.PlaceId;
            // console.log(userInputData.photos[0].photo_reference);
            // userInput.push(<tr className='white-text' key={index}><td><Link to={'/busLookup/'+ placeId}>[{index+1}]</Link></td><td>{userInputData.name}</td><td>{userInputData.formatted_address}</td><td>{phone}</td><td>{hours}</td><td>{website}</td></tr>)

            let photoLink = '';
            if('photos' in userInputData){
                let photoLength = userInputData.photos.length;
                photoLength = Math.floor(Math.random() * photoLength);

                let photoSrc = await axios.post('/api/places/getImage', {
                    photoreference: userInputData.photos[photoLength].photo_reference
                })

                photoLink = photoSrc.data.url;

                // photoLink = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${userInputData.photos[photoLength].photo_reference}&sensor=false&key=${googlePlaces}`;
            } else {
                photoLink = `https://cdn.pixabay.com/photo/2018/06/26/01/20/connection-lost-3498366_960_720.png`;
            }
            let reviews = [];
            if('reviews' in userInputData){
                let reviewLength = userInputData.reviews.length;
                reviewLength = Math.floor(Math.random() * reviewLength);
                reviews.push(userInputData.reviews[reviewLength]);
            }

            userInputCards.push(<div key={index} className="card">
                <div className="card-image waves-effect waves-block waves-light">
                    {
                        photoLink !== '' ? <img className="activator" src={photoLink}/> : null
                    }
                </div>
                <div className="card-content">
                    {
                        this.state.email !== '' ? original_value.inDB ? <span onClick={() =>this.removeBusinessFavorite(original_value.properties.PlaceId)} className='userBusinessFavorite'><i className='material-icons'>star</i></span> :
                        <span onClick={() =>this.addBusinessFavorite(original_value.properties.PlaceId,userInputData.name,original_value.properties.Address)} className='userBusinessFavorite'><i className='material-icons'>star_border</i></span> : null
                    }

                    {/*<span onClick={() =>this.addBusinessFavorite(original_value.properties.PlaceId)} className='userBusinessFavorite'><i className='material-icons'>{original_value.inDB ? 'star' : 'star_border'}</i></span>*/}
                    <span className="card-title activator grey-text text-darken-4">{userInputData.name}<i
                        className="material-icons right">more_vert</i></span>
                    <div className="card-action">
                        <p className='card-website-directions'><a href={value.data.data.result.website} target='_blank'>website</a></p>
                        <p className='card-website-directions'><a href={'/busLookup/'+ placeId}>Directions</a></p>
                    </div>
                </div>
                <div className="card-reveal">
                    <span className="card-title grey-text text-darken-4">{userInputData.name}<i
                        className="material-icons right close-card">close</i></span>
                    <hr/>
                    <p>{'rating' in userInputData ? 'Rating: '+userInputData.rating : null}</p>
                    <p>{phone}</p>
                    <p>{hours !== 'unavailable' ? hours : null}</p>
                    <p>{userInputData.formatted_address}</p>
                    {reviews.length > 0 ? <hr/> : null}
                    <p>{reviews.length > 0 ? 'Random Review:' : null}</p>
                    <p>{reviews.length > 0 ? reviews[0].text : null}</p>
                </div>
            </div>
            )
        }
        let path = this.props.location.pathname;

        if(this.mounted && path.match('/crossReference/')) {
            this.props.onCrossReference(userInputCards);

            this.setState({
                userInput: userInput,
                userInputCards: userInputCards,
                loading: false
            })
        } else if(path.match('/busLookup/')) {
            this.setState({
                loading: false
            })
        }
    }

    async addBusinessFavorite(id, name, addr){
        let insertFavorite = await axios.post('/api/user/insert/business/favorites', {
            user_id: this.state.user_id,
            business_id: id,
            business_name: name,
            business_addr: addr
        })

        this.updateBusinessFavorites();
    }

    async removeBusinessFavorite(id){
        let removeFavorite = await axios.post('/api/user/delete/business/favorites', {
            user_id: this.state.user_id,
            business_id: id
        })

        this.updateBusinessFavorites();
    }

    async updateBusinessFavorites() {
        for(const [index, original_value] of this.state.crossReferenceUserInput.features.entries()){
            let checkBusinessFavorite = await axios.post('/api/user/get/business/favorites', {
                user_id: this.state.user_id,
                business_id: original_value.reference
            })

            if(checkBusinessFavorite.data.success){
                original_value.inDB = true;
            } else {
                original_value.inDB = false;
            }
        }

        this.createTableEntriesForUserSelection();
    }

    async createTableForStates(){
        const items = [];

        if(this.state.byState !== null){
            for(const [index, value] of this.state.byState.data.geoJson.features.entries()){
                let star_type = await this.checkFavorites(value.id);
                // console.log(value.properties);
                items.push(<tr className='white-text' key={index}>{this.state.email !== '' ? <td onClick={() => this.addUserFavorite(value.id)}><i className='material-icons star-hover '>{star_type}</i></td> : null}<td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.properties.State}</td><td>{value.properties.Address}</td><td>{value.properties.City}</td><td>{value.properties.Zip}</td><td>{value.properties.Phone}</td><td className='tooltip'>{value.properties.Hours.substr(0,12)}<span className="tooltiptext">{value.properties.Hours}</span></td></tr>)
            }

            if(this.mounted) {
                this.setState({
                    byStateTable: items
                })
            }
        }
    }

    render(){
        let path = this.props.location.pathname;
        const items = [];
        const userInput = [];
        if(this.state.noResults){
            items.push(<tr className='white-text' key='1342'><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td><td>unavailable</td></tr>)
            return(
                <Fragment>
                    <ul className="collapsible popout">
                        <li></li>
                    </ul>
                </Fragment>

            )
        } else if(this.state.allWholeFoods){
        // console.log(this.state.resp.data.wholefoods);
        } else if(this.state.byState){
        // console.log(this.state.byState.data.geoJson.features);
        } else if(this.state.byId){

        return(
            <Fragment>
                <ul className="collapsible popout">
                    <li>
                        <div className="collapsible-header"><i className="material-icons">local_atm</i>
                            {
                                this.state.loadingTextMedianHousing ? <span className='wait'>Median Housing - Loading</span> : <span>Median Housing</span>
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
            </Fragment>
        )
    } else if(this.state.crossReferenceUserInput && this.state.crossReferenceWholeFoods && path.match('/crossReference/')){
        // this.state.keyword = this.state.keyword.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return(
            <Fragment>
                <ul className="collapsible popout">
                    <li id='wf-container'>
                        <div className="collapsible-header"><i className="material-icons">filter_drama</i>Whole Foods [{this.state.crossReferenceWholeFoods.data.geoJson.features.length}]</div>
                        <div className="collapsible-body">
                            <table className='responsive-table'>
                                <thead>
                                <tr className='white-text'>
                                    {this.state.email !== '' ? <th> </th> : null}
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
                                {this.state.crossReferenceWFItems}
                                </tbody>
                            </table>
                        </div>
                    </li>
                    <li>
                        <div className="collapsible-header"><i className="material-icons">local_atm</i>
                            {
                                this.state.loadingTextMedianHousing ? <span className='wait'>Median Housing - Loading</span> : <span>Median Housing</span>
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
                {
                    this.state.loading ?
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>
                        :null
                }
            </Fragment>
        )
    } else if (this.state.generalMap) {
        return (
            <Fragment>
                <ul className="collapsible popout">
                    <li></li>
                </ul>
            </Fragment>
        )
    } else if (this.state.byBusId){
        return(
            <Fragment>
                <ul className="collapsible popout">
                    <li>
                        <div className="collapsible-header"><i className="material-icons">local_atm</i>
                            {
                                this.state.loadingTextMedianHousing ? <span className='wait'>Median Housing - Loading</span> : <span>Median Housing</span>
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
            </Fragment>
        )
    }

    return(
        <Fragment>
            <ul className="collapsible popout">
                <li>
                    <div className="collapsible-header"><i className="material-icons">filter_drama</i>Whole Foods
                        {
                            this.state.byStateTable.length > 0 ? ' ['+this.state.byStateTable.length+']' : null
                        }
                    </div>
                    <div className="collapsible-body">
                        <table className='responsive-table'>
                            <thead>
                            <tr className='white-text'>
                                {this.state.email !== '' ? <th> </th> : null}
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
                                {
                                    this.state.byStateTable.length > 0 ? this.state.byStateTable : this.state.allWholeFoodsTable
                                }
                            </tbody>
                        </table>

                            {
                                this.state.byStateTable.length > 0 ? <span></span> :
                                 <Fragment>
                                 <br/><br/>
                                 <div className="pagination-wrapper">
                                    <svg className="btn-pagination btn--prev" id='behind' height="96" viewBox="0 0 24 24" width="96" xmlns="">
                                    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                                    <path d="M0-.5h24v24H0z" fill="none"/>
                                    </svg>

                                    <div className="pagination-container">
                                        <div className="little-dot  little-dot--first"></div>
                                        <div className="little-dot">
                                            <div className="big-dot-container">
                                            <div className="big-dot"></div>
                                        </div>
                                        </div>
                                        <div className="little-dot  little-dot--last"></div>
                                    </div>

                                    <svg className="btn-pagination btn--next" id='forward' height="96" viewBox="0 0 24 24" width="96" xmlns="">
                                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                                    <path d="M0-.25h24v24H0z" fill="none"/>
                                    </svg>
                                </div>
                                 </Fragment>
                            }
                    </div>
                </li>
            </ul>
        </Fragment>
        )
    }
}

export default withRouter(WholeFoodsTable);