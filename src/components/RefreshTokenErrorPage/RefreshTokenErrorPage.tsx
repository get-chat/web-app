import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
		<div className="flex w-full max-w-[450px] flex-col items-center rounded-[10px] bg-white p-7.5 shadow-[0_4px_10px_-6px_rgba(0,0,45,0.7)]">
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
		</div>
	);
};

export default RefreshTokenErrorPage;
