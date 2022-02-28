import React from "react";
import ChatMessageClass from "../../../../ChatMessageClass";
import {useTranslation} from "react-i18next";

function ChatMessageTypeLabel(props) {

    const { t, i18n } = useTranslation();

    return (
        <span className="chatMessageTypeLabel">
            {props.type === ChatMessageClass.TYPE_IMAGE &&
            <span>{t('Image')}</span>
            }

            {props.type === ChatMessageClass.TYPE_VIDEO &&
            <span>{t('Video')}</span>
            }

            {props.type === ChatMessageClass.TYPE_VOICE &&
            <span>{t('Voice')}</span>
            }

            {props.type === ChatMessageClass.TYPE_AUDIO &&
            <span>{t('Audio')}</span>
            }

            {props.type === ChatMessageClass.TYPE_DOCUMENT &&
            <span>{t('Document')}</span>
            }

            {props.type === ChatMessageClass.TYPE_STICKER &&
            <span>{t('Sticker')}</span>
            }

            {props.type === ChatMessageClass.TYPE_TEMPLATE &&
            <span>{t('Template')}</span>
            }
        </span>
    )
}

export default ChatMessageTypeLabel;