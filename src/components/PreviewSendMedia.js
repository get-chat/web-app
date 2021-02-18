import React, {useState} from "react";
import '../styles/PreviewSendMedia.css';
import CloseIcon from "@material-ui/icons/Close";
import {TextField} from "@material-ui/core";

function PreviewSendMedia() {

    const [caption, setCaption] = useState("");

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

            <div className="previewSendMedia__caption">
                <TextField value={caption} onChange={e => setCaption(e.target.value)} label="Caption" size="medium" fullWidth={true} />
            </div>

            <div className="previewSendMedia__footer">
                Footer
            </div>
        </div>
    )
}

export default PreviewSendMedia;