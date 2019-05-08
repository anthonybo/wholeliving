import React, {Component, Fragment} from 'react';
import './login.scss';
import axios from 'axios';
import ReactDOM from "react-dom";
import {Link, withRouter} from 'react-router-dom';

class Login extends Component {

    state = {
        registrationOpen: false,
        email: '',
        password: '',
        confirmPassword: '',
        loginOpen: false,
        registrationClicked: false,
        userLoggedIn: false,
        users_id: 0,
        tokenConfirmed: false,
        gettingLoginData: false
    }

    clickHandler(){
        let registrationIcon = document.getElementById('registration-icon');
        let loginIcon = document.getElementById('login-icon');
        let closeRegistration = document.getElementById('close-registration');

        // registrationIcon.addEventListener('click', this.toggleRegistrationClicked);
        // loginIcon.addEventListener('click', this.toggleLogin);
        closeRegistration.addEventListener('click', this.toggleRegistration);
    }

    toggleLogout=()=>{
        this.props.onEmailChange('');
        this.props.onIdChange(0);

        let popupMessage = document.getElementById('logoutPopupMessage');
        popupMessage.classList.remove('hide-popup');
        let logoutMessage = document.getElementById('logoutMessage');
        logoutMessage.innerHTML = "You have Logged Out!";
        this.fade('logout');

        this.setState({
            userLoggedIn: false
        })

        // localStorage.clear();
        localStorage.removeItem('email');
        localStorage.removeItem('token');
    }

    toggleRegistrationClicked=()=>{
        this.setState({
            loginOpen: false,
            registrationClicked: true
        })

        this.toggleRegistration();
    }

    toggleLogin=()=>{
        this.setState({
            loginOpen: true,
            registrationClicked: false
        })

        this.toggleRegistration();
    }

    toggleRegistration=()=>{
        let errorOutput = document.getElementById('error-output');
        errorOutput.innerHTML = '';

        let registrationForm = document.getElementById('registration-form');

        if(!this.state.registrationOpen){
            registrationForm.classList.remove('closed-registration-form');
        } else {
            registrationForm.classList.add('closed-registration-form');
        }

        this.setState({
            registrationOpen: !this.state.registrationOpen
        })
    }

    async sendLoginDetails (){
        let registrationForm = document.getElementById('registration-form');
        let errorOutput = document.getElementById('error-output');
        let problems = false;
        var date = new Date();
        var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();


        if(this.state.password.length < 6){
            errorOutput.innerHTML = "*Your password must be at least 6 characters";
            errorOutput.style.color = "red";
            problems = true;
        }

        function validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        if(!validateEmail(this.state.email)){
            errorOutput.innerHTML = "*Please enter a correct email.";
            errorOutput.style.color = "red";
            problems = true;
        }

        if(this.state.loginOpen){
            let loginDataConfirm = await axios.post('/api/login', {
                email: this.state.email,
                password: this.state.password,
                lastLogin: dateStr
            });

            if(loginDataConfirm.data.success){
                localStorage.setItem('token', loginDataConfirm.data.user.token);
                localStorage.setItem('email', loginDataConfirm.data.user.email);
                localStorage.setItem('user_id', loginDataConfirm.data.user.id);

                this.setState({
                    email: loginDataConfirm.data.user.email,
                    users_id: loginDataConfirm.data.user.id
                })
                this.loginSuccess();
            } else {
                errorOutput.innerHTML = "*Email or Password Incorrect!";
                errorOutput.style.color = "red";
            }
        } else {
            if(this.state.password != this.state.confirmPassword) {
                errorOutput.innerHTML = "*Passwords Do Not Match!";
                errorOutput.style.color = "red";
                problems = true;
            }

            let loginDataConfirm = await axios.post('/api/login/check', {
                email: this.state.email,
            });

            if(loginDataConfirm.data.success){
                problems = true;
                errorOutput.innerHTML = "*User already exists!";
                errorOutput.style.color = "red";
            }
        }


        if(!problems && !this.state.loginOpen){
            registrationForm.classList.add('closed-registration-form');

            let loginData = await axios.post('/api/new/user', {
                email: this.state.email,
                password: this.state.password,
                lastLogin: dateStr
            });

            let popupMessage = document.getElementById('popupMessage');
            popupMessage.classList.remove('hide-popup');
            let successMessage = document.getElementById('successMessage');
            successMessage.innerHTML = "You have registered!";
            this.fade();

            this.setState({
                registrationOpen: !this.state.registrationOpen,
                password: '',
                email: '',
                confirmPassword: '',
                gettingLoginData: false
            })
        }
        this.setState({
            gettingLoginData: false
        })
    }

    loginSuccess=()=>{
        this.props.onEmailChange(this.state.email);
        this.props.onIdChange(this.state.users_id);

        let registrationForm = document.getElementById('registration-form');
        registrationForm.classList.add('closed-registration-form');

        let popupMessage = document.getElementById('popupMessage');
        popupMessage.classList.remove('hide-popup');
        let successMessage = document.getElementById('successMessage');
        successMessage.innerHTML = "You have Logged In!";
        this.fade('login');

        this.setState({
            registrationOpen: !this.state.registrationOpen,
            password: '',
            userLoggedIn: true,
            gettingLoginData: false
        })
    }

    componentDidMount() {
        this.mounted = true;

        const node = ReactDOM.findDOMNode(this);
        let elem = null;
        let tooltipElem = null;

        if (node instanceof HTMLElement) {
            elem = document.querySelector('.fixed-action-btn');
            tooltipElem = document.querySelectorAll('.tooltipped');
        }

        var instances = M.FloatingActionButton.init(elem, {
            direction: 'left',
            hoverEnabled: true
        });

        var toolTip_instances = M.Tooltip.init(tooltipElem, {
            position: 'top',
            exitDelay: 200
        });

        this.clickHandler();
    }

    handleSubmit = (event) => {
        this.refs.email.value = '';
        this.refs.password.value = '';
        if(!this.state.loginOpen){
            this.refs.confirmPassword.value = '';
        }

        event.preventDefault();

        this.sendLoginDetails();
        this.setState({
            gettingLoginData: true
        })
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    fade(loginOrLogout) {
        let well = null;
        if(loginOrLogout == 'login'){
            well = document.getElementById('popupMessage');
        } else if (loginOrLogout == 'logout'){
            well = document.getElementById('logoutPopupMessage');
        }
        well.style.opacity = 1;

        var opacity;
        if(well.style.opacity > 0.9) {
            well.style.opacity = 1;
            var myvar = setInterval(function() {
                well.style.opacity -= 0.05;
                if(well.style.opacity < 0) {
                    clearInterval(myvar);
                    opacity = Number(well.style.opacity);
                    // console.log('faded out to: ' + opacity);
                    well.style.opacity = opacity;
                    well.classList.add('hide-popup');
                }
            }, 200);
        } else if(well.style.opacity < 1) {
            well.style.opacity = 0;
            // console.log('Going up from ' + opacity);
            var newvar = setInterval(function() {
                well.style.opacity =+ parseFloat(well.style.opacity) + 0.05;
                if(well.style.opacity > 1) {
                    clearInterval(newvar);
                    opacity = Number(well.style.opacity);
                    // console.log('faded out to: ' + opacity);
                    well.style.opacity = opacity;
                }
            }, 200);
        }
        // setTimeout(function() {
        //   well.style.opacity = 0.5;
        // }, 1000);

        return;
    }

    async confirmToken(){
        let email = localStorage.getItem('email');
        let user_id = localStorage.getItem('user_id');
        let token = localStorage.getItem('token');

        let tokenData = await axios.post('/api/login/token', {
            email: email,
            user_id: user_id,
            token: token
        })

        if(tokenData.data.success && this.mounted){
            this.setState({
                tokenConfirmed: true
            })
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate =(prevProps, prevState, snapshot)=> {
        if(this.state.email == '' && this.state.users_id == 0 && localStorage.getItem('email') !== null){
            this.confirmToken();
            if(this.state.tokenConfirmed){
                let email = localStorage.getItem('email');
                let user_id = localStorage.getItem('user_id');
                let token = localStorage.getItem('token');

                this.setState({
                    email: email,
                    users_id: user_id,
                    userLoggedIn: true
                })

                this.props.onEmailChange(email);
                this.props.onIdChange(user_id);
            }
        }
    }

    render(){
        return(
            <Fragment>
                {
                    this.state.gettingLoginData ?
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>
                        :
                        null
                }

                <form id='registration-form' className='closed-registration-form registration-form' onSubmit={this.handleSubmit}>
                    <a id='close-registration' className="close-registration-button"><i className="material-icons ion-close">close</i></a>
                    {this.state.loginOpen ? <h5 className='title-registration-form'>Login</h5> : <h5 className='title-registration-form'>REGISTER FOR AN ACCOUNT</h5>}
                    <div><label htmlFor="useremail">Email Address</label></div>
                    <input className="" ref="email" name="email" id="useremail" type="email" placeholder="Enter email" maxLength="50" onChange={this.handleChange} autoComplete="none"/>
                           <div><label htmlFor="userPass">Password</label></div>
                    <input className="" ref="password" name="password" id="userPass" type="password" placeholder="Enter password" maxLength="20"
                           pattern=".{6,20}" title="6 to 20 characters" onChange={this.handleChange}/>
                    {
                        this.state.loginOpen ? <span></span> :
                            <Fragment>
                            <div><label htmlFor="userConfirmPass">Confirm password</label></div>
                            <input className="" ref="confirmPassword" name="confirmPassword" id="userConfirmPass" type="password"
                                   placeholder="Confirm password" maxLength="20" pattern=".{6,20}"
                                   title="6 to 20 characters" onChange={this.handleChange}/>
                            </Fragment>
                    }
                           <span id="info"></span>
                    <input className="btn waves-effect waves-light" type="submit" value="Send" name="submit" onClick={this.handleSubmit}/>
                    <div id='error-output'></div>
                </form>

                <div className="fixed-action-btn horizontal">
                    <a className="btn-floating btn-large light">
                        <i className="large material-icons">menu</i>
                    </a>
                    <ul>
                        <li><a id='tutorial-modal-icon' className="btn-floating blue tooltipped" data-position="top" data-delay="50"
                               data-tooltip="About Us"><i className="material-icons">help</i></a></li>
                        {
                            this.state.userLoggedIn ?
                                <Fragment>
                                    <li><Link to='/dashboard' id='dashboard-icon' className="btn-floating pink tooltipped" data-position="top" data-delay="50" data-tooltip='Dashboard'><i className="material-icons">dashboard</i></Link></li>
                                    <li><Link to={this.props.match.url == '/dashboard' ? '/' : this.props.match.url} onClick={this.toggleLogout} id='logout-icon' className="btn-floating red tooltipped" data-position="top" data-delay="50" data-tooltip={'Logout: ' + '<br>' + this.state.email }><i className="material-icons">account_box</i></Link></li>
                                    <li className='hide'><Link to=''></Link></li>

                                </Fragment>
                                :
                                <Fragment>
                                <li><Link to={this.props.match.url} onClick={this.toggleRegistrationClicked} id='registration-icon' className="btn-floating deep-orange lighten-1 tooltipped" data-position="top" data-delay="50" data-tooltip="Registration"><i className="material-icons">account_box</i></Link></li>
                                <li><Link to={this.props.match.url} onClick={this.toggleLogin} id='login-icon' className="btn-floating green tooltipped" data-position="top" data-delay="50" data-tooltip="Login"><i className="material-icons">account_box</i></Link></li>
                                </Fragment>

                        }
                    </ul>
                </div>

                <section id='popupMessage' className="message success hide-popup">
                    <i></i>
                    <h2>
                        <span>Success</span>
                        <div id='successMessage'></div>
                    </h2>
                </section>

                <section id='logoutPopupMessage' className="message error hide-popup">
                    <i></i>
                    <h2>
                        <span>Logout</span>
                        <div id='logoutMessage'></div>
                    </h2>
                </section>
            </Fragment>
        )
    }
}

export default withRouter(Login);