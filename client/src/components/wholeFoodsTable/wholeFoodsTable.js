import React, {Component} from 'react';
import axios from 'axios';

class WholeFoodsTable extends Component {

    state = {
        resp: null
    }

    async componentDidMount() {
        const resp = await axios('/api/wholefoods');

        // console.log(resp.data);

        this.setState({
            resp: resp.data
        })
    }

    render(){
        const items = [];

        // console.log('State Response: ', this.state.resp);

        if(this.state.resp){
            // console.log(this.state.resp.data.wholefoods);
            for(const [index, value] of this.state.resp.geoJson.features.entries()){
                // console.log(value.properties);
                items.push(<li key={index} className='white-text'>[{value.id}] {value.geometry.coordinates[1]} {value.geometry.coordinates[0]} {value.properties.State} {value.properties.Address} {value.properties.City} {value.properties.Zip} {value.properties.Phone} {value.properties.Hours}</li>)
            }
        }


        return(
            <div>
                {items}
            </div>
        )
    }
}

export default WholeFoodsTable;