import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Fade, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

function Main() {

    const [checked, setChecked] = React.useState(false);
    const [isImagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePreviewURL, setImagePreviewURL] = useState();

    const previewImage = (imagePreviewURL) => {
        setImagePreviewURL(imagePreviewURL);
        setImagePreviewVisible(imagePreviewURL !== null && imagePreviewURL !== undefined);
    }

    useEffect(() => {
        setChecked(true);
    }, []);

    return(
        <Fade in={checked}>
            <div className="app__body">
                <Sidebar />
                <Chat previewImage={(URL) => previewImage(URL)} />

                {isImagePreviewVisible === true &&
                <div className="app__imagePreview">
                    <div className="app__imagePreview__header">
                        <IconButton className="app__imagePreview__close" onClick={() => previewImage(null)}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                    <div className="app__imagePreview__container" onClick={() => previewImage(null)}>
                        <img className="app__imagePreview__image" src={imagePreviewURL} alt="Preview" />
                    </div>
                </div>
                }
            </div>
        </Fade>
    )
}

export default Main;