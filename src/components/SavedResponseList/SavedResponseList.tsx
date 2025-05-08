import React, { useState } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { getObjLength } from '@src/helpers/ObjectHelper';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import useSavedResponses from '@src/components/SavedResponseList/useSavedResponses';
import * as StyledChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage.styles';
import { MessageType } from '@src/types/messages';

export type Props = {
	sendCustomTextMessage: (text: string) => void;
};

const SavedResponseList: React.FC<Props> = ({ sendCustomTextMessage }) => {
	const { t } = useTranslation();

	const [deleteId, setDeleteId] = useState<number>();
	const [open, setOpen] = React.useState(false);

	const savedResponses = useAppSelector((state) => state.savedResponses.value);

	const { deleteSavedResponse } = useSavedResponses();

	const handleClose = () => {
		setOpen(false);
	};

	const attemptToDelete = (id: number) => {
		setDeleteId(id);
		setOpen(true);
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
				<div className="savedResponses">
					{getObjLength(savedResponses) === 0 && (
						<div className="savedResponses__emptyInfo mt-3">
							{t('No response message have been saved yet.')}
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
