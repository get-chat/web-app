import React from 'react';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageDocument from './ChatMessageDocument';
import SmsIcon from '@src/components/icons/Sms';
import {
	insertTemplateComponentParameters,
	sortTemplateComponents,
} from '@src/helpers/TemplateMessageHelper';
import { useTranslation } from 'react-i18next';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import PrintMessage from '@src/components/PrintMessage';
import LaunchIcon from '@src/components/icons/OpenInNew';
import PhoneIcon from '@src/components/icons/Call';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';
import { Message } from '@src/types/messages';
import { getHeaderFileLink } from '@src/helpers/MessageHelper';
import MissingContent from './MissingContent';
import { Button } from '@src/components/ui/button';

// MUI's full-width text button, long labels wrapping; Chat.css gives the
// label its light blue, the icon follows it (`!` because App.css colours every
// MUI icon grey)
const templateButton =
	'h-auto min-h-9 w-full py-1.5 text-center font-semibold whitespace-normal [&_svg]:size-5! [&_svg]:text-current!';

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
		<div className="[&_a]:text-light-blue [&_button]:text-light-blue">
			<span className="mb-1.25 block text-[length:x-small] text-ink/60">
				<SmsIcon className="mr-1.25 size-[0.6em]! text-ink/40!" />
				{t('Template message')}
				<br />
			</span>

			<div>
				{templateData !== undefined ? (
					<div>
						{sortTemplateComponents(templateData.components ?? []).map(
							(component: any, index: number) => (
								<div key={index}>
									{component.type === 'HEADER' && (
										<div className="flex flex-col [&_img]:self-center">
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
													className="font-semibold [word-break:break-word]"
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
											className="[word-break:break-word]"
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
											className="[word-break:break-word] mt-1.25 text-[12px] text-ink/60"
										/>
									)}

									{component.type === 'BUTTONS' && (
										<div className="mt-2.5">
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

													const link = href ?? button.url;

													// Like MUI, a link only when there is somewhere to go
													return link ? (
														<Button
															asChild
															key={buttonIndex}
															variant="ghost"
															color="primary"
															className={templateButton}
														>
															<a href={link} target="_blank">
																{getIconByType(button.type)}
																{button.text}
															</a>
														</Button>
													) : (
														<Button
															key={buttonIndex}
															variant="ghost"
															color="primary"
															className={templateButton}
														>
															{getIconByType(button.type)}
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
