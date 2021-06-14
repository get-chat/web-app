export const generateTemplateMessagePayload = (templateMessage) => {
    return {
        type: 'template',
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