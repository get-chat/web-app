import React from 'react';
import styles from './ReactionDetails.module.css';
import { Menu } from '@mui/material';
import useReactions from '@src/hooks/useReactions';
import PrintMessage from '@src/components/PrintMessage';
import Moment from 'react-moment';
import { CALENDAR_SHORT } from '@src/Constants';
import { Message } from '@src/types/messages';

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
		<Menu
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(undefined)}
			elevation={0}
			disableAutoFocusItem={true}
			className={styles.menu}
		>
			<div className={styles.reactions}>
				{reactions
					?.filter((item) => !!item.waba_payload.reaction?.emoji)
					.map((reaction) => (
						<div className={styles.reaction} key={reaction.id}>
							<div className={styles.sender}>{reaction.senderName}</div>
							<div className={styles.timestamp}>
								<Moment
									date={reaction.waba_payload.timestamp}
									calendar={CALENDAR_SHORT}
									unix
								/>
							</div>
							<PrintMessage
								message={reaction.waba_payload.reaction?.emoji ?? ''}
								smallEmoji
							/>
						</div>
					))}
			</div>
		</Menu>
	);
};

export default ReactionDetails;
