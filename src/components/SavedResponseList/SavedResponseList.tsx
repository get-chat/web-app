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

	const sendSavedResponse = (id: string) => {
		sendCustomTextMessage(savedResponses[id.toString()].text);
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

					{Object.entries(savedResponses).map((savedResponse) => (
						<div key={savedResponse[0]} className="savedResponseWrapper">
							<div className="chat__savedResponse chat__message chat__outgoing">
								{/*<span className={"templateMessage__status " + savedResponse[1].status}>{savedResponse[1].status}</span>*/}
								<div className="savedResponse__message">
									{savedResponse[1].text}
								</div>
							</div>

							<Button
								onClick={() => sendSavedResponse(savedResponse[0])}
								// @ts-ignore
								color="black"
							>
								{t('Send')}
							</Button>
							<Button
								onClick={() => attemptToDelete(savedResponse[1].id)}
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
