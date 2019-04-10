import React, {Component} from 'react';
import axios from "axios";
// import Places from "google-places-web";
// import axios from 'axios';
// const Places = require("google-places-web").default; // instance of GooglePlaces Class;
// Places.apiKey = "AIzaSyD-NNZfs0n53D0caUB0M_ERLC2n9psGZfc";
// Places.debug = __DEV__; // boolean;

class Places extends Component {

    state = {
        keyword: '',
        location: ''
    }

    async getData(){
        console.log('Grabbing Data from Google!');

        let wholefoods = await axios.post(`/api/places`, {
            keyword: this.state.keyword,
            location: this.state.location
        });

        console.log(wholefoods);

    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit = (event) => {
        alert('A name was submitted: ' + this.state.keyword + ' ' + this.state.location);
        event.preventDefault();
        this.getData();
    }

    componentDidMount() {
        // this.getData();
    }

    render(){
        return(
            <div className='places-container '>
                <form className='row' onSubmit={this.handleSubmit}>
                    <div className=" col s6">
                        <label>
                            Keyword:
                            <input className='white-text' type="text" keyword="keyword" name='keyword' onChange={this.handleChange}/>
                        </label>
                    </div>
                    <div className="col s6">
                        <label>
                            Location:
                            <input className='white-text' type="text" location="location" name='location' onChange={this.handleChange}/>
                        </label>
                    </div>
                    <div className="col s12">
                        <input type="submit" value='submit'/>
                    </div>
                </form>
            </div>
        )
    }
}

export default Places;