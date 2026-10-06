import React, { useEffect, useState } from 'react';
import { Progress } from '@src/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Alert } from '@src/components/ui/alert';
import packageJson from '../../../../package.json';
import { Spinner } from '@src/components/ui/spinner';
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
		// The id is a hook for the e2e tests
		<div
			id="loading-screen"
			className="absolute inset-0 z-500 flex flex-col items-center justify-center bg-gray-light px-15 py-7.5"
		>
			{!isHideLogo && (
				<div className="mb-12.5 flex w-full max-w-100 justify-center">
					<img
						className="size-20"
						src={process.env.REACT_APP_LOGO_BLACK_URL ?? '/logoblack.svg'}
						alt="Logo"
					/>
				</div>
			)}

			<div className="w-full max-w-100">
				{!isInitialResourceFailed && (
					<Progress className="h-[3px]" value={loadingProgress} />
				)}
			</div>

			<div className="my-3.75 flex items-center justify-center text-[16px] font-semibold text-ink/40">
				<Spinner size={20} className="m-2.5 text-primary" />
				{t(loadingComponent ?? '')}
			</div>

			{isLongTransactionInfoVisible && (
				<div className="mb-2.5 flex items-center justify-center text-[14px] text-ink/30">
					{t('We are loading initial resources, please wait...')}
				</div>
			)}

			{isInitialResourceFailed && (
				<>
					<Alert severity="warning" variant="filled" className="w-auto">
						{t('Something went wrong, this will be fixed automatically')}
					</Alert>

					<div className="flex items-center justify-center gap-2.5">
						<a
							className="inline-block cursor-pointer p-2.5 text-[18px] text-primary"
							target="_blank"
							href={
								process.env.REACT_APP_ERROR_HELP_LINK_URL ??
								'https://status.360dialog.com/'
							}
						>
							{t(
								process.env.REACT_APP_ERROR_HELP_LINK_TEXT ??
									'Go to 360Dialog Status Page'
							)}
						</a>
					</div>
				</>
			)}

			<span className="absolute bottom-0 left-1/2 mb-3.75 block -translate-x-1/2 text-[12px] text-muted-foreground">
				Version: {packageJson.version}
			</span>
		</div>
	);
};

export default LoadingScreen;
