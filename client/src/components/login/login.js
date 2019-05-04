import React, {Component, Fragment} from 'react';
import './login.scss';
import axios from 'axios';
import ReactDOM from "react-dom";

class Login extends Component {

    state = {
        registrationOpen: false,
        email: '',
        password: '',
        confirmPassword: ''
    }

    clickHandler(){
        let loginIcon = document.getElementById('registration-icon');
        let closeRegistration = document.getElementById('close-registration');

        loginIcon.addEventListener('click', this.toggleLogin);
        closeRegistration.addEventListener('click', this.toggleLogin);
    }

    toggleLogin=()=>{
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

        if(this.state.password != this.state.confirmPassword) {
            errorOutput.innerHTML = "*Passwords Do Not Match!";
            errorOutput.style.color = "red";
            problems = true;
        }
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

        // let loginDataConfirm = await axios.post('/api/login', {
        //     email: this.state.email,
        //     password: this.state.password
        // });

        let loginDataConfirm = await axios.post('/api/login/check', {
            email: this.state.email,
        });

        if(loginDataConfirm.data.success){
            problems = true;
            errorOutput.innerHTML = "*User already exists!";
        }

        if(!problems){
            registrationForm.classList.add('closed-registration-form');
            var date = new Date();
            var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();



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
                confirmPassword: ''
            })
        }
    }

    componentDidMount() {
        // this.sendLoginDetails();
        // this.getFormData();

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
        this.refs.confirmPassword.value = '';

        event.preventDefault();

        this.sendLoginDetails();
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    fade() {
        let well = document.getElementById('popupMessage');
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

    render(){
        return(
            <Fragment>
            {/*<span className='tutorial'>*/}
            {/*        <a><i id='tutorial-modal-icon' className='material-icons tutorial-icon'>help</i></a>*/}
            {/*</span>*/}

                <form id='registration-form' className='closed-registration-form registration-form' onSubmit={this.handleSubmit}>
                    <a id='close-registration' className="close-registration-button"><i className="material-icons ion-close">close</i></a>
                    <h5 className='title-registration-form'>REGISTER FOR AN ACCOUNT</h5>
                    <div><label htmlFor="useremail">Email Address</label></div>
                    <input className="" ref="email" name="email" id="useremail" type="email" placeholder="Enter email" maxLength="50" onChange={this.handleChange} autoComplete="none"/>
                           <div><label htmlFor="userPass">Password</label></div>
                    <input className="" ref="password" name="password" id="userPass" type="password" placeholder="Enter password" maxLength="20"
                           pattern=".{6,20}" title="6 to 20 characters" onChange={this.handleChange}/>
                           <div><label htmlFor="userConfirmPass">Confirm password</label></div>
                    <input className="" ref="confirmPassword" name="confirmPassword" id="userConfirmPass" type="password"
                           placeholder="Confirm password" maxLength="20" pattern=".{6,20}"
                           title="6 to 20 characters" onChange={this.handleChange}/>
                           <span id="info"></span>
                    <input className="btn waves-effect waves-light" type="submit" value="Send" name="submit" onClick={this.handleSubmit}/>
                    <div id='error-output'></div>
                </form>
                
                <div className="fixed-action-btn horizontal">
                    <a className="btn-floating btn-large red">
                        <i className="large material-icons">help</i>
                    </a>
                    <ul>
                        <li><a id='tutorial-modal-icon' className="btn-floating blue tooltipped" data-position="top" data-delay="50"
                               data-tooltip="About Us"><i className="material-icons">help</i></a></li>
                        <li><a id='registration-icon' className="btn-floating green tooltipped" data-position="top" data-delay="50" data-tooltip="Registration"><i className="material-icons">account_box</i></a></li>
                        <li><a id='login-icon' className="btn-floating deep-orange lighten-1 tooltipped" data-position="top" data-delay="50" data-tooltip="Login"><i className="material-icons">account_box</i></a></li>
                    </ul>
                </div>

                <section id='popupMessage' className="message success hide-popup">
                    <i></i>
                    <h2>
                        <span>Success</span>
                        <div id='successMessage'></div>
                    </h2>
                </section>
            </Fragment>
        )
    }
}

export default Login;