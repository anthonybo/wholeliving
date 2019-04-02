import React, {Component} from 'react';
import axios from 'axios';

class Test extends Component {
    async componentDidMount() {
        const resp = await axios.get('/api/test');

        console.log('Response: ',resp);

        const postResp = await axios.post('/api/test', {
            message: 'Hello from the frontend',
            name: 'Jim Bob',
            food: ['pizza, donuts, beer, noodles']
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