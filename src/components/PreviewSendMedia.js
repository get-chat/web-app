import React, {useEffect, useState} from "react";
import '../styles/PreviewSendMedia.css';
import CloseIcon from "@material-ui/icons/Close";
import {IconButton, TextField} from "@material-ui/core";
import ChosenFile from "../ChosenFile";
import {getObjLength} from "../Helpers";
import {Send} from "@material-ui/icons";

function PreviewSendMedia(props) {

    const [caption, setCaption] = useState("");
    const [chosenFile, setChosenFile] = useState();
    const [preparedFiles, setPreparedFiles] = useState({});

    const hidePreview = () => {
        console.log('Hide');
    }

    useEffect(() => {
        const prepared = {};
        Object.entries(props.data).map((file, index) => {
            prepared[file[0]] = new ChosenFile(file[1]);
        });

        setPreparedFiles(prepared);

        // Preview first one
        if (getObjLength(prepared) > 0) {
            setChosenFile(prepared[0]);
        }

    }, [props.data]);

    return (
        <div className="previewSendMedia">
            <div className="previewSendMedia__header">
                <CloseIcon onClick={hidePreview}/>
                <span>Preview</span>
            </div>

            <div className="previewSendMedia__preview">
                {chosenFile &&
                <div className="previewSendMedia__preview__imageWrapper" style={{backgroundImage: "url(" + chosenFile.fileURL + ")"}}>
                    {/*<img className="previewSendMedia__preview__image" src={chosenFile.fileURL} />*/}
                </div>
                }
            </div>

            <div className="previewSendMedia__caption">
                <TextField value={caption} onChange={e => setCaption(e.target.value)} label="Add a caption..." size="medium" fullWidth={true} />
            </div>

            <div className="previewSendMedia__footer">

                <div className="previewSendMedia__footer__inner">
                    { Object.entries(preparedFiles).map((file, index) => {
                        return (
                            <span key={file[0]} className="previewSendMedia__footer__thumbnail">
                            <img className="previewSendMedia__footer__thumbnail__image" src={file[1].fileURL} />
                        </span>
                        )
                    }) }
                </div>

                <div className="previewSendMedia__footer__sendWrapper">
                    <IconButton className="previewSendMedia__footer__send">
                        <Send />
                    </IconButton>
                </div>

            </div>
        </div>
    )
}

export default PreviewSendMedia;