import ChatMessageClass from "../ChatMessageClass";
import {ATTACHMENT_TYPE_DOCUMENT, ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO} from "../Constants";

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

export const prepareSendFilePayload = (chosenFile, fileURL) => {
    const caption = chosenFile.caption;
    const type = chosenFile.attachmentType;
    const file = chosenFile.file;
    const filename = file.name;
    const mimeType = file.type;

    let requestBody = {
        type: type
    };

    requestBody[type] = {
        link: fileURL,
        mime_type: mimeType,
    }

    // caption param is accepted for only images and videos
    if (type === ATTACHMENT_TYPE_IMAGE || type === ATTACHMENT_TYPE_VIDEO) {
        requestBody[type]['caption'] = caption;
    }

    // filename param is accepted for documents
    if (type === ATTACHMENT_TYPE_DOCUMENT) {
        requestBody[type]['filename'] = filename;
    }

    return requestBody;
}
