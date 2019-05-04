import React, {Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Places from './places/places';
import Modal from './general/modal';
import {Link} from "react-router-dom";
import logo from "../../dist/logo_transparent2.png";

export default (props) => {

    return (
        <Fragment>
            <Places/>
            <MapContainer/>
            <WholeFoodsTable/>
            <Modal/>
        </Fragment>
    )
};