import React, { ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import FileInput from '../FileInput';
import { Alert, AlertTitle } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@src/components/ui/input-group';
import { Textarea } from '@src/components/ui/textarea';
import {
	componentHasMediaFormat,
	generateFinalTemplateParams,
	generateTemplateParamsByValues,
	getTemplateParams,
	extractParameterKey,
} from '@src/helpers/TemplateMessageHelper';
import {
	isImageSupported,
	isVideoSupported,
} from '@src/helpers/MediaFilesHelper';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	FORM_VALIDATION_ERROR,
	InvalidTemplateParamException,
} from '@src/Constants';
import PublishIcon from '@src/components/icons/Publish';
import LinkIcon from '@src/components/icons/Link';
import AttachFileIcon from '@src/components/icons/AttachFile';
import { AxiosError } from 'axios';
import { Template } from '@src/types/templates';
import { createMedia } from '@src/api/mediaApi';
import { isStringNumber } from '@src/helpers/IntegerHelper';

interface Props {
	data: Template;
	setSending: (value: boolean) => void;
	setErrors: (value: string[]) => void;
	send: (data: Template) => void;
	sendButtonInnerRef: React.Ref<HTMLButtonElement>;
}

// The uploaded header image or video
const headerMediaClassName = 'h-auto w-full rounded-[8px] object-cover';

// The two ways of providing the header's file: upload or link
const choiceClassName =
	'flex flex-1 cursor-pointer flex-col items-center justify-start rounded-[10px] px-2.5 py-1.25 whitespace-normal';
const choiceIconClassName = 'mb-2.5 size-[50px]!';
const choiceLabelClassName = 'text-center font-semibold text-muted-foreground';

const SendTemplateMessage: React.FC<Props> = ({
	data,
	setSending,
	setErrors,
	send,
	sendButtonInnerRef,
}) => {
	const { t } = useTranslation();

	const idPrefix = useId();

	const template = data;

	const [params, setParams] = useState<{
		[key: string | number]: { [key: string | number]: any };
	}>({});
	const [headerFileURL, setHeaderFileURL] = useState('');
	const [isUploading, setUploading] = useState(false);
	const [provideFileBy, setProvideFileBy] = useState<
		'upload' | 'file_url' | undefined
	>();

	const FILE_PROVIDE_TYPE_UPLOAD = 'upload';
	const FILE_PROVIDE_TYPE_FILE_URL = 'file_url';

	const headerFileInput = useRef<HTMLInputElement>();

	useEffect(() => {
		setParams(generateTemplateParamsByValues(template, undefined));
	}, []);

	useEffect(() => {
		// Update params when header image changes
		setParams((prevState) => {
			if (prevState[0]?.[0]?.['image']) {
				prevState[0][0]['image']['link'] = headerFileURL;
			} else if (prevState[0]?.[0]?.['video']) {
				prevState[0][0]['video']['link'] = headerFileURL;
			} else if (prevState[0]?.[0]?.['document']) {
				prevState[0][0]['document']['link'] = headerFileURL;
			}

			return prevState;
		});
		setErrors([]);
	}, [headerFileURL, params]);

	const updateParam = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		index: number,
		paramKey: string | null
	) => {
		setParams((prevState) => {
			const nextState = prevState;

			if (!!paramKey && nextState[index][paramKey]) {
				nextState[index][paramKey].text = event.target.value;

				// Inject parameter name if key is not a number
				if (!isStringNumber(paramKey)) {
					nextState[index][paramKey].parameter_name = paramKey;
				}
			}

			return { ...nextState };
		});
	};

	const sendAfterCheck = () => {
		let hasError = false;
		const preparedParams = generateFinalTemplateParams(
			template,
			params,
			true,
			(error) => {
				if (error.type === FORM_VALIDATION_ERROR) {
					PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
						{
							title: t('Missing parameters'),
							details: error.message,
						},
					]);
					hasError = true;
				} else if (error === InvalidTemplateParamException) {
					PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
						{
							title: t('Invalid parameters'),
							details: t(
								'Parameters cannot have new-line/tab characters or more than 3 consecutive spaces!'
							),
						},
					]);
					hasError = true;
				} else {
					throw error;
				}

				setSending(false);
			}
		);

		if (hasError) return;

		const finalData = { ...template };
		finalData.params = Object.values(preparedParams);

		send(finalData);

		/*Object.entries(params).forEach((paramEntry) => {
			finalData.components[paramEntry[0]].params = paramEntry[1];
		});*/
	};

	const handleChosenMedia = async (
		file: FileList | undefined,
		format: string
	) => {
		if (!file) return;

		// Image
		if (file[0].type.startsWith('image/')) {
			if (format !== 'IMAGE' || !isImageSupported(file[0].type)) {
				PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
					{
						title: t('Unsupported file type'),
						details: t('Please choose a supported image type (png, jpg)'),
					},
				]);

				return;
			} else {
				setErrors([]);
			}
		}

		// Video
		if (file[0].type.startsWith('video/')) {
			if (format !== 'VIDEO' || !isVideoSupported(file[0].type)) {
				PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
					{
						title: t('Unsupported file type'),
						details: t('Please choose a supported video type (mp4, 3gp)'),
					},
				]);

				return;
			} else {
				setErrors([]);
			}
		}

		const formData = new FormData();
		formData.append('file_encoded', file[0]);

		setUploading(true);

		try {
			const data = await createMedia(formData);
			const fileURL = data.file;
			setHeaderFileURL(fileURL);
		} catch (error: any | AxiosError) {
			console.error(error);
			if (error?.response?.status === 413) {
				window.displayCustomError('The media file is too big to upload!');
			} else {
				window.displayError(error);
			}
		} finally {
			setUploading(false);
		}
	};

	const getMimetypeByFormat = (format: string) => {
		if (format === 'IMAGE') return 'image/jpeg, image/png';
		if (format === 'VIDEO') return 'video/mp4, video/3gpp';
		if (format === 'DOCUMENT') return '*/*';
	};

	// Full sentences per format, so translations can inflect them freely
	const getUploadLabel = (format: string, hasFile: boolean) => {
		if (format === 'IMAGE')
			return hasFile ? t('Upload another image') : t('Upload image');
		if (format === 'VIDEO')
			return hasFile ? t('Upload another video') : t('Upload video');
		if (format === 'DOCUMENT')
			return hasFile ? t('Upload another document') : t('Upload document');
		return hasFile ? t('Upload another file') : t('Upload a file');
	};

	return (
		<div>
			<h4 className="mb-5 break-all">{template.name}</h4>

			{template.components?.map((comp, compIndex) => (
				<div key={compIndex}>
					<div className="mb-2.5 rounded-[10px] bg-ink/3 px-5 py-3.75 max-md:px-3.75">
						<h6 className="mb-1.25 text-ink/50">{comp.type}</h6>
						<div>
							{componentHasMediaFormat(comp) && (
								<div>
									<div className="mb-3.75 flex justify-center text-[16px] font-semibold text-primary">
										{t('Type: %s', comp.format?.toLowerCase())}
									</div>

									{headerFileURL && (
										<div className="mx-auto mb-5 flex w-50 items-center justify-center rounded-[8px] border border-[#ebebeb]">
											{comp.format === 'IMAGE' && (
												<img
													className={headerMediaClassName}
													src={headerFileURL}
													alt="header"
												/>
											)}
											{comp.format === 'VIDEO' && (
												<video
													className={headerMediaClassName}
													src={headerFileURL}
													controls
												/>
											)}
											{comp.format === 'DOCUMENT' && (
												<div className="flex h-[190px] w-35 flex-col items-center justify-center rounded-[8px]">
													<AttachFileIcon />
													<span>{t('Document')}</span>
												</div>
											)}
										</div>
									)}

									{!provideFileBy && (
										<div className="mt-2.5 flex">
											<Button
												type="button"
												variant="unstyled"
												size="none"
												onClick={() =>
													setProvideFileBy(FILE_PROVIDE_TYPE_UPLOAD)
												}
												className={choiceClassName}
											>
												<PublishIcon className={choiceIconClassName} />
												<span className={choiceLabelClassName}>
													{t('Upload a file')}
												</span>
											</Button>
											<Button
												type="button"
												variant="unstyled"
												size="none"
												onClick={() =>
													setProvideFileBy(FILE_PROVIDE_TYPE_FILE_URL)
												}
												className={choiceClassName}
											>
												<LinkIcon className={choiceIconClassName} />
												<span className={choiceLabelClassName}>
													{t('Enter a link to file')}
												</span>
											</Button>
										</div>
									)}

									{provideFileBy === FILE_PROVIDE_TYPE_UPLOAD && (
										<div>
											{headerFileURL && (
												<div>
													<Alert severity="success" className="mb-[10px]">
														<AlertTitle>
															{t('Uploaded successfully')}
														</AlertTitle>
														<a
															href={headerFileURL}
															target="_blank"
															className="font-semibold break-all underline"
														>
															{headerFileURL}
														</a>
													</Alert>
												</div>
											)}

											<FileInput
												innerRef={headerFileInput}
												multiple={false}
												accept={getMimetypeByFormat(comp.format ?? '')}
												handleSelectedFiles={(file) =>
													handleChosenMedia(file, comp.format ?? '')
												}
											/>

											<div className="flex justify-center">
												<Button
													variant="solid"
													color="primary"
													className="mr-[10px]"
													onClick={() => headerFileInput.current?.click()}
													disabled={isUploading}
												>
													<PublishIcon fontSize="small" />
													{getUploadLabel(
														comp.format ?? '',
														Boolean(headerFileURL)
													)}
												</Button>

												{headerFileURL && (
													<Button
														variant="solid"
														color="secondary"
														className="mr-[10px]"
														onClick={() => setHeaderFileURL('')}
													>
														{t('Delete')}
													</Button>
												)}
											</div>

											<div className="mt-7.5 flex justify-center">
												<Button
													variant="ghost"
													color="secondary"
													className="mr-[10px]"
													onClick={() =>
														setProvideFileBy(FILE_PROVIDE_TYPE_FILE_URL)
													}
												>
													{t('Enter a link to file instead')}
												</Button>
											</div>
										</div>
									)}

									{provideFileBy === FILE_PROVIDE_TYPE_FILE_URL && (
										<div>
											<Field className="gap-1">
												<FieldLabel htmlFor={`${idPrefix}-file-url`}>
													{t('Link to file')}
												</FieldLabel>
												<Input
													id={`${idPrefix}-file-url`}
													className="bg-white"
													value={headerFileURL}
													onChange={(event) =>
														setHeaderFileURL(event.target.value)
													}
													type="text"
													autoFocus
												/>
											</Field>

											<div className="mt-7.5 flex justify-center">
												<Button
													variant="ghost"
													color="secondary"
													className="mr-[10px]"
													onClick={() =>
														setProvideFileBy(FILE_PROVIDE_TYPE_UPLOAD)
													}
												>
													{t('Upload a file instead')}
												</Button>
											</div>
										</div>
									)}
								</div>
							)}

							{comp.text}
							<div>
								{getTemplateParams(comp.text).map((param, paramIndex) => (
									<Field className="mt-2.5! gap-1" key={paramIndex}>
										<FieldLabel
											htmlFor={`${idPrefix}-${compIndex}-param-${paramIndex}`}
										>
											{extractParameterKey(param)}
										</FieldLabel>
										<Textarea
											id={`${idPrefix}-${compIndex}-param-${paramIndex}`}
											rows={1}
											className="min-h-9 resize-none bg-white"
											value={
												params[compIndex]
													? params[compIndex][extractParameterKey(param) ?? '']
															?.text ?? ''
													: ''
											}
											onChange={(event) =>
												updateParam(
													event,
													compIndex,
													extractParameterKey(param)
												)
											}
										/>
									</Field>
								))}
							</div>
						</div>

						{comp.type === 'BUTTONS' && (
							<div className="flex flex-col gap-2.5 [&>*+*]:border-t [&>*+*]:border-[#ebebeb] [&>*+*]:pt-2.5">
								{comp.buttons?.map((button: any, idx: number) => (
									<div key={idx}>
										<Button
											variant="outline"
											color="primary"
											className="mr-[10px]"
											disabled
										>
											{button.text}
										</Button>

										{getTemplateParams(button.url).map((param, paramIndex) => (
											<InputGroup
												key={paramIndex}
												className="inline-flex w-auto bg-white align-bottom"
											>
												<InputGroupAddon align="inline-start">
													{button.url.replace(/\{\{[\d]+\}\}/g, '')}
												</InputGroupAddon>
												<InputGroupInput
													onChange={(event) =>
														updateParam(
															event,
															compIndex,
															extractParameterKey(param)
														)
													}
													value={
														params[compIndex]
															? params[compIndex][
																	extractParameterKey(param) ?? ''
															  ]?.text ?? ''
															: ''
													}
												/>
											</InputGroup>
										))}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			))}
			<Button
				ref={sendButtonInnerRef}
				variant="ghost"
				onClick={sendAfterCheck}
				className="hidden"
			>
				{t('Send')}
			</Button>
		</div>
	);
};

export default SendTemplateMessage;
