import React, {Component, Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Places from './places/places';
import Modal from './general/modal';
import {Link} from "react-router-dom";
import logo from "../../dist/logo_transparent2.png";
import Login from "./login/login";

class Homepage extends Component {
    state = {
        email: '',
        user_id: 0
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

    render(){
        return(
            <Fragment>
                <Places/>
                <MapContainer/>
                <WholeFoodsTable email={this.state.email} user_id={this.state.user_id}/>
                <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
            </Fragment>
        )
    }
}

export default Homepage;