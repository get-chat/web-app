import ChatMessageClass from "../ChatMessageClass";

export const generateTemplateMessagePayload = (templateMessage) => {
    return {
        type: ChatMessageClass.TYPE_TEMPLATE,
        template: {
            namespace: templateMessage.namespace,
            name: templateMessage.name,
            language: {
                code: templateMessage.language,
                policy: 'deterministic'
            },
            components: templateMessage.params
        }
    }
}