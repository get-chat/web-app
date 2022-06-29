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
} from '@material-ui/core';
import '../../styles/ChatTagsList.css';
import LabelIcon from '@material-ui/icons/Label';
import { getHubURL } from '../../helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfig } from '../../contexts/AppConfig';

function ChatTagsList(props) {
	const config = React.useContext(AppConfig);

	const { t, i18n } = useTranslation();

	const [isLoading, setLoading] = useState(false);

	const close = () => {
		props.setOpen(false);
	};

	const handleClick = (tag) => {
		props.setFilterTag(tag);
		close();
	};

	return (
		<Dialog open={props.open} onClose={close} className="chatTagsListWrapper">
			<DialogTitle>{t('Tags')}</DialogTitle>
			<DialogContent className="chatTagsListWrapper">
				<div className="mb-3">{t('You can filter chats by tags.')}</div>

				{props.tags && (
					<div className="chatTagsList">
						{props.tags.length > 0 ? (
							<div>
								{props.tags.map((tag) => (
									<ListItem
										key={tag.id}
										button
										onClick={() => handleClick(tag)}
									>
										<div className="chatTagsListWrapper__tag">
											<LabelIcon
												style={{
													fill: tag.web_inbox_color,
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
