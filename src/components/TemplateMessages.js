import React from "react";
import {Button} from "@material-ui/core";

function TemplateMessages() {

    const templateMessages = {
        a: {
            message: "This is a dummy template message."
        },
        b: {
            message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        c: {
            message: "This is another dummy template message as well."
        },
        d: {
            message: "This is a dummy template message."
        },
        e: {
            message: "This is another dummy template message."
        },
        f: {
            message: "This is another dummy template message as well."
        },
        g: {
            message: "This is another dummy template message.."
        },
        h: {
            message: "This is another dummy template message as well."
        }
    };

    return (
        <div className="templateMessagesOuter">
            <div className="templateMessages">

                { Object.entries(templateMessages).map((message, index) =>
                    <div className="templateMessageWrapper">

                        <div key={message[0]} className="templateMessages__message chat__message chat__receiver">
                            <span className="templateMessage__message">{message[1].message}</span>
                        </div>

                        <Button>Send</Button>

                    </div>
                )}

            </div>
        </div>
    )
}

export default TemplateMessages;