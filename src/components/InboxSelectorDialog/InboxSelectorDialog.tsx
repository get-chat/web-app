import React, { useContext, useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTranslation } from 'react-i18next';
import {
	getApiBaseURLsMergedWithConfig,
	getCurrentApiBaseURL,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import { Button, DialogActions, ListItemButton } from '@mui/material';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import * as Styled from './InboxSelectorDialog.styles';

interface Props {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
}

const InboxSelectorDialog: React.FC<Props> = ({ isVisible, setVisible }) => {
	const { t } = useTranslation();

	const config = useContext(AppConfigContext);

	const [current, setCurrent] = useState<string | null | undefined>();
	const [urls, setUrls] = useState<string[]>([]);

	useEffect(() => {
		if (isVisible && !urls.length) {
			// @ts-ignore
			const storedCurrent = getCurrentApiBaseURL() ?? config.API_BASE_URL;
			setCurrent(storedCurrent);

			const storedURLs = getApiBaseURLsMergedWithConfig(config);
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
				<Styled.ListWrapper>
					<Styled.List>
						{urls.map((item, index) => (
							<ListItemButton key={index} onClick={() => onSelect(item)}>
								<div>
									<div>{prepareURLForDisplay(item)}</div>
									{item === current && (
										<Styled.Current>{t('Your current inbox')}</Styled.Current>
									)}
								</div>
							</ListItemButton>
						))}
					</Styled.List>
				</Styled.ListWrapper>
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
