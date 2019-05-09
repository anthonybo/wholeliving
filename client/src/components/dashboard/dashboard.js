import React, {Component, Fragment} from 'react';
import Modal from '../general/modal';
import axios from 'axios';
import {Link} from "react-router-dom";
import './dashboard.scss';

class Dashboard extends Component {

    state={
        email: '',
        user_id: 0,
        userFavorites: [],
        usersList: [],
        adminUserFavorites: [],
        adminUserFavoritesCurrentUser: ''
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
            items.push(<tr className='white-text' key={index}><td onClick={()=> this.removeItem(value.id, value.city)} className='dashboard-remove-item tooltipped' data-tooltip='Dashboard'><i className='far fa-trash-alt' aria-hidden="true"></i></td><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.state}</td><td>{value.address}</td><td>{value.city}</td><td>{value.zip}</td><td>{value.phone}</td><td className='tooltip'>{value.hours.substr(0,12)}<span className="tooltiptext">{value.hours}</span></td></tr>)
        }

        this.setState({
            userFavorites: items
        })
    }

    componentDidMount() {
        this.getUserRecords();

        if(this.state.email == 'admin@admin.com'){
            this.getUsers();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.email !== this.state.email){
            this.getUserRecords();
            if(this.state.email == 'admin@admin.com'){
                this.getUsers();
            }
        }

        let adminModal = document.getElementById('dashboard-admin-modal');
        if(adminModal !== null){
            adminModal.classList.remove('closed-admin-modal');
        }
    }

    async removeItem(location, city){
        let removeFavorites = await axios.post('/api/user/remove/favorites', {
            location: location,
            user_id: this.state.user_id
        })

        M.toast({
            html: `${city} has been removed!`,
            displayLength: 2000,
            classes: 'pulse, dashboard-toast'
        })

        this.getUserRecords();
    }

    async getUsers(){
        let items = [];

        let userData = await axios.post('/api/admin/get/users', {
            email: this.state.email,
            user_id: this.state.user_id
        })

        for(let [index, value] of userData.data.results.entries()){
            // console.log(value);
            items.push(<tr className='white-text' key={index}><td onClick={()=> this.removeUser(value.id)} className='dashboard-remove-item tooltipped' data-tooltip='Dashboard'><i className='far fa-trash-alt' aria-hidden="true"></i></td><td>{value.id}</td><td onClick={()=> this.adminGetUsersSaves(value.email, value.id)}>{value.email}</td><td>{value.lastLogin}</td><td>{value.ipv4}</td></tr>)
        }

        this.setState({
            usersList: items
        })
    }

    async adminGetUsersSaves(email, id) {
        const items = [];

        let userRecords = await axios.post('/api/user/get/favorites', {
            email: email,
            user_id: id
        })

        for(let [index, value] of userRecords.data.results.entries()){
            items.push(<tr className='white-text' key={index}><td onClick={()=> this.adminRemoveItem(value.id, value.city)} className='dashboard-remove-item tooltipped' data-tooltip='Dashboard'><i className='far fa-trash-alt' aria-hidden="true"></i></td><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.state}</td><td>{value.address}</td><td>{value.city}</td><td>{value.zip}</td><td>{value.phone}</td><td className='tooltip'>{value.hours.substr(0,12)}<span className="tooltiptext">{value.hours}</span></td></tr>)
        }

        if(items.length < 1){
            M.toast({
                html: `User has no saved cities`,
                displayLength: 2000,
                classes: 'pulse, dashboard-toast'
            })
        }

        this.setState({
            adminUserFavorites: items,
            adminUserFavoritesCurrentUser: email,
            adminUserFavoritesCurrentUserId: id
        })
    }

    async removeUser(id){
        let removeUserData = await axios.post('/api/admin/remove/user', {
            email: this.state.email,
            admin_id: this.state.user_id,
            user_id: id
        })

        this.getUsers();
    }

    async adminRemoveItem(location, city){
        let removeFavorites = await axios.post('/api/user/remove/favorites', {
            location: location,
            user_id: this.state.adminUserFavoritesCurrentUserId
        })

        M.toast({
            html: `${city} has been removed!`,
            displayLength: 2000,
            classes: 'pulse, dashboard-toast'
        })

        this.adminGetUsersSaves(this.state.adminUserFavoritesCurrentUser,this.state.adminUserFavoritesCurrentUserId);
    }

    closeAdminModal =()=> {
        let adminModal = document.getElementById('dashboard-admin-modal');
        adminModal.classList.add('closed-admin-modal');
    }

    render(){
        if(this.state.email == ''){
            return (
                <Fragment>
                    <h5 className='white-text center-align'>PLEASE LOGIN!</h5>
                    <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
                </Fragment>
            )
        } else {
            return(
                <Fragment>
                    <div className='dashboard-header'>
                        <h4 className='dashboard-title white-text'>Hello, {this.state.email}</h4>
                    </div>
                    {
                        this.state.userFavorites.length > 0 ?
                        <table className='responsive-table'>
                            <thead>
                            <tr className='white-text'>
                                <th></th>
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
                            : null
                    }
                    {
                        this.state.email == 'admin@admin.com' ?
                            <Fragment>
                                <h6 className='deep-orange-text'>[Admin Display]</h6>
                                <table className='responsive-table'>
                                    <thead>
                                    <tr className='white-text'>
                                        <th></th>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>Last Login</th>
                                        <th>IP</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {this.state.usersList}
                                    </tbody>
                                </table>
                                {
                                    this.state.adminUserFavorites.length >= 1 ?
                                        <div id= 'dashboard-admin-modal' className='dashboard-admin-modal closed-admin-modal'>
                                            <a onClick={this.closeAdminModal} id='close-admin-modal' className="close-admin-button"><i className="material-icons ion-close">close</i></a>
                                            <h6 className='pink-text'>Current User: <span className='light-green-text'>{this.state.adminUserFavoritesCurrentUser}</span></h6>
                                            <table className='table'>
                                                <thead>
                                                <tr className='white-text'>
                                                    <th></th>
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
                                                {this.state.adminUserFavorites}
                                                </tbody>
                                            </table>
                                        </div>
                                        : null
                                }

                            </Fragment>
                            : null
                    }
                    <Modal onEmailChange={this.handleEmailChange} onIdChange={this.handleIdChange}/>
                </Fragment>
            )
        }
    }
}

export default Dashboard;