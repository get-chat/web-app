import React, { useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTranslation } from 'react-i18next';
import {
	getApiBaseURLs,
	getCurrentApiBaseURL,
	storeApiBaseURLs,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import styles from './InboxSelectorDialog.module.css';
import { Button, DialogActions, ListItemButton } from '@mui/material';
import { AppConfig } from '@src/contexts/AppConfig';

interface Props {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
}

const InboxSelectorDialog: React.FC<Props> = ({ isVisible, setVisible }) => {
	const { t } = useTranslation();

	const config = React.useContext(AppConfig);

	const [current, setCurrent] = useState<string | null | undefined>();
	const [urls, setUrls] = useState<string[]>([]);

	useEffect(() => {
		if (isVisible && !urls.length) {
			const storedCurrent = getCurrentApiBaseURL();
			setCurrent(storedCurrent);

			const storedURLs = getApiBaseURLs();
			// @ts-ignore
			if (config && !storedURLs.includes(config.API_BASE_URL)) {
				// @ts-ignore
				storedURLs.push(config.API_BASE_URL);
			}
			// Sort
			storedURLs.sort((a, b) =>
				a == storedCurrent ? -1 : b == storedCurrent ? 1 : 0
			);

			setUrls(storedURLs);
		}
	}, [isVisible]);

	const close = () => {
		setVisible(false);
	};

	const onSelect = (url: string) => {
		if (url !== current) {
			storeCurrentApiBaseURL(url);
			location.reload();
		} else {
			close();
		}
	};

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Select an inbox')}</DialogTitle>
			<DialogContent>
				<div className={styles.listWrapper}>
					<div className={styles.list}>
						{urls.map((item, index) => (
							<ListItemButton key={index} onClick={() => onSelect(item)}>
								<div>
									<div>{prepareURLForDisplay(item)}</div>
									{item === current && (
										<div className={styles.current}>
											{t('Your current inbox')}
										</div>
									)}
								</div>
							</ListItemButton>
						))}
					</div>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InboxSelectorDialog;
