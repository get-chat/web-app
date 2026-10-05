import React, { useEffect, useState } from 'react';
import { Button } from '@src/components/ui/button';
import { ClickAwayListener } from '@src/components/ui/click-away-listener';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import SendIcon from '@src/components/icons/Send';
import DeleteOutlineIcon from '@src/components/icons/Delete';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import useSavedResponses from '@src/components/SavedResponseList/useSavedResponses';
import * as StyledChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage.styles';
import { MessageType } from '@src/types/messages';
import MessageActionButton from '@src/components/MessageActionButton';
import SearchBar from '@src/components/SearchBar';
import { fetchSavedResponses } from '@src/api/savedResponsesApi';
import { SavedResponse } from '@src/types/savedResponses';
import { PanelTransitionProps } from '@src/styles/panelTransitions';

export type Props = {
	sendCustomTextMessage: (text: string) => void;
} & PanelTransitionProps;

const SavedResponseList: React.FC<Props> = ({
	sendCustomTextMessage,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [deleteId, setDeleteId] = useState<number>();
	const [open, setOpen] = useState(false);

	const closePanel = () =>
		dispatch(setState({ isSavedResponsesVisible: false }));

	const [isLoading, setLoading] = useState<boolean>(false);
	const [isSearchTriggered, setSearchTriggered] = useState<boolean>(false);
	const [search, setSearch] = useState<string>('');

	const savedResponsesUIState = useAppSelector(
		(state) => state.savedResponses.value
	);

	const [savedResponses, setSavedResponses] = useState<SavedResponse[]>(
		savedResponsesUIState
	);

	const { deleteSavedResponse } = useSavedResponses();

	// Keep the list in sync with the store (e.g. a message saved as response),
	// unless the user is filtering via search
	useEffect(() => {
		if (!search) {
			setSavedResponses(savedResponsesUIState);
		}
	}, [savedResponsesUIState]);

	const handleClose = () => {
		setOpen(false);
	};

	const attemptToDelete = (id: number) => {
		setDeleteId(id);
		setOpen(true);
	};

	useEffect(() => {
		if (!isSearchTriggered) return;

		const delay = setTimeout(handleFetchSavedResponses, 500);

		return () => {
			clearTimeout(delay);
		};
	}, [search]);

	const handleFetchSavedResponses = async () => {
		setLoading(true);

		try {
			const data = await fetchSavedResponses(
				!!search ? { text: search } : undefined
			);
			setSavedResponses(data.results);
		} catch (error) {
			console.error('Failed to fetch responses:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteSavedResponse = async () => {
		setOpen(false);
		if (deleteId) {
			await deleteSavedResponse(deleteId);
			await handleFetchSavedResponses();
		}
	};

	return (
		<ClickAwayListener
			onClickAway={() => {
				// Not while the delete confirmation dialog is open: it is
				// portaled outside the panel, so its clicks would close both
				if (!open) closePanel();
			}}
		>
			{/* savedResponsesOuter and the classes inside: styled in Chat.css */}
			<div className="savedResponsesOuter" onAnimationEnd={onAnimationEnd}>
				<div className="savedResponsesWrapper">
					{/* The search sits on the chat background, without its own */}
					<div className="flex flex-col [&_.app-icon]:text-chat-icon! [&_.searchBar\_\_inputContainer]:bg-transparent [&_input::placeholder]:text-chat-icon!">
						<SearchBar
							value={search}
							onChange={(text) => {
								setSearch(text);
								setSearchTriggered(true);
							}}
							isLoading={isLoading}
							placeholder={t('Search quick replies')}
							isFocusStyleEnabled={false}
						/>
					</div>
					<div className="savedResponses">
						{savedResponses.length === 0 && (
							<div className="savedResponses__emptyInfo mt-3">
								{search
									? t('No quick reply found.')
									: t('No quick replies have been saved yet.')}
							</div>
						)}

						{savedResponses.map((savedResponse) => (
							<div key={savedResponse.id} className="savedResponseWrapper">
								<StyledChatMessage.ChatMessage
									$type={MessageType.text}
									$isOutgoing={true}
									className="chat__savedResponse"
								>
									{/*<span className={"templateMessage__status " + savedResponse[1].status}>{savedResponse[1].status}</span>*/}
									<div className="savedResponse__message">
										{savedResponse.text}
									</div>
								</StyledChatMessage.ChatMessage>

								<SimpleTooltip title={t('Send')}>
									<MessageActionButton
										aria-label={t('Send')}
										onClick={() => {
											sendCustomTextMessage(savedResponse.text);
											// Close the panel as soon as a response is sent
											closePanel();
										}}
									>
										<SendIcon />
									</MessageActionButton>
								</SimpleTooltip>
								<SimpleTooltip title={t('Delete')}>
									<MessageActionButton
										tone="delete"
										aria-label={t('Delete')}
										onClick={() => attemptToDelete(savedResponse.id)}
									>
										<DeleteOutlineIcon />
									</MessageActionButton>
								</SimpleTooltip>
							</div>
						))}
					</div>
				</div>

				<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t('Oops!')}</DialogTitle>
						</DialogHeader>
						<DialogBody>
							<DialogDescription>
								{t('Are you sure you want to delete this quick reply?')}
							</DialogDescription>
						</DialogBody>
						<DialogFooter>
							<Button variant="ghost" color="secondary" onClick={handleClose}>
								{t('No')}
							</Button>
							<Button
								variant="ghost"
								color="primary"
								onClick={handleDeleteSavedResponse}
								autoFocus
							>
								{t('Yes')}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</ClickAwayListener>
	);
};

export default SavedResponseList;
