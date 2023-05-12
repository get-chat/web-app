import { useState } from 'react';
import ChatMessageList from '@src/interfaces/ChatMessageList';

interface Props {
	MESSAGES_PER_PAGE: Number;
}

const useChat = ({ MESSAGES_PER_PAGE }: Props) => {
	const [messages, setMessages] = useState<ChatMessageList>({});

	const isTimestampsSame = (): boolean => {
		const messagesArray = Object.values(messages);
		let previousTimestamp = -1;
		let isSame = true;
		for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
			const message = messagesArray[i];
			if (!message) {
				isSame = false;
				break;
			}

			if (i === 0) {
				previousTimestamp = message.timestamp;
			} else {
				if (message.timestamp !== previousTimestamp) {
					isSame = false;
					break;
				}

				previousTimestamp = message.timestamp;
			}
		}

		return isSame;
	};

	return {
		messages,
		setMessages,
		isTimestampsSame,
	};
};

export default useChat;
