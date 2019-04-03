import React, {Component, Fragment} from 'react';
import AllWholeFoodsLocations from './allWholeFoodsLocations';


class MapContainer extends Component {


    componentDidMount() {
        // this.createMap();
        // this.getData();
    }

    render(){
        return(
                <Fragment>
                    <AllWholeFoodsLocations/>
                </Fragment>
            )

    }
}

export default MapContainer;