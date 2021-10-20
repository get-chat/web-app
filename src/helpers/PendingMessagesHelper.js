const getPendingMessages = () => {
    return window.pendingMessages;
}

export const findPendingMessageIndex = (id) => {
    const pendingMessages = getPendingMessages();
    for (let i = 0; i < pendingMessages.length; i++) {
        const currentPendingMessage = pendingMessages[i];
        if (currentPendingMessage.id === id) return i;
    }
}

export const findPendingMessage = (id) => {
    return getPendingMessages()[findPendingMessageIndex(id)];
}

export const setPendingMessageFailed = (id) => {
    const pendingMessages = getPendingMessages();
    const pendingMessageIndex = findPendingMessageIndex(id);
    pendingMessages[pendingMessageIndex].isFailed = true;
    pendingMessages[pendingMessageIndex].willRetry = false;

    return pendingMessages;
}

export const setAllFailedPendingMessagesWillRetry = () => {
    const pendingMessages = getPendingMessages();
    for (let i = 0; i < pendingMessages.length; i++) {
        if (pendingMessages[i].isFailed) {
            pendingMessages[i].willRetry = true;
        }
    }

    return pendingMessages;
}

export const hasFailedPendingMessages = (pendingMessages) => {
    for (let i = 0; i < pendingMessages.length; i++) {
        // Consider willRetry additionally
        if (pendingMessages[i].isFailed) return true;
    }

    return false;
}