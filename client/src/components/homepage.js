import React, {Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Places from './places/places';
import Modal from './general/modal';

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