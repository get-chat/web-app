import React, { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import * as Styled from './LoadingScreen.styles';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import packageJson from '../../../../package.json';
import { CircularProgress } from '@mui/material';
import { useAppSelector } from '@src/store/hooks';

interface Props {
	isHideLogo: boolean;
}

const LoadingScreen: React.FC<Props> = ({ isHideLogo }) => {
	const { t } = useTranslation();

	const { loadingProgress, loadingComponent, isInitialResourceFailed } =
		useAppSelector((state) => state.UI);

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
	}, [loadingComponent]);

	return (
		<Styled.Container>
			{!isHideLogo && (
				<Styled.LogoWrapper>
					<img
						src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'}
						alt="Logo"
					/>
				</Styled.LogoWrapper>
			)}

			<Styled.ProgressContainer>
				{!isInitialResourceFailed && (
					<LinearProgress variant="determinate" value={loadingProgress} />
				)}
			</Styled.ProgressContainer>

			<Styled.Details>
				<CircularProgress size={20} />
				{t(loadingComponent ?? '')}
			</Styled.Details>

			{isLongTransactionInfoVisible && (
				<Styled.LongTransactionInfo>
					{t('We are loading initial resources, please wait...')}
				</Styled.LongTransactionInfo>
			)}

			{isInitialResourceFailed && (
				<>
					<Alert severity="warning" variant="filled">
						{t('Something went wrong, this will be fixed automatically')}
					</Alert>

					<Styled.Actions>
						<Styled.ContactLink href="https://status.360dialog.com/">
							{t('Go to 360Dialog Status Page')}
						</Styled.ContactLink>
					</Styled.Actions>
				</>
			)}

			<Styled.Version>Version: {packageJson.version}</Styled.Version>
		</Styled.Container>
	);
};

export default LoadingScreen;
