import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import * as Styled from './RefreshTokenErrorPage.styles';

const RefreshTokenErrorPage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [searchParams] = useSearchParams();

	const [reason] = useState(() => {
		const encoded = searchParams.get('reason');
		try {
			return atob(encoded ?? '');
		} catch (e: any) {
			console.warn(e);
		}

		return '';
	});

	return (
		<Styled.Container>
			<Alert severity="error" className={Styled.ErrorAlert}>
				<AlertTitle>{t('Failed to log in')}</AlertTitle>
				{t(reason)}
			</Alert>

			<div className="mt-3">
				<Button variant="text" onClick={() => navigate('/login')}>
					{t('Log in with password instead')}
				</Button>
			</div>
		</Styled.Container>
	);
};

export default RefreshTokenErrorPage;
