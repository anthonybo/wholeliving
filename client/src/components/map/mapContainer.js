import React, {Component, Fragment} from 'react';
import AllWholeFoodsLocations from './allWholeFoodsLocations';
import GeneralMap from './generalMap';
import {withRouter} from 'react-router-dom';
import LocationByState from './locateByState';
import LocatonById from './locateById';
import CrossReference from './crossReference';
import LocateByBusId from './locateByBusId';

class MapContainer extends Component {


    componentDidMount() {
        // this.createMap();
        // this.getData();
    }

    render(){
        let path = this.props.location.pathname;
        let mapType = null;

        if(path === '/'){
            mapType = <AllWholeFoodsLocations/>;
        } else if (path === '/generalMap'){
            mapType = <GeneralMap/>
        } else if (path.match('/byState/') ){
            mapType = <LocationByState/>;
        } else if (path.match('/location/') ){
            mapType = <LocatonById/>;
        } else if (path.match('/crossReference/')) {
            mapType = <CrossReference/>;
        } else if (path.match('/busLookup/')){
            mapType = <LocateByBusId/>
        }

        return(
                <Fragment>
                    {mapType}
                </Fragment>
            )
    }
}

export default withRouter(MapContainer);