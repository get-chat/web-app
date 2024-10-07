import React from 'react';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import styles from '@src/components/QuickReactionsMenu/QuickReactionsMenu.module.css';
import { Menu } from '@mui/material';

export type Props = {
	message: ChatMessageModel | null;
	anchorElement: HTMLElement | null;
	setAnchorElement: (anchorElement: HTMLElement | null) => void;
};

const ReactionDetails: React.FC<Props> = ({
	message,
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
			<div>
				{message?.reactions?.map((reaction) => (
					<div>
						<div>{reaction.senderName}</div>
						<div>{reaction.reaction?.emoji}</div>
					</div>
				))}
			</div>
		</Menu>
	);
};

export default ReactionDetails;
