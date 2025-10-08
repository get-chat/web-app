import React, { useEffect, useState } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import useSavedResponses from '@src/components/SavedResponseList/useSavedResponses';
import * as StyledChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage.styles';
import { MessageType } from '@src/types/messages';
import * as Styled from './SavedResponseList.styles';
import SearchBar from '@src/components/SearchBar';
import { fetchSavedResponses } from '@src/api/savedResponsesApi';
import { SavedResponse } from '@src/types/savedResponses';

export type Props = {
	sendCustomTextMessage: (text: string) => void;
};

const SavedResponseList: React.FC<Props> = ({ sendCustomTextMessage }) => {
	const { t } = useTranslation();

	const [deleteId, setDeleteId] = useState<number>();
	const [open, setOpen] = useState(false);

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
		if (deleteId) {
			await deleteSavedResponse(deleteId);
		}
		setOpen(false);
	};

	return (
		<div className="savedResponsesOuter">
			<div className="savedResponsesWrapper">
				<Styled.SearchContainer>
					<SearchBar
						value={search}
						onChange={(text) => {
							setSearch(text);
							setSearchTriggered(true);
						}}
						isLoading={isLoading}
						placeholder={t('Search')}
					/>
				</Styled.SearchContainer>
				<div className="savedResponses">
					{savedResponses.length === 0 && (
						<div className="savedResponses__emptyInfo mt-3">
							{search
								? t('No response message found.')
								: t('No response message have been saved yet.')}
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

							<Button
								onClick={() => sendCustomTextMessage(savedResponse.text)}
								// @ts-ignore
								color="black"
							>
								{t('Send')}
							</Button>
							<Button
								onClick={() => attemptToDelete(savedResponse.id)}
								color="secondary"
							>
								{t('Delete')}
							</Button>
						</div>
					))}
				</div>
			</div>

			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>{t('Oops!')}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t('Are you sure you want to delete this saved response?')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary">
						{t('No')}
					</Button>
					<Button onClick={handleDeleteSavedResponse} color="primary" autoFocus>
						{t('Yes')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default SavedResponseList;
