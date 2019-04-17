import React, {Component} from 'react';
import axios from "axios";
import {withRouter} from 'react-router-dom';
import ReactDOM from "react-dom";
// import Places from "google-places-web";
// import axios from 'axios';
// const Places = require("google-places-web").default; // instance of GooglePlaces Class;
// Places.apiKey = "AIzaSyD-NNZfs0n53D0caUB0M_ERLC2n9psGZfc";
// Places.debug = __DEV__; // boolean;
// import M from "materialize-css";
import Cities from './cities';

class Places extends Component {

    state = {
        keyword: '',
        location: '',
        range: 10,
        new_location: ''
    }

    async getData(){
        if(this.state.keyword && this.state.location){
            // console.log('Props: ', this.props );
            this.props.history.push(`/crossReference/` + this.state.keyword + '/' + this.state.location + '/' + this.state.range);
        } else {
            M.toast({
                html: 'Please complete both fields!',
                displayLength: 2000,
                classes: 'pulse'
            })
        }
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit = (event) => {
        var newLoc = this.refs.location.value;

        this.refs.keyword.value = '';
        this.refs.location.value = '';
        this.refs.range.value = '';

        event.preventDefault();
        this.getData();
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        let elems = null;

        if (node instanceof HTMLElement) {
            elems = node.querySelector('.autocomplete');
        }
        // var elems = document.querySelector('.autocomplete');     // OLD METHOD
        var instances = M.Autocomplete.init(elems, {minLength: 2, limit: 10, onAutocomplete: this.autoComplete});

        instances.updateData(Cities);

        instances.open();
    }

    autoComplete = (value) => {
        this.refs.keyword.value = '';
        this.refs.location.value = '';
        this.refs.range.value = '';

        this.setState({
            location: value
        })
        this.getData();
    }

    render(){
        return(
            <div className='places-container '>
                <form className='row' onSubmit={this.handleSubmit}>
                    <div className="col s4">
                            <input className='white-text' type="text" keyword="keyword" name='keyword' ref='keyword' onChange={this.handleChange} autoComplete='off' placeholder='search keyword'/>
                    </div>
                    <div className="col s4 input-field">
                        <i className="material-icons prefix">textsms</i>
                        <input id="autocomplete-input" className='white-text autocomplete' type="text" location="location" name='location' ref='location' onChange={this.handleChange} autoComplete='off' placeholder='location'/>
                    </div>
                    <div className="col s3">
                        <input className='white-text' type="number" min="5" range="range" name='range' ref='range' onChange={this.handleChange} autoComplete='off' placeholder='miles'/>
                    </div>
                    <div className="col s12">
                        <input onClick={this.handleSubmit} className='btn waves-effect waves-light' type="submit" value='submit'/>
                    </div>
                </form>
            </div>
        )
    }
}

export default withRouter(Places);