import React from 'react';
import { Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import Moment from 'react-moment';
import DoneIcon from '@mui/icons-material/Done';
import DoneAll from '@mui/icons-material/DoneAll';
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
import * as Styled from './MessageStatuses.styles';

interface Props {
	message?: Message;
}

const dateFormat = 'H:mm, DD.MM.YYYY';

const MessageStatuses: React.FC<Props> = ({ message: initialMessage }) => {
	const { t } = useTranslation();

	const { message, templates, close } = useMessageStatuses({ initialMessage });
	const { reactions } = useReactions({
		reactionsHistory: message?.reactions,
	});

	return (
		<Styled.Container>
			<Styled.Header>
				<IconButton onClick={close} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Message Information')}</h3>
			</Styled.Header>
			<Styled.Body>
				{message && (
					<>
						<Styled.Preview>
							<ChatMessage
								data={message}
								templateData={
									message.waba_payload?.template?.name
										? templates[message.waba_payload.template.name]
										: undefined
								}
							/>
						</Styled.Preview>

						{reactions.length > 0 && (
							<Styled.Section>
								<h5>{t('Reactions')}</h5>
								{reactions
									.filter((item) => !!item.waba_payload?.reaction?.emoji)
									.map((reaction) => (
										<Styled.Reaction key={reaction.id}>
											<div className="sender">{getSenderName(reaction)}</div>
											<div className="timestamp">
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
										</Styled.Reaction>
									))}
							</Styled.Section>
						)}

						<Styled.Section>
							{message.waba_statuses?.sent && (
								<>
									<Styled.SubSection>
										<Styled.SubSectionTitle>
											<DoneIcon color="inherit" />
											<h5>{t('Sent at')}</h5>
										</Styled.SubSectionTitle>
										<Moment
											date={message.waba_statuses.sent}
											format={dateFormat}
											unix
											className={Styled.SubSectionText}
										/>
									</Styled.SubSection>
								</>
							)}
							{message.waba_statuses?.delivered && (
								<>
									<Divider />
									<Styled.SubSection>
										<Styled.SubSectionTitle>
											<DoneAll color="inherit" />
											<h5>{t('Delivered at')}</h5>
										</Styled.SubSectionTitle>
										<Moment
											date={message.waba_statuses.delivered}
											format={dateFormat}
											unix
											className={Styled.SubSectionText}
										/>
									</Styled.SubSection>
								</>
							)}
							{message.waba_statuses?.read && (
								<>
									<Divider />
									<Styled.SubSection>
										<Styled.SubSectionTitle>
											<Styled.BlueIcon color="inherit" />
											<h5>{t('Read at')}</h5>
										</Styled.SubSectionTitle>
										<Moment
											date={message.waba_statuses.read}
											format={dateFormat}
											unix
											className={Styled.SubSectionText}
										/>
									</Styled.SubSection>
								</>
							)}
						</Styled.Section>

						{(message.waba_payload?.errors?.length ?? 0) > 0 && (
							<Styled.Section>
								<h5>
									{t(
										hasAnyStatus(message)
											? 'There were some problems sending your message, but your message was sent successfully after problems have resolved.'
											: 'There are some problems sending your message:'
									)}
								</h5>
								<ChatMessageErrors data={message} />
							</Styled.Section>
						)}
					</>
				)}
			</Styled.Body>
		</Styled.Container>
	);
};

export default MessageStatuses;
