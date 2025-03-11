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
} from '@src/Constants';
import FileInput from '../../FileInput';
import {
	getDroppedFiles,
	handleDragOver,
	prepareSelectedFiles,
} from '@src/helpers/FileHelper';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

// @ts-ignore
import { Document, Page, pdfjs } from 'react-pdf';
import PubSub from 'pubsub-js';
import { useForceUpdate } from '@src/hooks/useForceUpdate';
import {
	getFirstObject,
	getLastObject,
	getObjLength,
} from '@src/helpers/ObjectHelper';
import { useTranslation } from 'react-i18next';
import ChosenFileClass from '@src/ChosenFileClass';
import ChosenFileList from '@src/interfaces/ChosenFileList';

interface Props {
	data: ChosenFileList | undefined;
	setData: (data: ChosenFileList) => void;
	sendHandledChosenFiles: (data: ChosenFileList) => void;
	setPreviewSendMediaVisible: (value: boolean) => void;
}

const PreviewSendMedia: React.FC<Props> = ({
	data,
	setData,
	sendHandledChosenFiles,
	setPreviewSendMediaVisible,
}) => {
	const { t } = useTranslation();

	const fileInput = useRef<HTMLInputElement>(null);

	const [currentData, setCurrentData] = useState<ChosenFileList>({});
	const [chosenFile, setChosenFile] = useState<ChosenFileClass>();
	const [captions, setCaptions] = useState<{
		[key: string]: string | undefined | null;
	}>({});
	const [currentCaption, setCurrentCaption] = useState('');
	const [isDragOverlayVisible, setDragOverlayVisible] = useState(false);

	const forceUpdate = useForceUpdate();

	const hidePreview = () => {
		setPreviewSendMediaVisible(false);
	};

	const changePreview = (index: number) => {
		if (index >= 0 && currentData[index] !== undefined) {
			setChosenFile(currentData[index]);
		}
	};

	const deleteByIndex = (index: number) => {
		const dataSize = getObjLength(currentData);
		if (index >= 0 && currentData[index] !== undefined) {
			if (dataSize === 1) {
				setPreviewSendMediaVisible(false);
			} else {
				let nextState = {};
				setCurrentData((prevState) => {
					delete prevState[index];
					nextState = { ...prevState };
					return nextState;
				});

				if (chosenFile && chosenFile.key === index.toString()) {
					changePreview(getFirstObject(nextState).key);
				}

				setCaptions((prevState: { [key: string]: any }) => {
					delete prevState[index];
					return prevState;
				});
			}
		}
	};

	const send = () => {
		const finalData = currentData;

		// Inject captions
		const finalPreparedData: { [key: string]: any } = {};
		Object.entries(finalData).forEach((curChosenFile) => {
			const copyCurChosenFile = curChosenFile[1];
			copyCurChosenFile.caption = captions[copyCurChosenFile.key] ?? '';
			finalPreparedData[copyCurChosenFile.key] = copyCurChosenFile;
		});

		// Send
		sendHandledChosenFiles(finalData);

		// Hide
		setPreviewSendMediaVisible(false);
	};

	const handleSelectedFiles = (selectedFiles: object) => {
		console.log(selectedFiles);

		if (getObjLength(selectedFiles) > 0) {
			const preparedFiles = prepareSelectedFiles(selectedFiles);

			// Updating data with new files
			setCurrentData((prevState) => {
				const newState = prevState;
				let nextIndex = parseInt(getLastObject(newState).key) + 1;
				Object.entries(preparedFiles).forEach((curPreparedFile) => {
					const preparedFile: any = curPreparedFile[1];
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

		setCurrentData(data ?? {});
		setCaptions({});

		const reloadPreview = () => {
			// Just to rerender
			forceUpdate();
		};

		// Force async codec information
		const token = PubSub.subscribe(EVENT_TOPIC_RELOAD_PREVIEW, reloadPreview);

		return () => {
			// Clear data
			setData({});

			PubSub.unsubscribe(token);
		};
	}, []);

	useEffect(() => {
		if (chosenFile && currentData) {
			const handleKey = (event: KeyboardEvent) => {
				// If any element is focused, ignore key
				if (document.activeElement?.tagName === 'INPUT') {
					return false;
				}

				if (event.key === 'Escape') {
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
	}, [chosenFile, currentData]);

	useEffect(() => {
		if (chosenFile) {
			setCaptions((prevState) => {
				const newState: { [key: string]: string | undefined | null } = {};
				newState[chosenFile.key] = currentCaption;

				return { ...prevState, ...newState };
			});
		}
	}, [currentCaption]);

	useEffect(() => {
		// Preview first one
		if (!chosenFile && getObjLength(currentData) > 0) {
			changePreview(0);
		}
	}, [currentData]);

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
					{Object.entries(currentData).map((file: any) => {
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
};

export default PreviewSendMedia;
