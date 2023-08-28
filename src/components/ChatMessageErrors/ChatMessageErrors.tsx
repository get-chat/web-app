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
	retryMessage?: (message: ChatMessageModel) => void;
}

const ChatMessageErrors: React.FC<Props> = ({ data, retryMessage }) => {
	const { t } = useTranslation();

	data.errors = [
		{
			code: 401,
			title: 'Some error',
			details:
				'Some details, this text can be pretty long. And this one must have even smaller font...',
			href: 'location for error detail',
			recommendation:
				'Do it and get it fixed... I have no idea how long this text can be.',
		},
	];

	return (
		<>
			{data.errors &&
				data.errors.map((error: any, index: number) => (
					<div className={styles.container} key={index}>
						<div className={styles.recommendation}>
							{error.recommendation && (
								<Linkify options={{ target: '_blank' }}>
									{t(error.recommendation)}
								</Linkify>
							)}
						</div>

						<div className={styles.error}>
							<h5>{t('Details')}</h5>
							<div className={styles.errorTitle}>
								{t(error.title ?? 'Error')}{' '}
								<span className={styles.code}>
									{error.code && t('(Code: %d)', error.code)}
								</span>
							</div>
							<div className={styles.errorDetails}>
								{error.details && t(error.details)}
							</div>
							{error.href && (
								<div className={styles.errorLink}>
									<a href={error.href} target="_blank">
										{t('Click here for more information.')}
									</a>
								</div>
							)}
						</div>

						{data.isFromUs &&
							data.isFailed &&
							data.canRetry() &&
							retryMessage && (
								<Button
									color="inherit"
									fullWidth
									size="small"
									variant="outlined"
									className={styles.retry}
									onClick={() => retryMessage?.(data)}
								>
									{t('Retry')}
								</Button>
							)}
					</div>
				))}
		</>
	);
};

export default ChatMessageErrors;
