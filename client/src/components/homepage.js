import React, {Fragment} from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';

export default (props) => {

    return (
        <Fragment>
            <MapContainer/>
            <WholeFoodsTable/>
        </Fragment>
    )
};