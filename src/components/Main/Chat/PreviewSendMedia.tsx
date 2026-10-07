import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@src/lib/utils';
import CloseIcon from '@src/components/icons/Close';
import SendIcon from '@src/components/icons/Send';
import PlayArrowIcon from '@src/components/icons/PlayArrow';
import AddIcon from '@src/components/icons/Add';
import {
	ATTACHMENT_TYPE_AUDIO,
	ATTACHMENT_TYPE_DOCUMENT,
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
	EVENT_TOPIC_RELOAD_PREVIEW,
} from '@src/Constants';
import FileInput from '../../FileInput';
import {
	formatFileSize,
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
import { Input } from '@src/components/ui/input';
import { SimpleTooltip } from '@src/components/ui/tooltip';

interface Props {
	data: ChosenFileList | undefined;
	setData: (data: ChosenFileList) => void;
	sendHandledChosenFiles: (data: ChosenFileList) => void;
	setPreviewSendMediaVisible: (value: boolean) => void;
}

// The image or video being previewed
const previewClassName =
	'max-h-full max-w-full rounded-xl object-contain shadow-lg';

// Attachment types, as translated labels
const attachmentTypeLabels: { [type: string]: string } = {
	[ATTACHMENT_TYPE_IMAGE]: 'Image',
	[ATTACHMENT_TYPE_VIDEO]: 'Video',
	[ATTACHMENT_TYPE_AUDIO]: 'Audio',
	[ATTACHMENT_TYPE_DOCUMENT]: 'Document',
};

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

	const fileCount = getObjLength(currentData);
	const files = Object.values(currentData) as ChosenFileClass[];
	const chosenIndex = chosenFile ? files.indexOf(chosenFile) : -1;
	const canHaveCaption =
		chosenFile?.attachmentType === ATTACHMENT_TYPE_IMAGE ||
		chosenFile?.attachmentType === ATTACHMENT_TYPE_VIDEO;

	// "PDF · 1.2 MB", "Image · 340 KB"
	const describeFile = (chosen: ChosenFileClass) => {
		const extension = chosen.file?.name?.split('.').pop();
		const kind =
			chosen.attachmentType === ATTACHMENT_TYPE_DOCUMENT && extension
				? extension.toUpperCase()
				: t(attachmentTypeLabels[chosen.attachmentType] ?? 'Document');
		return [kind, formatFileSize(chosen.file?.size)]
			.filter(Boolean)
			.join(' · ');
	};

	return (
		<div
			className="absolute top-14 right-0 bottom-0 left-0 z-150 flex flex-col overflow-hidden bg-gray-light"
			onDragEnter={() => setDragOverlayVisible(true)}
			onDrop={(event) => {
				setDragOverlayVisible(false);
				handleSelectedFiles(getDroppedFiles(event));
			}}
			onDragOver={(event) => handleDragOver(event)}
		>
			{/* Which file this is, and how to leave */}
			<div className="flex h-14 flex-none items-center gap-2 border-b border-ink/6 bg-white px-2 max-md:px-1">
				<SimpleTooltip title={t('Close')} disableHoverableContent>
					<Button
						variant="ghost"
						color="neutral"
						size="icon-lg"
						className="rounded-full"
						aria-label={t('Close')}
						onClick={hidePreview}
					>
						<CloseIcon />
					</Button>
				</SimpleTooltip>
				{chosenFile && (
					<div className="min-w-0 flex-1">
						<div className="truncate text-[14px] font-semibold text-foreground">
							{chosenFile.file?.name ?? t('Preview')}
						</div>
						<div className="truncate text-[12px] text-muted-foreground">
							{describeFile(chosenFile)}
						</div>
					</div>
				)}
				{fileCount > 1 && chosenIndex >= 0 && (
					<span className="mr-3 shrink-0 text-[12px] font-medium text-muted-foreground tabular-nums">
						{chosenIndex + 1} / {fileCount}
					</span>
				)}
			</div>

			{/* The selected file, as large as fits */}
			<div className="relative flex min-h-0 flex-1 items-center justify-center p-6 max-md:p-4">
				{chosenFile?.attachmentType === ATTACHMENT_TYPE_IMAGE && (
					<img
						className={previewClassName}
						src={chosenFile.fileURL}
						alt={chosenFile.file?.name ?? t('Preview')}
					/>
				)}
				{chosenFile?.attachmentType === ATTACHMENT_TYPE_VIDEO && (
					<video
						className={cn(previewClassName, 'bg-black')}
						src={chosenFile.fileURL}
						controls={true}
					/>
				)}
				{chosenFile?.isPDF && (
					// The first page, on a white sheet
					<div className="max-h-full overflow-auto rounded-xl bg-white shadow-lg">
						<Document file={chosenFile.fileURL}>
							<Page pageNumber={1} scale={0.75} />
						</Document>
					</div>
				)}
				{chosenFile &&
					chosenFile.attachmentType !== ATTACHMENT_TYPE_IMAGE &&
					chosenFile.attachmentType !== ATTACHMENT_TYPE_VIDEO &&
					!chosenFile.isPDF && (
						// Files without a visual preview
						<div className="flex w-full max-w-[360px] flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-md">
							<span className="flex size-18 items-center justify-center rounded-2xl bg-primary/15 [&_.app-icon]:size-9! [&_.app-icon]:text-primary-deep!">
								{chosenFile.attachmentType === ATTACHMENT_TYPE_AUDIO ? (
									<AudiotrackIcon />
								) : (
									<InsertDriveFileIcon />
								)}
							</span>
							<div className="w-full">
								<div className="line-clamp-2 text-[15px] font-semibold break-all text-foreground">
									{chosenFile.file?.name}
								</div>
								<div className="mt-1 text-[13px] text-muted-foreground">
									{describeFile(chosenFile)}
								</div>
							</div>
							{chosenFile.attachmentType === ATTACHMENT_TYPE_AUDIO && (
								<audio className="w-full" src={chosenFile.fileURL} controls />
							)}
						</div>
					)}
			</div>

			{/* Images and videos only: the others are sent without one. Shaped
			like the chat's message box */}
			{canHaveCaption && (
				<div className="flex-none px-6 pb-4 max-md:px-4">
					<Input
						aria-label={t('Add a caption...')}
						placeholder={t('Add a caption...')}
						className="mx-auto block h-11 max-w-[640px] rounded-[12px] border-transparent bg-white px-5 text-[14px] shadow-sm md:text-[14px]"
						value={currentCaption}
						onChange={(e) => setCurrentCaption(e.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && !event.shiftKey) {
								event.preventDefault();
								send();
							}
						}}
					/>
				</div>
			)}

			{/* All selected files, more files, and send */}
			<div className="flex flex-none items-center gap-3 border-t border-ink/6 bg-white py-3 pr-4 pl-3 max-md:pr-3">
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="mx-auto flex w-max items-center gap-2 p-1.5">
						{files.map((file) => (
							<span key={file.key} className="group/thumb relative">
								<button
									type="button"
									aria-label={file.file?.name}
									aria-current={chosenFile === file}
									className={cn(
										'flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 bg-gray-lighter p-0 ring-2 ring-offset-2 ring-offset-white transition-[box-shadow] outline-none focus-visible:ring-primary/60',
										chosenFile === file ? 'ring-primary' : 'ring-transparent'
									)}
									onClick={() => changePreview(parseInt(file.key))}
								>
									{file.attachmentType === ATTACHMENT_TYPE_IMAGE && (
										<img
											className="size-full object-cover"
											src={file.fileURL}
											alt=""
										/>
									)}
									{file.attachmentType === ATTACHMENT_TYPE_VIDEO && (
										<>
											{/* Its first frame */}
											<video
												className="size-full object-cover"
												src={file.fileURL}
												muted
												preload="metadata"
											/>
											<span className="absolute flex size-6 items-center justify-center rounded-full bg-ink/55 [&_.app-icon]:size-4! [&_.app-icon]:text-white!">
												<PlayArrowIcon />
											</span>
										</>
									)}
									{file.attachmentType !== ATTACHMENT_TYPE_IMAGE &&
										file.attachmentType !== ATTACHMENT_TYPE_VIDEO && (
											<span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-muted-foreground uppercase [&_.app-icon]:size-6! [&_.app-icon]:text-primary-deep!">
												{file.attachmentType === ATTACHMENT_TYPE_AUDIO ? (
													<AudiotrackIcon />
												) : (
													<InsertDriveFileIcon />
												)}
												<span className="max-w-12 truncate">
													{file.file?.name?.split('.').pop()}
												</span>
											</span>
										)}
								</button>

								{/* On hover (always on touch screens) */}
								<button
									type="button"
									aria-label={t('Remove')}
									className="absolute -top-1 -right-1 flex size-5.5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-ink/75 p-0 opacity-0 transition-opacity group-hover/thumb:opacity-100 hover:bg-ink focus-visible:opacity-100 max-md:opacity-100 [&_.app-icon]:size-3! [&_.app-icon]:text-white!"
									onClick={() => deleteByIndex(parseInt(file.key))}
								>
									<CloseIcon />
								</button>
							</span>
						))}

						<SimpleTooltip title={t('Add more')} disableHoverableContent>
							<button
								type="button"
								aria-label={t('Add more')}
								className="flex size-14 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-transparent p-0 text-ink/45 transition-colors outline-none hover:border-primary hover:text-primary-deep focus-visible:border-primary [&_.app-icon]:size-6! [&_.app-icon]:text-current!"
								onClick={() => fileInput.current?.click()}
							>
								<AddIcon />
							</button>
						</SimpleTooltip>
					</div>

					<div className="hidden">
						<FileInput
							innerRef={fileInput}
							accept="*.*"
							handleSelectedFiles={handleSelectedFiles}
						/>
					</div>
				</div>

				<SimpleTooltip title={t('Send')} disableHoverableContent>
					<Button
						size="none"
						aria-label={t('Send')}
						className="relative size-12 shrink-0 rounded-full shadow-md [&_.app-icon]:size-6! [&_.app-icon]:text-primary-foreground!"
						onClick={send}
					>
						<SendIcon />
						{fileCount > 1 && (
							<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-ink px-1 text-[10px] font-semibold text-white tabular-nums">
								{fileCount}
							</span>
						)}
					</Button>
				</SimpleTooltip>
			</div>

			{isDragOverlayVisible && (
				<div
					className="absolute inset-0 z-151 flex items-center justify-center bg-white/85 p-6"
					onDragLeave={(event) => {
						// Only when leaving the overlay, not moving over its children
						if (!event.currentTarget.contains(event.relatedTarget as Node)) {
							setDragOverlayVisible(false);
						}
					}}
				>
					<div className="pointer-events-none flex size-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary text-[15px] font-medium text-primary-deep [&_.app-icon]:size-9! [&_.app-icon]:text-primary-deep!">
						<AddIcon />
						{t('Drag and drop here')}
					</div>
				</div>
			)}
		</div>
	);
};

export default PreviewSendMedia;
