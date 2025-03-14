import PendingMessage from '@src/interfaces/PendingMessage';

export const findPendingMessageIndex = (
	pendingMessages: PendingMessage[],
	id: string
) => {
	for (let i = 0; i < pendingMessages.length; i++) {
		const currentPendingMessage = pendingMessages[i];
		if (currentPendingMessage.id === id) return i;
	}
};

export const findPendingMessage = (
	pendingMessages: PendingMessage[],
	id: string
) => {
	const index = findPendingMessageIndex(pendingMessages, id);
	return index ? pendingMessages[index] : undefined;
};

export const setPendingMessageFailed = (
	pendingMessages: PendingMessage[],
	id: string
) => {
	pendingMessages = [...pendingMessages];
	const pendingMessageIndex = findPendingMessageIndex(pendingMessages, id);
	if (pendingMessageIndex && pendingMessages[pendingMessageIndex]) {
		pendingMessages[pendingMessageIndex].isFailed = true;
		pendingMessages[pendingMessageIndex].willRetry = false;
	}
	return pendingMessages;
};

export const setAllFailedPendingMessagesWillRetry = (
	pendingMessages: PendingMessage[]
) => {
	pendingMessages = [...pendingMessages];
	for (let i = 0; i < pendingMessages.length; i++) {
		if (pendingMessages[i].isFailed) {
			pendingMessages[i].willRetry = true;
		}
	}

	return pendingMessages;
};

export const hasFailedPendingMessages = (pendingMessages: PendingMessage[]) => {
	for (let i = 0; i < pendingMessages.length; i++) {
		// Consider willRetry additionally
		if (pendingMessages[i].isFailed) return true;
	}

	return false;
};

export const getFirstPendingMessageToSend = (
	pendingMessages: PendingMessage[]
) => {
	for (let i = 0; i < pendingMessages.length; i++) {
		const curPendingMessage = pendingMessages[i];
		if (!curPendingMessage.isFailed || curPendingMessage.willRetry) {
			return curPendingMessage;
		}
	}
};

export const getFirstFailedPendingMessage = (
	pendingMessages: PendingMessage[]
) => {
	for (let i = 0; i < pendingMessages.length; i++) {
		const curPendingMessage = pendingMessages[i];
		if (curPendingMessage.isFailed) {
			return curPendingMessage;
		}
	}
};

export const extractFailedWaIds = (pendingMessages: PendingMessage[]) => {
	const result: string[] = [];
	for (let i = 0; i < pendingMessages.length; i++) {
		const currentPendingMessage = pendingMessages[i];
		const waId = currentPendingMessage.requestBody?.wa_id;
		if (currentPendingMessage.isFailed && !result.includes(waId)) {
			result.push(waId);
		}
	}

	return result;
};
