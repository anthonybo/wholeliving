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
                classes: 'pulse red darken-2'
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

        // this.refs.keyword.value = '';
        // this.refs.location.value = '';
        // this.refs.range.value = '';

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

        this.animatePlaceholder();

        let params = this.props.match.params;
        if('location' in params && params.keyword !== '' && params.location !== ''){
            this.setState({
                keyword: params.keyword,
                location: params.location
            });
            
            this.refs.keyword.value = params.keyword.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            this.refs.location.value = params.location.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let path = this.props.location.pathname;
        if(prevProps.location.pathname !== this.props.location.pathname) {
            if(!path.match('/crossReference/')){
                this.refs.keyword.value = '';
                this.refs.location.value = '';
                this.refs.range.value = '';
            }
        }
    }

    autoComplete = (value) => {
        // this.refs.keyword.value = '';
        // this.refs.location.value = '';
        // this.refs.range.value = '';

        this.setState({
            location: value
        })
        this.getData();
    }

    animatePlaceholder(){
        let phrases = [
            'Search Keyword',
            'Crossfit',
            '24 Hour Fitness',
            'LA Fitness',
            'Chipotle',
            'Anytime Fitness',
            'In N Out',
            'Planet Fitness',
            'Cinepolis Luxury Cinemas',
            'UFC',
            'Stadium Brewery',
            'Kinetic'
        ];

        // Will Print each word one by one
        // for (var index = 0; index < phrases.length; index++) {
        //     (function(index) {
        //         setTimeout(function() {
        //             // Created textNode to append
        //             document.getElementsByName('keyword')[0].placeholder=phrases[index];
        //
        //
        //         }, 3000 * index);
        //     }(index));
        // }

        // Will print each letter of each word one by one
        var  i = 0;
        var count = 0;
        var selectedText = '';
        var text = '';
        (function type () {
            if(window.location.pathname !== '/dashboard'){
                var delta = 200 - Math.random() * 100;
                if (count == phrases.length) {
                    count = 0;
                }
                selectedText = phrases[count];
                text = selectedText.slice(0, ++i);
                document.getElementsByName('keyword')[0].placeholder=text;
                if (text.length === selectedText.length) {
                    count++;
                    i = 0;
                }
                setTimeout(type, delta);
            }

        }());
    }

    render(){
        return(
            <div className='places-container '>
                <form className='row' onSubmit={this.handleSubmit}>
                    <div className="col s4">
                            <input id='search-keyword' className='white-text' type="text" keyword="keyword" name='keyword' ref='keyword' onChange={this.handleChange} autoComplete='off' placeholder='search keyword'/>
                    </div>
                    <div className="col s4 input-field">
                        <i className="material-icons prefix">textsms</i>
                        <input id="autocomplete-input" className='white-text autocomplete' type="text" location="location" name='location' ref='location' onChange={this.handleChange} autoComplete='off' placeholder='Enter location'/>
                    </div>
                    <div className="col s2">
                        <input className='white-text' type="number" min="5" range="range" name='range' ref='range' onChange={this.handleChange} autoComplete='off' placeholder='10m'/>
                    </div>
                    <div className="col s2">
                        <input onClick={this.handleSubmit} className='btn waves-effect waves-light hideThis' type="submit" value='submit'/>
                        <a onClick={this.handleSubmit} className="btn-floating btn waves-effect waves-light"><i className="material-icons
   right">search</i></a>
                    </div>
                </form>
            </div>
        )
    }
}

export default withRouter(Places);