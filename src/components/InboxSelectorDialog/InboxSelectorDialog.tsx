import React, { useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTranslation } from 'react-i18next';
import { getApiBaseURLs } from '@src/helpers/StorageHelper';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';

interface Props {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
}

const InboxSelectorDialog: React.FC<Props> = ({ isVisible, setVisible }) => {
	const { t } = useTranslation();

	const [urls, setUrls] = useState(getApiBaseURLs());

	const close = () => {
		setVisible(false);
	};

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Select an inbox')}</DialogTitle>
			<DialogContent>
				{urls.map((item) => (
					<div>{prepareURLForDisplay(item)}</div>
				))}
			</DialogContent>
		</Dialog>
	);
};

export default InboxSelectorDialog;
