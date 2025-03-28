import React from 'react';
import PrintMessage from '@src/components/PrintMessage';
import { Menu } from '@mui/material';
import styles from './QuickReactionsMenu.module.css';
import AddIcon from '@mui/icons-material/Add';
import { Message } from '@src/types/messages';

interface Props {
	message: Message | undefined;
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	setEmojiPickerAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const QuickReactionsMenu: React.FC<Props> = ({
	message,
	anchorElement,
	setAnchorElement,
	setEmojiPickerAnchorElement,
	onReaction,
}) => {
	const hide = () => {
		setAnchorElement(undefined);
	};

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
				{EMOJIS.map((emoji) => (
					<div
						key={emoji}
						onClick={() => {
							if (message?.waba_payload?.id) {
								onReaction(message.waba_payload.id, emoji);
							}
							hide();
						}}
					>
						<PrintMessage message={emoji} smallEmoji />
					</div>
				))}
				<div
					onClick={() => {
						setEmojiPickerAnchorElement(anchorElement);
						hide();
					}}
				>
					<AddIcon />
				</div>
			</div>
		</Menu>
	);
};

export default QuickReactionsMenu;
