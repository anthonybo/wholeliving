import React, {Fragment} from 'react';

const Walkscore =()=>{

    return(
        <Fragment>

            <div className='svg-items'>
                <div className='arrow-container'>
                    <svg className='arrow-svg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                    refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" />
                            </marker>
                        </defs>
                        <line x1="30" y1="50" x2="270" y2="50" stroke="#000"
                              strokeWidth="8" markerEnd="url(#arrowhead)" />
                        <text className="js-median-text median-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                        <text className='median-text-btm'>Median Price</text>
                    </svg>
                </div>
                <div className='scores-container'>
                    <svg className="score" viewBox="-25 -25 400 400">
                        <circle className="score-empty" cx="175" cy="175" r="175" strokeWidth="25"
                                fill="none"></circle>
                        <circle className="js-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175"
                                r="175" strokeDasharray="1100" strokeWidth="25" strokeDashoffset="1100"
                                fill="none"></circle>
                        <text className="js-text score-text" x="50%" y="40%" dx="-25" textAnchor="middle"></text>
                        <text className="score-text-name" x="50%" y="50%" dx="-25" textAnchor="middle">WalkScore</text>
                        <text className="score-desc-text" x="50%" y="60%" dx="-25" textAnchor="middle"></text>
                    </svg>

                    <svg className="bike-score" viewBox="-25 -25 400 400">
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
            </div>

        </Fragment>
    )
}

export default Walkscore;