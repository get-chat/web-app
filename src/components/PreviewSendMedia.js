import React, {useEffect, useState} from "react";
import '../styles/PreviewSendMedia.css';
import CloseIcon from "@material-ui/icons/Close";
import {TextField} from "@material-ui/core";

function PreviewSendMedia(props) {

    const [caption, setCaption] = useState("");
    const [chosenFile, setChosenFile] = useState();
    const [preparedFiles, setPreparedFiles] = useState({});

    const hidePreview = () => {
        console.log('Hide');
    }

    useEffect(() => {
        setChosenFile(URL.createObjectURL(props.data[0]));
    }, [props.data]);

    return (
        <div className="previewSendMedia">
            <div className="previewSendMedia__header">
                <CloseIcon onClick={hidePreview}/>
                <span>Preview</span>
            </div>

            <div className="previewSendMedia__preview">
                <img className="previewSendMedia__preview__image" src={chosenFile} />
            </div>

            <div className="previewSendMedia__caption">
                <TextField value={caption} onChange={e => setCaption(e.target.value)} label="Add a caption..." size="medium" fullWidth={true} />
            </div>

            <div className="previewSendMedia__footer">
                {JSON.stringify(props.data)}
            </div>
        </div>
    )
}

export default PreviewSendMedia;