import React from "react";
import {LinearProgress} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import '../../../styles/UploadMediaIndicator.css';

function UploadMediaIndicator() {
    return (
        <div className="uploadingMediaIndicatorWrapper">
            <Alert
                className="uploadingMediaIndicator"
                severity="info"
                elevation={0}>
                <div>
                    Uploading a media file. Please wait...
                </div>
                <LinearProgress variant="indeterminate" />
            </Alert>
        </div>
    )
}

export default UploadMediaIndicator;