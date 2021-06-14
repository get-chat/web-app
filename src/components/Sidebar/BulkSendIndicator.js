import React, {useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";

function BulkSendIndicator(props) {

    const [progress, setProgress] = useState(30);

    return (
        <div className="bulkSendIndicator">
            <div className="mb-2">Sending</div>

            <LinearProgress variant="determinate" value={progress} />
        </div>
    )
}

export default BulkSendIndicator;