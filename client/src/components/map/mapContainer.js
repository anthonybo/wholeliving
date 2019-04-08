import React, {Component, Fragment} from 'react';
import AllWholeFoodsLocations from './allWholeFoodsLocations';
import GeneralMap from './generalMap';
import {withRouter} from 'react-router-dom';
import LocationByState from './locateByState';
import LocatonById from './locateById';


class MapContainer extends Component {


    componentDidMount() {
        // this.createMap();
        // this.getData();
    }

    render(){
        // console.log(this.props.location.pathname);

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
        }

        return(
                <Fragment>
                    {mapType}
                </Fragment>
            )
    }
}

export default withRouter(MapContainer);