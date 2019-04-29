import React, {Component, Fragment} from 'react';
import './modal.scss';

class Modal extends Component {

    state = {
        isModalOpen: true,
        previousUser: false
    }

    clickHandler(){
        let closeButton = document.getElementById('close-tutorial');
        let triggerTutorialIcon = document.getElementById('tutorial-modal-icon');

        closeButton.addEventListener('click', this.toggleTutorial);
        triggerTutorialIcon.addEventListener('click', this.toggleTutorial);
    }

    toggleTutorial =()=> {
        let tutorialModal = document.getElementById('tutorial-modal');

        if(this.state.previousUser){
            tutorialModal.classList.remove('closed-no-animations');
            // tutorialModal.classList.add('closed');
        }
        if(this.state.isModalOpen){
            tutorialModal.classList.add('closed');
            localStorage.setItem('closedMenu', 'true');

        } else {
            tutorialModal.classList.remove('closed');
        }

        this.setState({
            isModalOpen: !this.state.isModalOpen
        })
    }

    componentDidMount() {
        var closedMenu = localStorage.getItem('closedMenu');
        if(closedMenu){
            this.setState({
                isModalOpen: false,
                previousUser: true
            })

            // this.toggleTutorial();
        } else {
            let tutorialModal = document.getElementById('tutorial-modal');
            tutorialModal.classList.remove('closed-no-animations');
            // tutorialModal.classList.add('closed');
        }

        this.clickHandler();


    }

    render(){
        return(
            <Fragment>
                <div id='tutorial-modal' className="tutorial-modal closed-no-animations">
                    <a id='close-tutorial' className="close"><i className="material-icons ion-close">close</i></a>

                    <figure>
                        <figcaption>
                            <h1>About Us</h1>
                            <p>The purpose of this application is to allow you to query places that you would need in your life and
                                cross reference those locations with our database filled with over 485 Whole Foods located in America.</p>
                        </figcaption>
                    </figure>

                </div>

                <span className='tutorial'>
                    <a><i id='tutorial-modal-icon' className='material-icons tutorial-icon'>help</i></a>
                </span>
            </Fragment>

        )
    }
}

export default Modal;