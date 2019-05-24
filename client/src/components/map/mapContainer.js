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
            mapType = <AllWholeFoodsLocations email={this.props.email} user_id={this.props.user_id}/>;
        } else if (path === '/generalMap'){
            mapType = <GeneralMap/>
        } else if (path.match('/byState/') ){
            mapType = <LocationByState email={this.props.email} user_id={this.props.user_id}/>;
        } else if (path.match('/location/') ){
            mapType = <LocatonById email={this.props.email} user_id={this.props.user_id}/>;
        } else if (path.match('/crossReference/')) {
            mapType = <CrossReference email={this.props.email} user_id={this.props.user_id}/>;
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