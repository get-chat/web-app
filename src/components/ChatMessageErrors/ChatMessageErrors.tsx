import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import AlertTitle from '@mui/material/AlertTitle';
import Linkify from 'linkify-react';
import React from 'react';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { useTranslation } from 'react-i18next';
import styles from './ChatMessageErrors.module.css';

interface Props {
	data: ChatMessageModel;
	retryMessage: (message: ChatMessageModel) => void;
}

const ChatMessageErrors: React.FC<Props> = ({ data, retryMessage }) => {
	const { t } = useTranslation();

	return (
		<>
			{data.errors &&
				data.errors.map((error: any, index: number) => {
					// Could not find translation for the requested language and locale
					if (error.code === 2003) {
						return (
							<Alert
								key={index}
								variant="filled"
								severity="warning"
								className={styles.error}
								action={
									data.isFailed &&
									data.canRetry() && (
										<Button
											color="inherit"
											size="small"
											onClick={() => retryMessage(data)}
										>
											{t('Retry')}
										</Button>
									)
								}
							>
								{t(
									'The language pack for this template is not installed on the server yet, try sending this message later'
								)}
							</Alert>
						);
					}

					return (
						<Alert
							key={index}
							variant="filled"
							severity="error"
							className={styles.error}
							action={
								data.isFailed &&
								data.canRetry() && (
									<Button
										color="inherit"
										size="small"
										onClick={() => retryMessage(data)}
									>
										{t('Retry')}
									</Button>
								)
							}
						>
							<AlertTitle>
								{t(error.title ?? 'Error')}{' '}
								<span className={styles.code}>
									{error.code && t('(Code: %d)', error.code)}
								</span>
							</AlertTitle>
							{error.details && t(error.details)}

							{error.href && (
								<div>
									<a href={error.href} target="_blank">
										{t('Click here for more information.')}
									</a>
								</div>
							)}

							{error.recommendation && (
								<Alert
									variant="filled"
									severity="info"
									className={styles.error}
								>
									<Linkify options={{ target: '_blank' }}>
										{t(error.recommendation)}
									</Linkify>
								</Alert>
							)}
						</Alert>
					);
				})}
		</>
	);
};

export default ChatMessageErrors;
