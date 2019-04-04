import React, {Component, Fragment} from 'react';
import AllWholeFoodsLocations from './allWholeFoodsLocations';
import GeneralMap from './generalMap';
import {withRouter} from 'react-router-dom';


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
        }

        return(
                <Fragment>
                    {mapType}
                </Fragment>
            )
    }
}

export default withRouter(MapContainer);