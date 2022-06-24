import React from "react";
import {Button} from "@material-ui/core";
import ShareIcon from '@material-ui/icons/Share';

function ChatMessageLocation(props) {
    const mapEmbedURL = `https://www.google.com/maps/embed/v1/place?key=${window.config.APP_GOOGLE_MAPS_API_KEY}&&q=${props.data.location?.latitude},${props.data.location?.longitude}&q=`;
    const mapURL = `https://www.google.com/maps/place/${props.data.location?.latitude},${props.data.location?.longitude}`;

    const share = async () => {
        if (navigator.share) {
            await navigator.share({url: mapURL});
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(mapURL);
            window.displaySuccess('Copied!');
        } else {
            console.log('HTTPS is required for this feature!');
        }
    }

    return (
        <div className="chat__location">
            <iframe
                className="chat__location__iframe"
                width="250"
                height="150"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedURL} />

            {props.data.location &&
            <>
                {props.data.location.name &&
                <div className="chat__message__location__name">
                    {props.data.location.name}
                </div>
                }
                {props.data.location.address &&
                <div className="chat__message__location__address">
                    {props.data.location.address}
                </div>
                }
            </>
            }

            <Button
                className="chat__message__location__share"
                color="primary"
                variant="outlined"
                size="small"
                disableElevation
                startIcon={<ShareIcon/>}
                onClick={share}>
                Share
            </Button>
        </div>
    )
}

export default ChatMessageLocation;
