import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import Moment from 'react-moment';
import DoneIcon from '@src/components/icons/Check';
import DoneAll from '@src/components/icons/DoneAll';
import useMessageStatuses from '@src/components/MessageStatuses/useMessageStatuses';
import ChatMessageErrors from '@src/components/ChatMessageErrors';
import useReactions from '@src/hooks/useReactions';
import { CALENDAR_SHORT } from '@src/Constants';
import PrintMessage from '@src/components/PrintMessage';
import { Message } from '@src/types/messages';
import {
	getMessageTimestamp,
	getSenderName,
	hasAnyStatus,
} from '@src/helpers/MessageHelper';
import { findTemplate } from '@src/helpers/TemplateMessageHelper';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import SidePanel from '@src/components/SidePanel';
import { ProfileSection } from '@src/components/ProfilePanel';
import { cn } from '@src/lib/utils';

// The small tick icons in front of each status
const statusIconClassName = 'mr-1.25 size-[0.7em]!';
import { Separator } from '@src/components/ui/separator';

interface Props extends PanelTransitionProps {
	message?: Message;
}

const dateFormat = 'H:mm, DD.MM.YYYY';

const MessageStatuses: React.FC<Props> = ({
	message: initialMessage,
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();

	const { message, templates, close } = useMessageStatuses({ initialMessage });
	const { reactions } = useReactions({
		reactionsHistory: message?.reactions,
	});

	return (
		<SidePanel
			className="z-10"
			title={t('Message Information')}
			onClose={close}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<div className="relative flex flex-1 flex-col overflow-y-auto bg-gray-light">
				{message && (
					<>
						<div className="mb-2.5 bg-chat-bg bg-(image:--chat-bg-image) bg-repeat p-3.75 shadow-[0_1px_3px_var(--shadow-light)] [&_.chat\_\_message]:my-0!">
							<ChatMessage
								data={message}
								templateData={findTemplate(
									templates,
									message.waba_payload?.template?.name,
									message.waba_payload?.template?.language
								)}
							/>
						</div>

						{reactions.length > 0 && (
							<ProfileSection className="flex flex-col gap-2.5">
								<h5>{t('Reactions')}</h5>
								{reactions
									.filter((item) => !!item.waba_payload?.reaction?.emoji)
									.map((reaction) => (
										<div key={reaction.id}>
											<div className="text-[14px]">
												{getSenderName(reaction)}
											</div>
											<div className="mb-1.25 text-[x-small] text-ink/60">
												<Moment
													date={getMessageTimestamp(reaction)}
													calendar={CALENDAR_SHORT}
													unix
												/>
											</div>
											<PrintMessage
												message={reaction.waba_payload?.reaction?.emoji ?? ''}
												smallEmoji
											/>
										</div>
									))}
							</ProfileSection>
						)}

						<ProfileSection className="flex flex-col gap-2.5">
							{message.waba_statuses?.sent && (
								<>
									<div className="flex flex-col">
										<div className="flex items-center">
											<DoneIcon className={statusIconClassName} />
											<h5>{t('Sent at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.sent}
											format={dateFormat}
											unix
										/>
									</div>
								</>
							)}
							{message.waba_statuses?.delivered && (
								<>
									<Separator className="bg-[rgba(0,0,45,0.05)]" />
									<div className="flex flex-col">
										<div className="flex items-center">
											<DoneAll className={statusIconClassName} />
											<h5>{t('Delivered at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.delivered}
											format={dateFormat}
											unix
										/>
									</div>
								</>
							)}
							{message.waba_statuses?.read && (
								<>
									<Separator className="bg-[rgba(0,0,45,0.05)]" />
									<div className="flex flex-col">
										<div className="flex items-center">
											<DoneAll
												className={cn(statusIconClassName, 'fill-light-blue!')}
											/>
											<h5>{t('Read at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.read}
											format={dateFormat}
											unix
										/>
									</div>
								</>
							)}
						</ProfileSection>

						{(message.waba_payload?.errors?.length ?? 0) > 0 && (
							<ProfileSection className="flex flex-col gap-2.5">
								<h5>
									{t(
										hasAnyStatus(message)
											? 'There were some problems sending your message, but your message was sent successfully after problems have resolved.'
											: 'There are some problems sending your message:'
									)}
								</h5>
								<ChatMessageErrors data={message} />
							</ProfileSection>
						)}
					</>
				)}
			</div>
		</SidePanel>
	);
};

export default MessageStatuses;
