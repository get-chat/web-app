import React, { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import '../../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import packageJson from '../../../package.json';
import { CircularProgress } from '@mui/material';
import { useAppSelector } from '@src/store/hooks';

interface Props {
	loadingNow?: string | undefined | null;
	isHideLogo: boolean;
	isInitialResourceFailed: boolean;
}

const LoadingScreen: React.FC<Props> = ({
	loadingNow,
	isHideLogo,
	isInitialResourceFailed,
}) => {
	const { t } = useTranslation();

	const { loadingProgress } = useAppSelector((state) => state.UI);

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
	}, [loadingNow]);

	// const skip = () => {
	//     props.setProgress(100);
	// };

	return (
		<div className="loadingScreen">
			{!isHideLogo && (
				<div className="loadingScreen__logoContainer">
					<img
						src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'}
						alt="Logo"
					/>
				</div>
			)}

			<div className="loadingScreen__progressContainer">
				{!isInitialResourceFailed && (
					<LinearProgress variant="determinate" value={loadingProgress} />
				)}
			</div>

			<div className="loadingScreen__details">
				<CircularProgress size={20} />
				{t(loadingNow ?? '')}
			</div>

			{isLongTransactionInfoVisible && (
				<div className="loadingScreen__longTransactionInfo">
					{t('We are loading initial resources, please wait...')}
				</div>
			)}

			{isInitialResourceFailed && (
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
};

export default LoadingScreen;
