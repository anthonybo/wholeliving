import React from 'react';

const Walkscore =()=>{

    return(
        <div className='scores-container'>
            <svg className="score" width="200" height="200" viewBox="-25 -25 400 400">
                <circle className="score-empty" cx="175" cy="175" r="175" strokeWidth="25"
                        fill="none"></circle>
                <circle className="js-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175"
                        r="175" strokeDasharray="1100" strokeWidth="25" strokeDashoffset="1100"
                        fill="none"></circle>
                <text className="js-text score-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                <text className="score-text-name" x="50%" y="50%" dx="-25" textAnchor="middle">WalkScore</text>
                <text className="score-desc-text" x="50%" y="60%" dx="-25" textAnchor="middle"></text>
            </svg>

            <svg className="bike-score" width="200" height="200" viewBox="-25 -25 400 400">
                <circle className="score-empty" cx="175" cy="175" r="175" strokeWidth="25"
                        fill="none"></circle>
                <circle className="js-bike-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175"
                        r="175" strokeDasharray="1100" strokeWidth="25" strokeDashoffset="1100"
                        fill="none"></circle>
                <text className="js-bike-text score-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                <text className="score-text-name" x="50%" y="50%" dx="-25" textAnchor="middle">BikeScore</text>
                <text className="score-bike-desc-text" x="50%" y="60%" dx="-25" textAnchor="middle"></text>
            </svg>
        </div>
    )
}

export default Walkscore;