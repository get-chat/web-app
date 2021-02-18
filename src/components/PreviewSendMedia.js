import React from "react";
import '../styles/PreviewSendMedia.css';
import CloseIcon from "@material-ui/icons/Close";

function PreviewSendMedia() {

    const hidePreview = () => {
        console.log('Hide');
    }

    return (
        <div className="previewSendMedia">
            <div className="previewSendMedia__header">
                <CloseIcon onClick={hidePreview}/>
                <span>Preview</span>
            </div>

            <div className="previewSendMedia__preview">
                Media Preview
            </div>

            <div className="previewSendMedia__footer">
                Footer
            </div>
        </div>
    )
}

export default PreviewSendMedia;