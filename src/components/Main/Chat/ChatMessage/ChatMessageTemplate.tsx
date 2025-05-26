import React from 'react';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageDocument from './ChatMessageDocument';
import { Button } from '@mui/material';
import SmsIcon from '@mui/icons-material/Sms';
import {
	insertTemplateComponentParameters,
	sortTemplateComponents,
} from '@src/helpers/TemplateMessageHelper';
import { useTranslation } from 'react-i18next';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import PrintMessage from '@src/components/PrintMessage';
import LaunchIcon from '@mui/icons-material/Launch';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';
import { Message } from '@src/types/messages';
import { getHeaderFileLink } from '@src/helpers/MessageHelper';
import MissingContent from './MissingContent';

const getIconByType = (type: string) => {
	switch (type) {
		case 'URL':
			return <LaunchIcon />;
		case 'PHONE_NUMBER':
			return <PhoneIcon />;
		default:
			return;
	}
};

interface Props {
	data: Message;
	templateData: Template | undefined;
	onPreview: (type: string, source: string) => void;
	onOptionsClick: (e: React.MouseEvent) => void;
}

const ChatMessageTemplate: React.FC<Props> = ({
	data,
	templateData,
	onPreview,
	onOptionsClick,
}) => {
	const { t } = useTranslation();

	const { isTemplatesFailed } = useAppSelector((state) => state.UI);

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
						{sortTemplateComponents(templateData.components ?? []).map(
							(component: any, index: number) => (
								<div key={index}>
									{component.type === 'HEADER' && (
										<div className="chat__templateContent__header">
											{component.format === 'IMAGE' && (
												<ChatMessageImage
													data={data}
													source={getHeaderFileLink(data, 'image')}
													onPreview={() =>
														onPreview(
															ATTACHMENT_TYPE_IMAGE,
															getHeaderFileLink(data, 'image')
														)
													}
												/>
											)}
											{component.format === 'VIDEO' && (
												<ChatMessageVideo
													source={getHeaderFileLink(data, 'video')}
													onPreview={() =>
														onPreview(
															ATTACHMENT_TYPE_VIDEO,
															getHeaderFileLink(data, 'video')
														)
													}
													onOptionsClick={onOptionsClick}
												/>
											)}
											{component.format === 'DOCUMENT' && (
												<ChatMessageDocument data={data} />
											)}
											{component.format === 'TEXT' && (
												<PrintMessage
													message={insertTemplateComponentParameters(
														component,
														data.waba_payload?.template?.components ?? []
													)}
													as="div"
													linkify={true}
													className="bold wordBreakWord"
												/>
											)}
										</div>
									)}

									{component.type === 'BODY' && (
										<PrintMessage
											message={insertTemplateComponentParameters(
												component,
												data.waba_payload?.template?.components ?? []
											)}
											as="div"
											linkify={true}
											className="chat__templateContent__body wordBreakWord"
										/>
									)}

									{component.type === 'FOOTER' && (
										<PrintMessage
											message={insertTemplateComponentParameters(
												component,
												data.waba_payload?.template?.components ?? []
											)}
											as="div"
											linkify={true}
											className="chat__templateContent__footer wordBreakWord mt-1"
										/>
									)}

									{component.type === 'BUTTONS' && (
										<div className="chat__templateContent__buttons">
											{component.buttons.map(
												(button: any, buttonIndex: number) => {
													let href: string;

													const targetParams =
														data.waba_payload?.template?.components?.find(
															(item) => {
																return (
																	item.type?.toLowerCase() === 'button' &&
																	item.index === buttonIndex
																);
															}
														);

													switch (button.type) {
														case 'URL':
															href =
																targetParams &&
																button.url.replace(
																	/\{\{[\d]+\}\}/g,
																	targetParams.parameters?.[0]?.text
																);
															break;
														case 'PHONE_NUMBER':
															href = `tel:${button.phone_number}`;
															break;
														default:
															href = '';
															break;
													}

													return (
														<Button
															href={href ?? button.url}
															target="_blank"
															key={buttonIndex}
															startIcon={getIconByType(button.type)}
															color="primary"
															fullWidth={true}
														>
															{button.text}
														</Button>
													);
												}
											)}
										</div>
									)}
								</div>
							)
						)}
					</div>
				) : (
					<div>
						{isTemplatesFailed ? (
							<span>
								[
								{t(
									"Your template was sent to the user successfully, however we couldn't load templates at this moment. Please check again in a while, sorry!"
								)}
								]
							</span>
						) : (
							<MissingContent>{t('Missing template')}</MissingContent>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessageTemplate;
