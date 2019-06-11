import React, {Component, Fragment} from 'react';
import Modal from '../general/modal';
import axios from 'axios';
import {Link} from "react-router-dom";
import './dashboard.scss';
import redMap from './redMapSmall.jpg';
import UserMap from '../map/userMap';
import {withRouter} from 'react-router-dom';

class Dashboard extends Component {

    state={
        email: '',
        user_id: 0,
        userFavorites: [],
        usersList: [],
        adminUserFavorites: [],
        adminUserFavoritesCurrentUser: '',
        userBusinessFavorites: [],
        userCount: 0,
        users: []
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

    async getUserBusinessFavorites() {
        let items = [];

        let userFavorites = await axios.post('/api/user/get/all/business/favorites', {
            user_id: this.state.user_id
        });

        for(let [index, value] of userFavorites.data.queryResults.entries()){
            let currCity = value.business_addr.split(',').length == 4 ? value.business_addr.split(',')[1] : value.business_addr.split(',')[2];
            items.push(<tr key={index} className='userBusinessFavoritesRow'><td className='dashboard-remove-item' onClick={()=> this.removeBusiness(value.business_id, value.business_name)} data-label="Remove"><i className='far fa-trash-alt' aria-hidden="true"></i></td><td data-label="Business Name"><Link to={'/busLookup/' + value.business_id}>{value.business_name}</Link></td><td data-label="Location" className='black-text'>{currCity}</td></tr>)

        }

        this.setState({
            userBusinessFavorites: items
        })
    }

    async removeBusiness(id, name){
        let deleteBusiness = await axios.post('/api/user/delete/business/favorites', {
            user_id: this.state.user_id,
            business_id: id
        })

        M.toast({
            html: `${name} has been removed!`,
            displayLength: 2000,
            classes: 'pulse, dashboard-toast'
        })

        this.getUserBusinessFavorites();

    }

    async getUserRecords(){
        const items = [];

        let userRecords = await axios.post('/api/user/get/favorites', {
            email: this.state.email,
            user_id: this.state.user_id
        })

        for(let [index, value] of userRecords.data.results.entries()){
            // console.log(value);
            items.push(<tr key={index} className='userWholeFoodsFavoritesRow'><td onClick={()=> this.removeItem(value.id, value.city)} className='dashboard-remove-item' data-label="Remove"><i className='far fa-trash-alt' aria-hidden="true"></i></td><td data-label="ID"><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td data-label="State">{value.state}</td><td data-label="City">{value.city}</td><td data-label="Phone">{value.phone}</td><td data-label="Hours" className='tooltipdashboard'>{value.hours.substr(0,12)}<span className="tooltiptextdashboard">{value.hours}</span></td></tr>)
        }

        this.setState({
            userFavorites: items
        })
    }

    componentDidMount() {
        this.getUserRecords();
        this.getUserBusinessFavorites();
        this.userCount();

        if(this.state.email == 'admin@admin.com'){
            this.getUsers();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(this.props.userCount !== prevProps.userCount){
            this.setState({
                userCount: this.props.userCount
            })
            if(this.props.userCount > prevProps.userCount){
                M.toast({
                    html: `We have a new user!`,
                    displayLength: 2000,
                    classes: 'pulse, dashboard-toast'
                })
            }

            this.userCount();
        }

        if(prevState.email !== this.state.email){
            this.getUserRecords();
            this.getUserBusinessFavorites();
            if(this.state.email == 'admin@admin.com'){
                this.getUsers();
            }
        }

        // if(this.props.location.pathname == '/dashboard'){
        //     console.log('We are on the dashbaord');
        //     const mainStyle = {
        //         backgroundImage: 'url(' + redMap + ')',
        //     };
        //
        //     let main = document.querySelector('main');
        //     if(main !== undefined){
        //         main.setAttribute('style', 'background: url(' + redMap + ')');
        //     }
        // }

        let adminModal = document.getElementById('dashboard-admin-modal');
        if(adminModal !== null){
            adminModal.classList.remove('closed-admin-modal');
        }
    }

    componentWillUnmount() {
        let main = document.querySelector('main');
        if(main !== undefined){
            main.setAttribute('style', '');
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
            var d = new Date(Date.parse(value.lastLogin)).toString().split(' ');

            items.push(<tr key={index}><td data-label="Remove" onClick={()=> this.removeUser(value.id)} className='dashboard-remove-item'><i className='fas fa-skull' aria-hidden="true"></i></td><td data-label="Email" className='' onClick={()=> this.adminGetUsersSaves(value.email, value.id)}><span className='dashboard-admin-display-user-email'>{value.email}</span></td><td data-label="Last Login">{d[0]+' '+d[1]+', '+d[2]+' '+d[3]}</td><td data-label="IP">{value.ipv4}</td></tr>)
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
            items.push(<tr className='white-text' key={index}><td onClick={()=> this.adminRemoveItem(value.id, value.city)} className='dashboard-remove-item'><i className='far fa-trash-alt' aria-hidden="true"></i></td><td><Link to={'/location/' + value.id}>[{value.id}]</Link></td><td>{value.state}</td><td>{value.address}</td><td>{value.city}</td><td>{value.zip}</td><td>{value.phone}</td><td className='tooltip'>{value.hours.substr(0,12)}<span className="tooltiptext">{value.hours}</span></td></tr>)
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

    userCount =()=> {
        let items = [];

        if(this.props.users !== undefined){
            for(let [index, value] of this.props.users.entries()){
                items.push(<tr key={index} className='userBusinessFavoritesRow'><td data-label="Socket">{value.socketID}</td><td data-label="IP">{value.socketIP}</td><td data-label="City">{value.city}</td><td data-label="State">{value.state}</td><td data-label="Address"><Link to={`/dashboard/${value.socketID}`}>{value.house_number + ' ' + value.road}</Link></td></tr>)
            }

            this.setState({
                users: items
            })
        }
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
                        <h4 className='dashboard-title'>Hello, {this.state.email}</h4>
                    </div>
                    {
                        this.state.userFavorites.length > 0 ?
                        <table className='table'>
                            <caption className='green white-text'>Favorite Whole Foods</caption>
                            <thead>
                            <tr>
                                <th>Remove</th>
                                <th>ID</th>
                                <th>State</th>
                                <th>City</th>
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
                        this.state.userBusinessFavorites.length > 0 ?
                         <Fragment>
                             <hr/>
                        <table className='table'>
                            <caption className='red white-text'>Favorite Businesses</caption>
                            <thead>
                            <tr>
                                <th>Remove</th>
                                <th>Business Name</th>
                                <th>Location</th>
                            </tr>
                            </thead>

                            <tbody>
                            {this.state.userBusinessFavorites}
                            </tbody>
                        </table>
                         </Fragment>
                            : null
                    }
                    {
                        this.state.email == 'admin@admin.com' ?
                            <Fragment>
                                <UserMap users={this.props.users}/>
                                <table className='table'>
                                    <caption className='pink white-text'>[Online Users] -> [{this.props.userCount}]</caption>
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>IP</th>
                                        <th>City</th>
                                        <th>State</th>
                                        <th>Address</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {this.state.users}
                                    </tbody>
                                </table>

                                <table className='table'>
                                    <caption className='deep-orange white-text'>[Registered Users]</caption>
                                    <thead>
                                    <tr>
                                        <th>Remove</th>
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

export default withRouter(Dashboard);