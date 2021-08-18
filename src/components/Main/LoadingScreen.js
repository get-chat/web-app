import React, {useEffect, useState} from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import '../../styles/LoadingScreen.css';
import {VERSION} from "../../Constants";
import logoBlack from '../../assets/images/logo-black.svg';

function LoadingScreen(props) {

    const [isSkipVisible, setSkipVisible] = useState(false);

    useEffect(() => {
        let intervalId = setInterval(function () {
            setSkipVisible(true);
        }, 20000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    const skip = () => {
        props.setProgress(100);
    }

    return (
        <div className="loadingScreen">
            <div className="loadingScreen__logoContainer">
                <img src={logoBlack} alt="Logo" />
            </div>
            <div className="loadingScreen__progressContainer">
                <LinearProgress variant="determinate" value={props.progress} />
            </div>

            <div className="loadingScreen__details">
                Loading {props.loadingNow}
            </div>

            {isSkipVisible &&
            <div>
                <span className="loadingScreen__skip" onClick={skip}>Skip</span>
            </div>
            }

            <span className="loadingScreen__version">Version: { VERSION }</span>
        </div>
    )
}

export default LoadingScreen;