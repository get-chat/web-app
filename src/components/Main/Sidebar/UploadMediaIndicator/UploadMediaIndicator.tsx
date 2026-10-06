import React from 'react';
import { Alert } from '@src/components/ui/alert';
import { Progress } from '@src/components/ui/progress';
import { cn } from '@src/lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
	/** Floats over the chat instead of sitting in the sidebar */
	isMobile?: boolean;
}

const UploadMediaIndicator: React.FC<Props> = ({ isMobile = false }) => {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				'flex flex-col',
				isMobile && 'pointer-events-none absolute z-10 mt-17.5 mr-3.75 ml-[30%]'
			)}
		>
			<Alert severity="info">
				<div>{t('Uploading a media file. Please wait...')}</div>
				<Progress className="mt-2.5 h-0.75" />
			</Alert>
		</div>
	);
};

export default UploadMediaIndicator;
