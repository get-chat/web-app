import React from 'react';
import useReactions from '@src/hooks/useReactions';
import PrintMessage from '@src/components/PrintMessage';
import Moment from 'react-moment';
import { CALENDAR_SHORT } from '@src/Constants';
import { Message } from '@src/types/messages';
import { getSenderName } from '@src/helpers/MessageHelper';
import * as Styled from './ReactionDetails.styles';

export type Props = {
	message: Message | undefined;
	reactionsHistory: Message[];
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
};

const ReactionDetails: React.FC<Props> = ({
	message,
	reactionsHistory,
	anchorElement,
	setAnchorElement,
}) => {
	const { reactions, reactionsWithCount } = useReactions({
		reactionsHistory,
	});

	return (
		<Styled.StyledMenu
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(undefined)}
			elevation={0}
			disableAutoFocusItem={true}
		>
			<Styled.ReactionsContainer>
				{reactions
					?.filter((item) => !!item.waba_payload?.reaction?.emoji)
					.map((reaction) => (
						<Styled.ReactionItem key={reaction.id}>
							<Styled.SenderName>{getSenderName(reaction)}</Styled.SenderName>
							<Styled.Timestamp>
								<Moment
									date={reaction.waba_payload?.timestamp}
									calendar={CALENDAR_SHORT}
									unix
								/>
							</Styled.Timestamp>
							<PrintMessage
								message={reaction.waba_payload?.reaction?.emoji ?? ''}
								smallEmoji
							/>
						</Styled.ReactionItem>
					))}
			</Styled.ReactionsContainer>
		</Styled.StyledMenu>
	);
};

export default ReactionDetails;
