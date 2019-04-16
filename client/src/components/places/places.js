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
        // console.log('Grabbing Data from Google!');

        // let data = await axios.post(`/api/places`, {
        //     keyword: this.state.keyword,
        //     location: this.state.location
        // });

        // console.log(data);
        console.log('State At Push Time: ', this.state);
        if(this.state.keyword && this.state.location){
            // console.log('Props: ', this.props );
            this.props.history.push(`/crossReference/` + this.state.keyword + '/' + this.state.location + '/' + this.state.range);
        }
    }

    handleChange = (event) => {
        // console.log('Setting Original State')
        // console.log('New Location: ',this.refs.location.value);

        this.setState({
            [event.target.name]: event.target.value
        });

        // console.log(this.state);
    }

    handleSubmit = (event) => {
        // console.log(event.target.form.clear());
        console.log(this.refs.location.value);
        var newLoc = this.refs.location.value;

        if(this.refs.location.value !== ''){
            console.log('Setting new state: ', newLoc);
            this.setState({
                location: newLoc,
            }, ()=>{
                console.log('Callback State?: ',this.state);
                if(!this.state.keyword || !this.state.location){
                    // alert('Please Complete Both Fields!');
                    // M.toast({
                    //     html: 'Please complete both fields!',
                    //     displayLength: 2000,
                    //     classes: 'pulse'
                    // })
                } else {
                    this.props.history.push(`/crossReference/` + this.state.keyword + '/' + this.state.location + '/' + this.state.range);
                }
            });
        }

        this.refs.keyword.value = '';
        this.refs.location.value = '';
        this.refs.range.value = '';

        // alert('A name was submitted: ' + this.state.keyword + ' ' + this.state.location);
        if(!this.state.keyword || !this.state.location){
            // alert('Please Complete Both Fields!');
            console.log('Here?');
            M.toast({
                html: 'Please complete both fields!',
                displayLength: 2000,
                classes: 'pulse'
            })
        }
        event.preventDefault();
        this.getData();
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        let elems = null;

        if (node instanceof HTMLElement) {
            elems = node.querySelector('.autocomplete');
        }
        // var elems = document.querySelector('.autocomplete');
        var instances = M.Autocomplete.init(elems, {minLength: 2, limit: 10});

        instances.updateData(Cities);

        // instances.open();
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
                        <input className='btn waves-effect waves-light' type="submit" value='submit'/>
                    </div>
                </form>
            </div>
        )
    }
}

export default withRouter(Places);