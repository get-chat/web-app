import React, { useContext, useState } from 'react';
import * as Styled from './ChatTagsList.styles';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Item } from '@src/components/ui/item';
import { Spinner } from '@src/components/ui/spinner';
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
	const config = useContext(AppConfigContext);

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
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<Styled.DialogWrapper aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{t('Tags')}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Styled.DialogContentWrapper>
						{t('You can filter chats by tags.')}
					</Styled.DialogContentWrapper>

					{tags && (
						<div>
							{tags.length > 0 ? (
								<div>
									{tags.map((tag) => (
										<Item key={tag.id} asChild size="xs" className="w-full">
											<button type="button" onClick={() => handleClick(tag)}>
												<Styled.TagItem>
													<SellIcon style={{ fill: tag.web_inbox_color }} />
													{tag.name}
												</Styled.TagItem>
											</button>
										</Item>
									))}
								</div>
							) : (
								<Styled.EmptyState>{t('Empty')}</Styled.EmptyState>
							)}
						</div>
					)}

					<Styled.ManageTagsLink>
						<Button asChild variant="link" color="primary" size="none">
							<a
								href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
								target="_blank"
							>
								{t('Manage tags')}
							</a>
						</Button>
					</Styled.ManageTagsLink>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>

				{isLoading && (
					<Styled.LoadingOverlay>
						<Spinner size={28} className="text-primary" />
					</Styled.LoadingOverlay>
				)}
			</Styled.DialogWrapper>
		</Dialog>
	);
};

export default ChatTagsList;
