import React from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import '../styles/LoadingScreen.css';

function LoadingScreen(props) {
    return (
        <div className="loadingScreen">
            <div className="loadingScreen__progressContainer">
                <LinearProgress variant="determinate" value={props.progress} />
            </div>
        </div>
    )
}

export default LoadingScreen;