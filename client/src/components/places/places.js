import React, {Component} from 'react';
import axios from "axios";
import {withRouter} from 'react-router-dom';
// import Places from "google-places-web";
// import axios from 'axios';
// const Places = require("google-places-web").default; // instance of GooglePlaces Class;
// Places.apiKey = "AIzaSyD-NNZfs0n53D0caUB0M_ERLC2n9psGZfc";
// Places.debug = __DEV__; // boolean;
import M from "materialize-css";

class Places extends Component {

    state = {
        keyword: '',
        location: '',
        range: 10
    }

    async getData(){
        // console.log('Grabbing Data from Google!');

        // let data = await axios.post(`/api/places`, {
        //     keyword: this.state.keyword,
        //     location: this.state.location
        // });

        // console.log(data);
        if(this.state.keyword && this.state.location){
            // console.log('Props: ', this.props );
            this.props.history.push(`/crossReference/` + this.state.keyword + '/' + this.state.location + '/' + this.state.range);
        }
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit = (event) => {
        // console.log(event.target.form.clear());
        this.refs.keyword.value = '';
        this.refs.location.value = '';
        this.refs.range.value = '';

        // alert('A name was submitted: ' + this.state.keyword + ' ' + this.state.location);
        if(!this.state.keyword || !this.state.location){
            alert('Please Complete Both Fields!');
        }
        event.preventDefault();
        this.getData();
    }

    componentDidMount() {
        // this.getData();
        // M.AutoInit();
    }

    render(){
        return(
            <div className='places-container '>
                <form className='row' onSubmit={this.handleSubmit}>
                    <div className="col s4">
                            <input className='white-text' type="text" keyword="keyword" name='keyword' ref='keyword' onChange={this.handleChange} autoComplete='off' placeholder='search keyword'/>
                    </div>
                    <div className="col s4">
                            <input className='white-text' type="text" location="location" name='location' ref='location' onChange={this.handleChange} autoComplete='off' placeholder='location'/>
                    </div>
                    <div className="col s3">
                        <input className='white-text' type="text" range="range" name='range' ref='range' onChange={this.handleChange} autoComplete='off' placeholder='distance default 10'/>
                    </div>
                    <div className="col s12">
                        <input className='btn waves-effect waves-light' type="submit" value='submit'/>
                    </div>
                </form>
            </div>
        )
    }
}

export default withRouter(Places);