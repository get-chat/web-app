export const findPendingMessageById = (pendingMessages, id) => {
    for (let i = 0; i < pendingMessages.length; i++) {
        const currentPendingMessage = pendingMessages[i];
        if (currentPendingMessage.id === id) return currentPendingMessage;
    }
}