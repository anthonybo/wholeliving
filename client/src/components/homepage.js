import React, {Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import Places from './places/places';

export default (props) => {

    return (
        <Fragment>
            <Places/>
            <MapContainer/>
            <WholeFoodsTable/>
        </Fragment>
    )
};