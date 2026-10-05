import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Styled from './RefreshTokenErrorPage.styles';
import { Alert, AlertTitle } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';

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
			<Alert severity="error">
				<AlertTitle>{t('Failed to log in')}</AlertTitle>
				{t(reason)}
			</Alert>

			<div className="mt-3">
				<Button
					variant="ghost"
					color="primary"
					onClick={() => navigate('/login')}
				>
					{t('Log in with password instead')}
				</Button>
			</div>
		</Styled.Container>
	);
};

export default RefreshTokenErrorPage;
