import React from 'react';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import styles from '@src/components/QuickReactionsMenu/QuickReactionsMenu.module.css';
import { Menu } from '@mui/material';

export type Props = {
	message: ChatMessageModel | null;
	reactions: ChatMessageModel[];
	anchorElement: HTMLElement | null;
	setAnchorElement: (anchorElement: HTMLElement | null) => void;
};

const ReactionDetails: React.FC<Props> = ({
	message,
	reactions,
	anchorElement,
	setAnchorElement,
}) => {
	return (
		<Menu
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(null)}
			elevation={0}
			disableAutoFocusItem={true}
			className={styles.menu}
		>
			<div className={styles.reactions}>
				{reactions?.map((reaction) => (
					<div className={styles.reaction}>
						<div className={styles.sender}>{reaction.senderName}</div>
						<div>{reaction.reaction?.emoji}</div>
					</div>
				))}
			</div>
		</Menu>
	);
};

export default ReactionDetails;
