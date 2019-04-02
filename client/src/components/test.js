import React, {Component} from 'react';
import axios from 'axios';

class Test extends Component {
    async componentDidMount() {
        const resp = await axios.get('/api/test');

        console.log('Response: ',resp);

        const postResp = await axios.post('/api/test', {
            lat: 34.0459443,
            lng: -118.2575671,
            state: 'CA'
        });

        console.log('Post Response: ', postResp);
    }

    render() {
        return(
            <h1>This is a test component</h1>
        )

    }
}

export default Test;