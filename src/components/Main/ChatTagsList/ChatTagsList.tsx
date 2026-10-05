import React, { useContext, useState } from 'react';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
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
import SellIcon from '@src/components/icons/Sell';
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
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{t('Tags')}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					{/* mb-[12px], not mb-3: App.css's legacy .mb-3 would win */}
					<div className="mb-[12px]">{t('You can filter chats by tags.')}</div>

					{tags && (
						<div>
							{tags.length > 0 ? (
								<div>
									{tags.map((tag) => (
										<Item
											key={tag.id}
											asChild
											size="xs"
											className="mt-1.25 w-full rounded-[10px]"
										>
											<button type="button" onClick={() => handleClick(tag)}>
												<div className="-mx-2.5 flex items-center text-[16px] font-semibold">
													<SellIcon
														className="mr-2.5"
														style={{ fill: tag.web_inbox_color }}
													/>
													{tag.name}
												</div>
											</button>
										</Item>
									))}
								</div>
							) : (
								<div className="text-[15px] text-ink/60">{t('Empty')}</div>
							)}
						</div>
					)}

					<div className="mt-[12px]">
						<Button asChild variant="link" color="primary" size="none">
							<a
								href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
								target="_blank"
							>
								{t('Manage tags')}
							</a>
						</Button>
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>

				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-white">
						<Spinner size={28} className="text-primary" />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ChatTagsList;
