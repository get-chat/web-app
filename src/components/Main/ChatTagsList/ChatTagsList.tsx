import React, { useState } from 'react';
import * as Styled from './ChatTagsList.styles';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Link,
	ListItem,
} from '@mui/material';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';
import { Tag } from '@src/types/tags';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const ChatTagsList: React.FC<Props> = ({ open, setOpen }) => {
	const config = React.useContext(AppConfigContext);

	const tags = useAppSelector((state) => state.tags.value);

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(false);

	const dispatch = useAppDispatch();

	const close = () => {
		setOpen(false);
	};

	const handleClick = (tag: Tag | undefined) => {
		dispatch(setFilterTagId(tag?.id));
		close();
	};

	return (
		<Styled.DialogWrapper open={open} onClose={close}>
			<DialogTitle>{t('Tags')}</DialogTitle>
			<DialogContent>
				<Styled.DialogContentWrapper>
					{t('You can filter chats by tags.')}
				</Styled.DialogContentWrapper>

				{tags && (
					<div>
						{tags.length > 0 ? (
							<div>
								{tags.map((tag) => (
									<ListItem
										key={tag.id}
										button
										onClick={() => handleClick(tag)}
									>
										<Styled.TagItem>
											<SellIcon style={{ fill: tag.web_inbox_color }} />
											{tag.name}
										</Styled.TagItem>
									</ListItem>
								))}
							</div>
						) : (
							<Styled.EmptyState>{t('Empty')}</Styled.EmptyState>
						)}
					</div>
				)}

				<Styled.ManageTagsLink>
					<Link
						href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
						target="_blank"
						underline="hover"
					>
						{t('Manage tags')}
					</Link>
				</Styled.ManageTagsLink>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>

			{isLoading && (
				<Styled.LoadingOverlay>
					<CircularProgress size={28} />
				</Styled.LoadingOverlay>
			)}
		</Styled.DialogWrapper>
	);
};

export default ChatTagsList;
