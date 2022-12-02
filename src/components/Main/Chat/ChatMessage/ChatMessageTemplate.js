import React from 'react';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageDocument from './ChatMessageDocument';
import { Button } from '@mui/material';
import SmsIcon from '@mui/icons-material/Sms';
import {
	insertTemplateComponentParameters,
	sortTemplateComponents,
} from '../../../../helpers/TemplateMessageHelper';
import { useTranslation } from 'react-i18next';
import {
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
} from '../../../../Constants';

function ChatMessageTemplate(props) {
	const { t } = useTranslation();

	const data = props.data;
	const templateData = props.templateData;

	return (
		<div className="chat__template">
			<span className="chat__templateHeader">
				<SmsIcon />
				{t('Template message')}
				<br />
			</span>

			<div className="chat__templateContent">
				{templateData !== undefined ? (
					<div>
						{sortTemplateComponents(templateData.components).map(
							(component, index) => (
								<div key={index}>
									{component.type === 'HEADER' && (
										<div className="chat__templateContent__header">
											{component.format === 'IMAGE' && (
												<ChatMessageImage
													data={data}
													source={data.getHeaderFileLink('image')}
													onPreview={() =>
														props.onPreview(
															ATTACHMENT_TYPE_IMAGE,
															data.getHeaderFileLink('image')
														)
													}
												/>
											)}
											{component.format === 'VIDEO' && (
												<ChatMessageVideo
													data={data}
													source={data.getHeaderFileLink('video')}
													onPreview={() =>
														props.onPreview(
															ATTACHMENT_TYPE_VIDEO,
															data.getHeaderFileLink('video')
														)
													}
												/>
											)}
											{component.format === 'DOCUMENT' && (
												<ChatMessageDocument data={data} />
											)}
											{component.format === 'TEXT' && (
												<div
													className="bold wordBreakAll"
													dangerouslySetInnerHTML={{
														__html: insertTemplateComponentParameters(
															component,
															data.templateParameters
														),
													}}
												/>
											)}
										</div>
									)}

									{component.type === 'BODY' && (
										<div
											className="chat__templateContent__body wordBreakAll"
											dangerouslySetInnerHTML={{
												__html: insertTemplateComponentParameters(
													component,
													data.templateParameters
												),
											}}
										/>
									)}

									{component.type === 'FOOTER' && (
										<div
											className="chat__templateContent__footer wordBreakAll mt-1"
											dangerouslySetInnerHTML={{
												__html: insertTemplateComponentParameters(
													component,
													data.templateParameters
												),
											}}
										/>
									)}

									{component.type === 'BUTTONS' && (
										<div className="chat__templateContent__buttons">
											{component.buttons.map((button, buttonIndex) => (
												<Button
													href={button.type === 'URL' ? button.url : ''}
													target={'_blank'}
													key={buttonIndex}
													color="primary"
													fullWidth={true}
													disabled={button.type !== 'URL'}
												>
													{button.text}
												</Button>
											))}
										</div>
									)}
								</div>
							)
						)}
					</div>
				) : (
					<div>
						{props.isTemplatesFailed ? (
							<span>
								[
								{t(
									"Your template was sent to the user successfully, however we couldn't load templates at this moment. Please check again in a while, sorry!"
								)}
								]
							</span>
						) : (
							<span>[{t('Missing template')}]</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default ChatMessageTemplate;
