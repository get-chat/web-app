import React, {useEffect, useState} from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import '../styles/LoadingScreen.css';

function LoadingScreen(props) {

    const [isSkipVisible, setSkipVisible] = useState(false);

    useEffect(() => {
        let intervalId = setInterval(function () {
            setSkipVisible(true);
        }, 5000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    const skip = () => {
        props.setProgress(100);
    }

    return (
        <div className="loadingScreen">
            <div className="loadingScreen__progressContainer">
                <LinearProgress variant="determinate" value={props.progress} />
            </div>

            {isSkipVisible &&
            <span className="loadingScreen__skip" onClick={skip}>Skip</span>
            }
        </div>
    )
}

export default LoadingScreen;