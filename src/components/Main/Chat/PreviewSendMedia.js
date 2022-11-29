import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/PreviewSendMedia.css';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonBase, IconButton, TextField } from '@mui/material';
import Send from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import {
	ATTACHMENT_TYPE_AUDIO,
	ATTACHMENT_TYPE_DOCUMENT,
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
	EMPTY_IMAGE_BASE64,
	EVENT_TOPIC_RELOAD_PREVIEW,
} from '../../../Constants';
import FileInput from '../../FileInput';
import {
	getDroppedFiles,
	handleDragOver,
	prepareSelectedFiles,
} from '../../../helpers/FileHelper';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

import { Document, Page, pdfjs } from 'react-pdf';
import PubSub from 'pubsub-js';
import { useForceUpdate } from '../../../hooks/useForceUpdate';
import {
	getFirstObject,
	getLastObject,
	getObjLength,
} from '../../../helpers/ObjectHelper';
import { useTranslation } from 'react-i18next';

function PreviewSendMedia(props) {
	const { t } = useTranslation();

	const fileInput = useRef(null);

	const [data, setData] = useState({});
	const [chosenFile, setChosenFile] = useState();
	const [captions, setCaptions] = useState({});
	const [currentCaption, setCurrentCaption] = useState('');
	const [isDragOverlayVisible, setDragOverlayVisible] = useState(false);

	const forceUpdate = useForceUpdate();

	const hidePreview = () => {
		props.setPreviewSendMediaVisible(false);
	};

	const changePreview = (index) => {
		if (index >= 0 && data[index] !== undefined) {
			setChosenFile(data[index]);
		}
	};

	const deleteByIndex = (index) => {
		const dataSize = getObjLength(data);
		if (index >= 0 && data[index] !== undefined) {
			if (dataSize === 1) {
				props.setPreviewSendMediaVisible(false);
			} else {
				let nextState = {};
				setData((prevState) => {
					delete prevState[index];
					nextState = { ...prevState };
					return nextState;
				});

				if (chosenFile && chosenFile.key === index) {
					changePreview(getFirstObject(nextState).key);
				}

				setCaptions((prevState) => {
					delete prevState[index];
					return prevState;
				});
			}
		}
	};

	const send = () => {
		const finalData = data;

		// Inject captions
		const finalPreparedData = {};
		Object.entries(finalData).forEach((curChosenFile) => {
			const copyCurChosenFile = curChosenFile[1];
			copyCurChosenFile.caption = captions[copyCurChosenFile.key] ?? '';
			finalPreparedData[copyCurChosenFile.key] = copyCurChosenFile;
		});

		// Send
		props.sendHandledChosenFiles(finalData);

		// Hide
		props.setPreviewSendMediaVisible(false);
	};

	const handleSelectedFiles = (selectedFiles) => {
		console.log(selectedFiles);

		if (getObjLength(selectedFiles) > 0) {
			const preparedFiles = prepareSelectedFiles(selectedFiles);

			// Updating data with new files
			setData((prevState) => {
				const newState = prevState;
				let nextIndex = parseInt(getLastObject(newState).key) + 1;
				Object.entries(preparedFiles).forEach((curPreparedFile) => {
					const preparedFile = curPreparedFile[1];
					preparedFile.key = nextIndex.toString();
					newState[nextIndex] = preparedFile;
					nextIndex++;
				});

				return { ...newState };
			});
		}
	};

	useEffect(() => {
		// For PDF previews
		pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

		setData(props.data);
		setCaptions({});

		const reloadPreview = (msg, data) => {
			// Just to rerender
			forceUpdate();
		};

		// Force async codec information
		const token = PubSub.subscribe(EVENT_TOPIC_RELOAD_PREVIEW, reloadPreview);

		return () => {
			// Clear data
			props.setData({});

			PubSub.unsubscribe(token);
		};
	}, []);

	useEffect(() => {
		if (chosenFile && data) {
			const handleKey = (event) => {
				// If any element is focused, ignore key
				if (document.activeElement.tagName === 'INPUT') {
					return false;
				}

				if (event.keyCode === 27) {
					// Escape
					hidePreview();
				} else if (event.keyCode === 37) {
					// Left arrow
					changePreview(parseInt(chosenFile.key) - 1);
				} else if (event.keyCode === 39) {
					// Right arrow
					changePreview(parseInt(chosenFile.key) + 1);
				}
			};

			document.addEventListener('keydown', handleKey);

			return () => {
				document.removeEventListener('keydown', handleKey);
			};
		}
	}, [chosenFile, data]);

	useEffect(() => {
		if (chosenFile) {
			setCaptions((prevState) => {
				const newState = {};
				newState[chosenFile.key] = currentCaption;

				return { ...prevState, ...newState };
			});
		}
	}, [currentCaption]);

	useEffect(() => {
		// Preview first one
		if (!chosenFile && getObjLength(data) > 0) {
			changePreview(0);
		}
	}, [data]);

	useEffect(() => {
		if (chosenFile) {
			setCurrentCaption(captions[chosenFile.key] ?? '');
		}
	}, [chosenFile, captions]);

	return (
		<div
			className="previewSendMedia"
			/*onDragEnter={() => setDragOverlayVisible(true)}*/
			onDrop={(event) => handleSelectedFiles(getDroppedFiles(event))}
			onDragOver={(event) => handleDragOver(event)}
		>
			<div className="previewSendMedia__header">
				<CloseIcon onClick={hidePreview} />
				<span>{t('Preview')}</span>
			</div>

			<div className="previewSendMedia__preview">
				<div className="previewSendMedia__preview__wrapper">
					{chosenFile &&
						chosenFile.attachmentType === ATTACHMENT_TYPE_IMAGE && (
							<img
								className="previewSendMedia__preview__image"
								src={chosenFile.fileURL}
								alt="Preview"
							/>
						)}
					{chosenFile &&
						chosenFile.attachmentType === ATTACHMENT_TYPE_VIDEO && (
							<video
								className="previewSendMedia__preview__video"
								src={chosenFile.fileURL}
								controls={true}
							/>
						)}
					{chosenFile && chosenFile.isPDF && (
						<Document
							className="previewSendMedia__preview__pdf"
							file={chosenFile.fileURL}
						>
							<Page pageNumber={1} scale={0.75} />
						</Document>
					)}
				</div>

				{chosenFile &&
					chosenFile.attachmentType !== ATTACHMENT_TYPE_IMAGE &&
					chosenFile.attachmentType !== ATTACHMENT_TYPE_VIDEO &&
					!chosenFile.isPDF && (
						<div>
							{chosenFile.attachmentType},{' '}
							<span className="searchOccurrence">{chosenFile.file?.name}</span>
						</div>
					)}
			</div>

			{chosenFile &&
				(chosenFile.attachmentType === ATTACHMENT_TYPE_IMAGE ||
					chosenFile.attachmentType === ATTACHMENT_TYPE_VIDEO) && (
					<div className="previewSendMedia__caption">
						<TextField
							variant="standard"
							value={currentCaption}
							onChange={(e) => setCurrentCaption(e.target.value)}
							label={t('Add a caption...')}
							size="medium"
							fullWidth={true}
						/>
					</div>
				)}

			<div className="previewSendMedia__footer">
				<div className="previewSendMedia__footer__inner">
					{Object.entries(data).map((file) => {
						return (
							<span
								key={file[0]}
								className="previewSendMedia__footer__thumbnailOuter"
							>
								<span
									className={
										'previewSendMedia__footer__thumbnail' +
										(chosenFile === file[1] ? ' chosenFile' : '')
									}
									onClick={() => changePreview(file[0])}
								>
									{(file[1].attachmentType === ATTACHMENT_TYPE_IMAGE ||
										file[1].attachmentType === ATTACHMENT_TYPE_VIDEO) && (
										<img
											className="previewSendMedia__footer__thumbnail__image"
											src={
												file[1].attachmentType === ATTACHMENT_TYPE_IMAGE
													? file[1].fileURL
													: EMPTY_IMAGE_BASE64
											}
											alt="Thumbnail"
										/>
									)}

									{file[1].attachmentType === ATTACHMENT_TYPE_DOCUMENT && (
										<span className="previewSendMedia__footer__thumbnail__iconWrapper">
											<InsertDriveFileIcon />
										</span>
									)}

									{file[1].attachmentType === ATTACHMENT_TYPE_AUDIO && (
										<span className="previewSendMedia__footer__thumbnail__iconWrapper">
											<AudiotrackIcon />
										</span>
									)}
								</span>

								<IconButton
									onClick={() => deleteByIndex(file[0])}
									className="previewSendMedia__footer__thumbnail__delete"
									size="large"
								>
									<CloseIcon />
								</IconButton>
							</span>
						);
					})}

					<ButtonBase
						className="previewSendMedia__footer__addMoreWrapper"
						onClick={() => fileInput.current?.click()}
					>
						<div className="previewSendMedia__footer__addMore">
							<AddIcon />
							<span>{t('Add more')}</span>
						</div>
					</ButtonBase>

					<div className="hidden">
						<FileInput
							innerRef={fileInput}
							accept="*.*"
							handleSelectedFiles={handleSelectedFiles}
						/>
					</div>
				</div>

				<div className="previewSendMedia__footer__sendWrapper">
					<IconButton
						className="previewSendMedia__footer__send"
						onClick={send}
						size="large"
					>
						<Send />
					</IconButton>
				</div>
			</div>

			{isDragOverlayVisible && (
				<div
					className="previewSendMedia__dragOverlay"
					onDragLeave={() => setDragOverlayVisible(false)}
				>
					<div className="previewSendMedia__dragOverlay__innerWrapper">
						{t('Drag and drop here')}
					</div>
				</div>
			)}
		</div>
	);
}

export default PreviewSendMedia;
