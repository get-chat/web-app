import React, { useEffect, useState } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import '../../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';
import packageJson from '../../../package.json';

function LoadingScreen(props) {
	const { t } = useTranslation();

	const [isSkipVisible, setSkipVisible] = useState(false);

	useEffect(() => {
		let intervalId = setInterval(function () {
			setSkipVisible(true);
		}, 20000);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	const skip = () => {
		props.setProgress(100);
	};
	return (
		<div className="loadingScreen">
			<div className="loadingScreen__logoContainer">
				<img
					src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'}
					alt="Logo"
				/>
			</div>

			<div className="loadingScreen__progressContainer">
				{!isSkipVisible && (
					<LinearProgress variant="determinate" value={props.progress} />
				)}
			</div>

			<div className="loadingScreen__details">
				{t('Loading: %s', props.loadingNow)}
			</div>

			{isSkipVisible && (
				<>
					<Alert severity="error" variant="filled">
						{t('Something went wrong, this will be fixed automatically')}
					</Alert>

					<div className="loadingScreen__actions">
						<a className="loadingScreen__link" href="mailto:support@get.chat">
							{t('Contact us')}
						</a>
						<span className="loadingScreen__link" onClick={skip}>
							{t('Skip')}
						</span>
					</div>
				</>
			)}

			<span className="loadingScreen__version">
				Version: {packageJson.version}
			</span>
		</div>
	);
}

export default LoadingScreen;
