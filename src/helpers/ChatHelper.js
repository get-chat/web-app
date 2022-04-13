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
    const { caption, attachmentType, file } = chosenFile;
    const filename = file.name;
    const mimeType = file.type;

    let requestBody = {
        type: attachmentType
    };

    requestBody[attachmentType] = {
        link: fileURL,
        mime_type: mimeType,
    }

    // caption param is accepted for only images and videos
    if (attachmentType === ATTACHMENT_TYPE_IMAGE || attachmentType === ATTACHMENT_TYPE_VIDEO) {
        requestBody[attachmentType]['caption'] = caption;
    }

    // filename param is accepted for documents
    if (attachmentType === ATTACHMENT_TYPE_DOCUMENT) {
        requestBody[attachmentType]['filename'] = filename;
    }

    return requestBody;
}
