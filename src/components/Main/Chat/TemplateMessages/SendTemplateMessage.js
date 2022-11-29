import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonBase, TextField } from '@mui/material';
import '../../../../styles/SendTemplateMessage.css';
import FileInput from '../../../FileInput';
import { Alert, AlertTitle } from '@mui/lab';
import {
	componentHasMediaFormat,
	generateFinalTemplateParams,
	generateTemplateParamsByValues,
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { Trans, useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../../../contexts/ApplicationContext';
import PubSub from 'pubsub-js';
import {
	BreakException,
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	InvalidTemplateParamException,
} from '../../../../Constants';
import PublishIcon from '@mui/icons-material/Publish';
import LinkIcon from '@mui/icons-material/Link';

function SendTemplateMessage({
	data,
	setSending,
	bulkSend,
	send,
	sendButtonInnerRef,
	bulkSendButtonInnerRef,
}) {
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const template = data;

	const [params, setParams] = useState({});
	const [headerFileURL, setHeaderFileURL] = useState('');
	const [isUploading, setUploading] = useState(false);
	const [provideFileBy, setProvideFileBy] = useState();

	const FILE_PROVIDE_TYPE_UPLOAD = 'upload';
	const FILE_PROVIDE_TYPE_FILE_URL = 'file_url';

	const headerFileInput = useRef();

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
	}, [headerFileURL, params]);

	const updateParam = (event, index, paramKey) => {
		setParams((prevState) => {
			const nextState = prevState;
			nextState[index][paramKey].text = event.target.value;

			return { ...nextState };
		});
	};

	const sendAfterCheck = (isBulk) => {
		let hasError = false;
		const preparedParams = generateFinalTemplateParams(
			template,
			params,
			true,
			(error) => {
				if (error === BreakException) {
					PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
						{
							title: t('Missing parameters'),
							details: t('You need to fill the parameters!'),
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

		const finalData = template;
		finalData.params = Object.values(preparedParams);

		if (isBulk === true) {
			bulkSend(finalData);
		} else {
			send(finalData);
		}

		/*Object.entries(params).forEach((paramEntry) => {
			finalData.components[paramEntry[0]].params = paramEntry[1];
		});*/
	};

	const handleChosenImage = (file) => {
		if (!file) return;

		const formData = new FormData();
		formData.append('file_encoded', file[0]);

		setUploading(true);

		apiService.uploadMediaCall(
			formData,
			(response) => {
				const fileURL = response.data.file;
				setHeaderFileURL(fileURL);

				setUploading(false);
			},
			(error) => {
				setUploading(false);
			}
		);
	};

	const getMimetypeByFormat = (format) => {
		if (format === 'IMAGE') return 'image/jpeg, image/png';
		if (format === 'VIDEO') return 'video/mp4, video/3gpp';
		if (format === 'DOCUMENT') return '*/*';
	};

	return (
		<div className="sendTemplateMessage">
			<h4 className="sendTemplateMessage__title">{template.name}</h4>

			{template.components.map((comp, compIndex) => (
				<div key={compIndex} className="sendTemplateMessage__component">
					<div className="sendTemplateMessage__section">
						<h6>{comp.type}</h6>
						<div>
							{componentHasMediaFormat(comp) && (
								<div>
									<div className="sendTemplateMessage__section__fileType">
										{t('Type: %s', comp.format.toLowerCase())}
									</div>

									{!provideFileBy && (
										<div className="sendTemplateMessage__section__provideFileChoices">
											<ButtonBase
												component="div"
												onClick={() =>
													setProvideFileBy(FILE_PROVIDE_TYPE_UPLOAD)
												}
												className="sendTemplateMessage__section__provideFileChoices__choice"
											>
												<PublishIcon />
												<span>{t('Upload a file')}</span>
											</ButtonBase>
											<ButtonBase
												component="div"
												onClick={() =>
													setProvideFileBy(FILE_PROVIDE_TYPE_FILE_URL)
												}
												className="sendTemplateMessage__section__provideFileChoices__choice"
											>
												<LinkIcon />
												<span>{t('Enter a link to file')}</span>
											</ButtonBase>
										</div>
									)}

									{provideFileBy === FILE_PROVIDE_TYPE_UPLOAD && (
										<div>
											{headerFileURL && (
												<div>
													<Alert severity="success">
														<AlertTitle>
															{t('Uploaded successfully')}
														</AlertTitle>
														<a href={headerFileURL} target="_blank">
															{headerFileURL}
														</a>
													</Alert>
												</div>
											)}

											<FileInput
												innerRef={headerFileInput}
												multiple={false}
												accept={getMimetypeByFormat(comp.format)}
												handleSelectedFiles={handleChosenImage}
											/>

											<div className="sendTemplateMessage__section__uploadWrapper">
												<Button
													variant="contained"
													color="primary"
													onClick={() => headerFileInput.current.click()}
													disabled={isUploading}
													startIcon={<PublishIcon />}
												>
													<Trans>
														Upload {headerFileURL ? 'another ' : ''}
														{comp.format.toLowerCase()}
													</Trans>
												</Button>

												{headerFileURL && (
													<Button
														variant="contained"
														color="secondary"
														onClick={() => setHeaderFileURL('')}
													>
														{t('Delete')}
													</Button>
												)}
											</div>

											<div className="sendTemplateMessage__section__provideFileOtherChoice">
												<Button
													color="secondary"
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
											<TextField
												value={headerFileURL}
												onChange={(event) =>
													setHeaderFileURL(event.target.value)
												}
												label={t('Link to file')}
												type="text"
												autoFocus
												fullWidth
											/>

											<div className="sendTemplateMessage__section__provideFileOtherChoice">
												<Button
													color="secondary"
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
									<TextField
										multiline
										value={
											params[compIndex]
												? params[compIndex][templateParamToInteger(param)].text
												: ''
										}
										onChange={(event) =>
											updateParam(
												event,
												compIndex,
												templateParamToInteger(param)
											)
										}
										className="templateMessage__param"
										key={paramIndex}
										label={templateParamToInteger(param)}
										fullWidth={true}
									/>
								))}
							</div>
						</div>

						{comp.type === 'BUTTONS' && (
							<div>
								{comp.buttons.map((button, buttonIndex) => (
									<Button key={buttonIndex} color="primary" disabled={true}>
										{button.text}
									</Button>
								))}
							</div>
						)}
					</div>
				</div>
			))}
			<Button
				innerRef={sendButtonInnerRef}
				onClick={sendAfterCheck}
				className="hidden"
			>
				{t('Send')}
			</Button>
			<Button
				innerRef={bulkSendButtonInnerRef}
				onClick={() => sendAfterCheck(true)}
				className="hidden"
			>
				{t('Bulk Send')}
			</Button>
		</div>
	);
}

export default SendTemplateMessage;
