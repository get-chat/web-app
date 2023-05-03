// @ts-nocheck
import React, { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import '../../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import packageJson from '../../../package.json';
import { CircularProgress } from '@mui/material';

function LoadingScreen(props) {
	const { t } = useTranslation();

	const [isLongTransactionInfoVisible, setLongTransactionInfoVisible] =
		useState(false);

	useEffect(() => {
		let intervalId = setInterval(function () {
			setLongTransactionInfoVisible(true);
		}, 5000);

		return () => {
			clearInterval(intervalId);
			setLongTransactionInfoVisible(false);
		};
	}, [props.loadingNow]);

	// const skip = () => {
	//     props.setProgress(100);
	// };

	return (
		<div className="loadingScreen">
			<div className="loadingScreen__logoContainer">
				<img
					src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'}
					alt="Logo"
				/>
			</div>

			<div className="loadingScreen__progressContainer">
				{!props.isInitialResourceFailed && (
					<LinearProgress variant="determinate" value={props.progress} />
				)}
			</div>

			<div className="loadingScreen__details">
				<CircularProgress size={20} />
				{t(props.loadingNow)}
			</div>

			{isLongTransactionInfoVisible && (
				<div className="loadingScreen__longTransactionInfo">
					{t('We are loading initial resources, please wait...')}
				</div>
			)}

			{props.isInitialResourceFailed && (
				<>
					<Alert severity="warning" variant="filled">
						{t('Something went wrong, this will be fixed automatically')}
					</Alert>

					<div className="loadingScreen__actions">
						<a className="loadingScreen__link" href="mailto:support@get.chat">
							{t('Contact us')}
						</a>
						{/* <span className="loadingScreen__link" onClick={skip}>
                            {t("Skip")}
                        </span> */}
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
