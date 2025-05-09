import React from 'react';
import PrintMessage from '@src/components/PrintMessage';
import AddIcon from '@mui/icons-material/Add';
import { Message } from '@src/types/messages';
import * as Styled from './QuickReactionsMenu.styles';

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
			</Styled.ReactionsContainer>
		</Styled.StyledMenu>
	);
};

export default QuickReactionsMenu;
