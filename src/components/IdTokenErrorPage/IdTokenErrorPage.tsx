import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './IdTokenErrorPage.module.css';
import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const IdTokenErrorPage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [searchParams] = useSearchParams();

	return (
		<div className={styles.container}>
			<Alert severity="error" className={styles.error}>
				<AlertTitle>{t('Failed to log in')}</AlertTitle>
				{t(searchParams.get('reason') ?? '')}
			</Alert>

			<div className="mt-3">
				<Button variant="text" onClick={() => navigate('/login')}>
					{t('Go to login')}
				</Button>
			</div>
		</div>
	);
};

export default IdTokenErrorPage;
