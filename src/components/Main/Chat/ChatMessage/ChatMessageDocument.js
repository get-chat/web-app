import React from 'react';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { useTranslation } from 'react-i18next';

function ChatMessageDocument(props) {
    const { t, i18n } = useTranslation();

    return (
        <a
            href={
                props.data.documentLink ??
                props.data.getHeaderFileLink('document')
            }
            target="_blank"
            className="chat__document"
        >
            <InsertDriveFileIcon fontSize="small" />
            <span className="chat__document__filename">
                {props.data.documentCaption ??
                    props.data.documentFileName ??
                    t('Document')}
            </span>
        </a>
    );
}

export default ChatMessageDocument;
