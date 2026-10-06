import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@src/lib/utils';
import CloseIcon from '@src/components/icons/Close';
import Send from '@src/components/icons/Send';
import AddIcon from '@src/components/icons/Add';
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
import InsertDriveFileIcon from '@src/components/icons/Draft';
import AudiotrackIcon from '@src/components/icons/MusicNote';

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
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';

interface Props {
	data: ChosenFileList | undefined;
	setData: (data: ChosenFileList) => void;
	sendHandledChosenFiles: (data: ChosenFileList) => void;
	setPreviewSendMediaVisible: (value: boolean) => void;
}

// The image, video or PDF being previewed
const previewClassName = 'max-h-full max-w-full rounded-[10px]';

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

	const captionInputId = React.useId();

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

	const handleSelectedFiles = (selectedFiles: FileList) => {
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
			className="absolute top-14 right-0 bottom-0 left-0 z-150 flex flex-col overflow-hidden bg-[#e6e6e6]"
			/*onDragEnter={() => setDragOverlayVisible(true)}*/
			onDrop={(event) => handleSelectedFiles(getDroppedFiles(event))}
			onDragOver={(event) => handleDragOver(event)}
		>
			<div className="box-border flex h-[49px] flex-none items-center bg-[#00bfa5] px-6.25 text-[18px] font-semibold text-white max-md:px-5">
				<CloseIcon
					className="mr-5 cursor-pointer text-white/70!"
					onClick={hidePreview}
				/>
				<span>{t('Preview')}</span>
			</div>

			<div className="relative m-6.25 flex flex-1 items-center justify-center">
				<div className="absolute top-0 flex size-full items-center justify-center">
					{chosenFile &&
						chosenFile.attachmentType === ATTACHMENT_TYPE_IMAGE && (
							<img
								className={previewClassName}
								src={chosenFile.fileURL}
								alt="Preview"
							/>
						)}
					{chosenFile &&
						chosenFile.attachmentType === ATTACHMENT_TYPE_VIDEO && (
							<video
								className={previewClassName}
								src={chosenFile.fileURL}
								controls={true}
							/>
						)}
					{chosenFile && chosenFile.isPDF && (
						<Document className={previewClassName} file={chosenFile.fileURL}>
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
							<span className="font-semibold text-primary">
								{chosenFile.file?.name}
							</span>
						</div>
					)}
			</div>

			{chosenFile &&
				(chosenFile.attachmentType === ATTACHMENT_TYPE_IMAGE ||
					chosenFile.attachmentType === ATTACHMENT_TYPE_VIDEO) && (
					<div className="px-35 py-10 max-2xl:px-7.5 max-md:px-5">
						<Field className="gap-1">
							<FieldLabel htmlFor={captionInputId}>
								{t('Add a caption...')}
							</FieldLabel>
							<Input
								id={captionInputId}
								className="bg-white"
								value={currentCaption}
								onChange={(e) => setCurrentCaption(e.target.value)}
							/>
						</Field>
					</div>
				)}

			<div className="relative bg-[#d9d9d9]">
				<div className="flex items-center justify-center overflow-x-auto p-6.25">
					{Object.entries(currentData).map((file: any) => {
						return (
							<span key={file[0]} className="group/thumb relative">
								<span
									className={cn(
										'mx-px flex size-[75px] cursor-pointer items-center justify-center border-3 border-transparent',
										chosenFile === file[1] &&
											'border-white shadow-[0_4px_6px_-6px_rgba(0,0,45,0.4)]'
									)}
									onClick={() => changePreview(file[0])}
								>
									{(file[1].attachmentType === ATTACHMENT_TYPE_IMAGE ||
										file[1].attachmentType === ATTACHMENT_TYPE_VIDEO) && (
										<img
											className="size-full bg-white object-cover"
											src={
												file[1].attachmentType === ATTACHMENT_TYPE_IMAGE
													? file[1].fileURL
													: EMPTY_IMAGE_BASE64
											}
											alt="Thumbnail"
										/>
									)}

									{file[1].attachmentType === ATTACHMENT_TYPE_DOCUMENT && (
										<span className="flex size-full items-center justify-center bg-gray-light [&_.app-icon]:size-[1.5em]!">
											<InsertDriveFileIcon />
										</span>
									)}

									{file[1].attachmentType === ATTACHMENT_TYPE_AUDIO && (
										<span className="flex size-full items-center justify-center bg-gray-light [&_.app-icon]:size-[1.5em]!">
											<AudiotrackIcon />
										</span>
									)}
								</span>

								{/* Shown while the thumbnail is hovered */}
								<Button
									variant="ghost"
									color="neutral"
									size="none"
									onClick={() => deleteByIndex(file[0])}
									className="absolute top-2 right-2 hidden! rounded-full bg-ink/20 p-0.5 group-hover/thumb:[display:initial]! hover:bg-ink/40 max-md:p-2.5 [&_.app-icon]:size-[0.6em]! [&_.app-icon]:text-white!"
								>
									<CloseIcon />
								</Button>
							</span>
						);
					})}

					<Button
						variant="unstyled"
						size="none"
						className="ml-1"
						onClick={() => fileInput.current?.click()}
					>
						<div className="flex size-[75px] cursor-pointer flex-col items-center justify-center bg-white text-[12px] text-primary [&_.app-icon]:mb-0.75 [&_.app-icon]:size-[1.25em]! [&_.app-icon]:text-primary!">
							<AddIcon />
							<span>{t('Add more')}</span>
						</div>
					</Button>

					<div className="hidden">
						<FileInput
							innerRef={fileInput}
							accept="*.*"
							handleSelectedFiles={handleSelectedFiles}
						/>
					</div>
				</div>

				<div className="absolute top-0 right-12.5 -mt-[33px] max-md:right-5">
					{/* Stays green on hover, as it did with MUI */}
					<Button
						variant="unstyled"
						color="neutral"
						size="none"
						className="rounded-full bg-[#09e85e] p-5 shadow-[0_4px_10px_-6px_rgba(0,0,45,0.4)] max-md:p-2.5 [&_.app-icon]:text-white! [&_svg]:size-6"
						onClick={send}
					>
						<Send />
					</Button>
				</div>
			</div>

			{isDragOverlayVisible && (
				<div
					className="absolute inset-0 z-151 bg-white/75 p-25"
					onDragLeave={() => setDragOverlayVisible(false)}
				>
					<div className="flex size-full items-center justify-center text-primary">
						{t('Drag and drop here')}
					</div>
				</div>
			)}
		</div>
	);
};

export default PreviewSendMedia;
