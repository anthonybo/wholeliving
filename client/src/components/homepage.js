import React, {Component, Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Places from './places/places';
import Modal from './general/modal';
import {Link} from "react-router-dom";
import logo from "../../dist/logo_transparent2.png";
import Login from "./login/login";
import Walkscore from './wholeFoodsTable/walkscore';
import {withRouter} from 'react-router-dom';

class Homepage extends Component {
    state = {
        email: '',
        user_id: 0,
        nearByLocations: [],
        cards: []
    }

    handleEmailChange=(email)=>{
        this.setState({
            email: email
        })
    }

    handleIdChange=(user_id)=>{
        this.setState({
            user_id: user_id
        })
    }

    nearbyCity=(cities)=>{
        this.setState({
            nearByLocations: cities
        })
    }

    crossReference=(cards)=>{
        this.setState({
            cards: cards
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.location.pathname !== this.props.location.pathname){
            this.setState({
                nearByLocations: [],
                cards: []
            })
        }
    }

    render(){
        let path = this.props.location.pathname;
        let walkscoreDisplay = null;

        if (path.match('/crossReference/') || path.match('/busLookup/') || path.match('/location/')) {
            walkscoreDisplay = <Walkscore/>;
        }
        return(
            <Fragment>
                <Places/>
                <MapContainer email={this.state.email} user_id={this.state.user_id}/>
                {
                    this.state.nearByLocations.length > 0 ?
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
                        : null
                }
                {
                    walkscoreDisplay !== null ? walkscoreDisplay : null
                }
                {
                    this.state.cards.length > 0 ?
                    <div className='userInputCardsContainer'>
                        {this.state.cards}
                    </div>
                        :null
                }
                <WholeFoodsTable email={this.state.email} user_id={this.state.user_id} onNearbyCity={this.nearbyCity} onCrossReference={this.crossReference}/>
                <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
            </Fragment>
        )
    }
}

export default withRouter(Homepage);