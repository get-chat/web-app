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

export const setPendingMessageWillRetry = (id) => {
    const pendingMessages = getPendingMessages();
    const pendingMessageIndex = findPendingMessageIndex(id);
    pendingMessages[pendingMessageIndex].willRetry = true;

    return pendingMessages;
}

export const setFirstPendingMessageWillRetry = () => {
    const pendingMessages = getPendingMessages();
    pendingMessages[0].willRetry = true;
    pendingMessages[0].willRetry = true;

    return pendingMessages;
}

export const setAllPendingMessagesWillRetry = () => {
    const pendingMessages = getPendingMessages();
    for (let i = 0; i < pendingMessages.length; i++) {
        if (pendingMessages[i].isFailed) {
            pendingMessages[i].willRetry = true;
        }
    }

    return pendingMessages;
}