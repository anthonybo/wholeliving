import React, {Component, Fragment} from 'react';
import Modal from '../general/modal';
import axios from 'axios';
import {Link} from "react-router-dom";
import './dashboard.scss';

class Dashboard extends Component {

    state={
        email: '',
        user_id: 0,
        userFavorites: []
    }

    handleEmailChange=(email)=>{
        this.setState({
            email: email
        })

        // this.props.onEmailChange(email);
    }

    handleIdChange=(user_id)=>{
        this.setState({
            user_id: user_id
        })

        // this.props.onIdChange(user_id);
    }

    async getUserRecords(){
        const items = [];

        let userRecords = await axios.post('/api/user/get/favorites', {
            email: this.state.email,
            user_id: this.state.user_id
        })

        for(let [index, value] of userRecords.data.results.entries()){
            // console.log(value);
            items.push(<tr className='white-text' key={index}><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.state}</td><td>{value.address}</td><td>{value.city}</td><td>{value.zip}</td><td>{value.phone}</td><td className='tooltip'>{value.hours.substr(0,12)}<span className="tooltiptext">{value.hours}</span></td></tr>)
        }

        this.setState({
            userFavorites: items
        })
    }

    componentDidMount() {
        this.getUserRecords();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.email !== this.state.email){
            this.getUserRecords();
        }
    }

    render(){
        if(this.state.email == ''){
            return (
                <Fragment>
                    <h5 className='white-text'>PLEASE REGISTER...</h5>
                    <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
                </Fragment>
            )
        } else {
            return(
                <Fragment>
                    <div className='dashboard-header'>
                        {/*<h1 className='dashboard-main-title white-text'>Dashboard</h1>*/}
                        <h4 className='dashboard-title white-text'>Hello, {this.state.email}</h4>
                    </div>
                    {/*<div className='white-text center-align'>This is our dashboard for [{this.state.email}]</div>*/}

                    <table className='responsive-table'>
                        <thead>
                        <tr className='white-text'>
                            <th>#</th>
                            <th>State</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Zip</th>
                            <th>Phone</th>
                            <th>Hours</th>
                        </tr>
                        </thead>

                        <tbody>
                        {this.state.userFavorites}
                        </tbody>
                    </table>

                    <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
                </Fragment>
            )
        }

    }
}

export default Dashboard;