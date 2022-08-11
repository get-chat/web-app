import React, { useEffect, useRef, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import '../../../../styles/SendTemplateMessage.css';
import FileInput from '../../../FileInput';
import { Alert, AlertTitle } from '@material-ui/lab';
import {
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { Trans, useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../../../contexts/ApplicationContext';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR } from '../../../../Constants';
import { isEmptyString } from '../../../../helpers/Helpers';
import PublishIcon from '@material-ui/icons/Publish';
import HttpIcon from '@material-ui/icons/Http';

function SendTemplateMessage(props) {
	const { apiService } = React.useContext(ApplicationContext);

	const { t } = useTranslation();

	const template = props.data;

	const [params, setParams] = useState({});
	const [headerFileURL, setHeaderFileURL] = useState('');
	const [isUploading, setUploading] = useState(false);
	const [addFileByURL, setAddFileByURL] = useState(false);
	const [provideFileBy, setProvideFileBy] = useState();

	const FILE_PROVIDE_TYPE_UPLOAD = 'upload';
	const FILE_PROVIDE_TYPE_FILE_URL = 'file_url';

	const headerFileInput = useRef();

	useEffect(() => {
		const preparedParams = {};
		const components = { ...template.components };

		Object.entries(components).forEach((paramEntry, paramIndex) => {
			const key = paramEntry[0];
			const component = paramEntry[1];
			const componentType = component.type;

			if (componentType === 'HEADER') {
				if (
					component.format === 'IMAGE' ||
					component.format === 'VIDEO' ||
					component.format === 'DOCUMENT'
				) {
					const format = component.format.toLowerCase();
					preparedParams[key] = {
						0: { type: format },
					};

					preparedParams[key][0][format] = { link: '' };
				}
			}

			const paramText = component.text;
			const templateParamsArray = getTemplateParams(paramText);

			templateParamsArray.map((extractedParam, extractedParamIndex) => {
				if (preparedParams[key] === undefined) {
					preparedParams[key] = {};
				}
				preparedParams[key][templateParamToInteger(extractedParam)] = {
					type: 'text',
					text: '',
				};
			});
		});

		setParams(preparedParams);
	}, []);

	useEffect(() => {
		// Update params when header image changes
		setParams((prevState) => {
			// TODO: Do this in a better way depends on template headers complexity
			if (prevState[0] && prevState[0][0] && prevState[0][0]['image']) {
				prevState[0][0]['image']['link'] = headerFileURL;
			} else if (prevState[0] && prevState[0][0] && prevState[0][0]['video']) {
				prevState[0][0]['video']['link'] = headerFileURL;
			} else if (
				prevState[0] &&
				prevState[0][0] &&
				prevState[0][0]['document']
			) {
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

	const send = (isBulk) => {
		const preparedParams = {};
		const components = { ...template.components };

		const BreakException = {};

		try {
			Object.entries(components).forEach((paramEntry, paramIndex) => {
				const key = paramEntry[0];
				const component = paramEntry[1];

				if (params[key]) {
					const paramsArray = Object.values(params[key]);

					// Check if has empty params and throw BreakException if found
					paramsArray.forEach((param) => {
						if (
							isEmptyString(
								param.text ??
									param.image?.link ??
									param.video?.link ??
									param.document?.link
							)
						) {
							throw BreakException;
						}
					});

					/*const localizableParams = [];
					paramsArray.forEach((paramArrayItem) => {
						localizableParams.push({
							default: paramArrayItem.text,
						});
					});*/

					preparedParams[component.type] = {
						type: component.type.toLowerCase(),
						parameters: paramsArray,
						//localizable_params: localizableParams
					};
				}
			});
		} catch (error) {
			if (error === BreakException) {
				PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, [
					{
						title: t('Missing parameters'),
						details: t('You need to fill the parameters!'),
					},
				]);
				props.setSending(false);
				return;
			} else {
				throw error;
			}
		}

		const finalData = template;
		finalData.params = Object.values(preparedParams);

		if (isBulk === true) {
			props.bulkSend(finalData);
		} else {
			props.send(finalData);
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

			{template.components.map((comp, index) => (
				<div key={index} className="sendTemplateMessage__component">
					<div className="sendTemplateMessage__section">
						<h6>{comp.type}</h6>
						<div>
							{(comp.format === 'IMAGE' ||
								comp.format === 'VIDEO' ||
								comp.format === 'DOCUMENT') && (
								<div>
									{!provideFileBy && (
										<div className="sendTemplateMessage__section__provideFileChoices">
											<div className="sendTemplateMessage__section__provideFileChoices__choice">
												<PublishIcon />
												<span>{t('Upload a file')}</span>
											</div>
											<div className="sendTemplateMessage__section__provideFileChoices__choice">
												<HttpIcon />
												<span>{t('Enter a file URL')}</span>
											</div>
										</div>
									)}

									{provideFileBy === FILE_PROVIDE_TYPE_UPLOAD && (
										<div>
											<div>
												{headerFileURL && (
													<div>
														<Alert severity="success">
															<AlertTitle>Uploaded successfully</AlertTitle>
															<a href={headerFileURL} target="_blank">
																{headerFileURL}
															</a>
														</Alert>
													</div>
												)}
											</div>
											<FileInput
												innerRef={headerFileInput}
												multiple={false}
												accept={getMimetypeByFormat(comp.format)}
												handleSelectedFiles={handleChosenImage}
											/>
											<Button
												color="primary"
												onClick={() => headerFileInput.current.click()}
												disabled={isUploading}
											>
												<Trans>
													Upload {headerFileURL ? 'another ' : ''}
													{comp.format.toLowerCase()}
												</Trans>
											</Button>
											{headerFileURL && (
												<Button
													color="secondary"
													onClick={() => setHeaderFileURL('')}
												>
													{t('Delete')}
												</Button>
											)}
										</div>
									)}

									{provideFileBy === FILE_PROVIDE_TYPE_FILE_URL && (
										<div>
											{addFileByURL && (
												<TextField
													value={headerFileURL}
													onChange={(event) =>
														setHeaderFileURL(event.target.value)
													}
													label={t('File URL')}
													type="text"
													autoFocus
													fullWidth
												/>
											)}
										</div>
									)}
								</div>
							)}

							{comp.text}
							<div>
								{getTemplateParams(comp.text).map((param, paramIndex) => (
									<TextField
										value={
											params[index]
												? params[index][templateParamToInteger(param)].text
												: ''
										}
										onChange={(event) =>
											updateParam(event, index, templateParamToInteger(param))
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
				innerRef={props.sendButtonInnerRef}
				onClick={send}
				className="hidden"
			>
				{t('Send')}
			</Button>
			<Button
				innerRef={props.bulkSendButtonInnerRef}
				onClick={() => send(true)}
				className="hidden"
			>
				{t('Bulk Send')}
			</Button>
		</div>
	);
}

export default SendTemplateMessage;
