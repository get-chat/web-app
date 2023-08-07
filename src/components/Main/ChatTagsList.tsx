// @ts-nocheck
import React, { useState } from 'react';
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
import '../../styles/ChatTagsList.css';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';

function ChatTagsList(props) {
	const config = React.useContext(AppConfigContext);

	const tags = useAppSelector((state) => state.tags.value);

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(false);

	const dispatch = useAppDispatch();

	const close = () => {
		props.setOpen(false);
	};

	const handleClick = (tag) => {
		dispatch(setFilterTagId(tag?.id));
		close();
	};

	return (
		<Dialog open={props.open} onClose={close} className="chatTagsListWrapper">
			<DialogTitle>{t('Tags')}</DialogTitle>
			<DialogContent className="chatTagsListWrapper">
				<div className="mb-3">{t('You can filter chats by tags.')}</div>

				{tags && (
					<div className="chatTagsList">
						{tags.length > 0 ? (
							<div>
								{tags.map((tag) => (
									<ListItem
										key={tag.id}
										button
										onClick={() => handleClick(tag)}
									>
										<div className="chatTagsListWrapper__tag">
											<SellIcon
												style={{
													fill: tag.color,
												}}
											/>
											{tag.name}
										</div>
									</ListItem>
								))}
							</div>
						) : (
							<div className="chatTagsList__empty">{t('Empty')}</div>
						)}
					</div>
				)}

				<div className="mt-3">
					<Link
						href={getHubURL(config.API_BASE_URL) + 'main/tag/'}
						target="_blank"
						underline="hover"
					>
						{t('Manage tags')}
					</Link>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>

			{isLoading && (
				<div className="chatTagsListWrapper__loading">
					<CircularProgress size={28} />
				</div>
			)}
		</Dialog>
	);
}

export default ChatTagsList;
