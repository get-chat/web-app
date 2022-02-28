import React, {useEffect, useState} from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import '../../styles/LoadingScreen.css';
import {VERSION} from "../../Constants";
import {useTranslation} from "react-i18next";

function LoadingScreen(props) {

    const { t, i18n } = useTranslation();

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
                <img src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'} alt="Logo" />
            </div>
            <div className="loadingScreen__progressContainer">
                <LinearProgress variant="determinate" value={props.progress} />
            </div>

            <div className="loadingScreen__details">
                {t('Loading: %s', props.loadingNow)}
            </div>

            {isSkipVisible &&
            <div>
                <span className="loadingScreen__skip" onClick={skip}>
                    {t('Skip')}
                </span>
            </div>
            }

            <span className="loadingScreen__version">Version: { VERSION }</span>
        </div>
    )
}

export default LoadingScreen;