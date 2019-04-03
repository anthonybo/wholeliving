import React, {Component} from 'react';
import axios from 'axios';

class Test extends Component {

    state = {
        resp: null
    }

    async componentDidMount() {
        const resp = await axios.get('/api/test');

        // console.log('Response: ',resp);

        this.setState({
            resp: resp
        })


        const postResp = await axios.post('/api/test', {
            lat: 34.0459443,
            lng: -118.2575671,
            state: 'CA'
        });

        // console.log('Post Response: ', postResp);
    }

    render() {

        const items = [];

        // console.log(this.state.resp);
        if(this.state.resp){
            // console.log(this.state.resp.data.wholefoods);
            for(const [index, value] of this.state.resp.data.wholefoods.entries()){
                items.push(<li key={index} className='white-text'>ID: {value.id} Lat: {value.lat} {value.lng} {value.state}</li>)
            }
            // for(let index = 0; index < this.state.resp.data.wholefoods.length; index++){
            //     console.log(this.state.resp.data.wholefoods[index].id);
            //     return (
            //         <h1 className='white-text'>ID: {this.state.resp.data.wholefoods[index].id}</h1>
            //     )
            // }

            // const wholeFoods = this.state.resp.data.wholefoods.map( wholeFoodsItem => {
            //     // return <PropertyCrimeEntry key={propertyItem['DR Number']}{...propertyItem}/>
            //     return <h1 className='white-text'>wholeFoodsItem</h1>
            // });
        }

        return(
            <div>
                {items}
            </div>
        )

    }
}

export default Test;