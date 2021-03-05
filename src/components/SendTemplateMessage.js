import React from "react";
import {Button} from "@material-ui/core";
import '../styles/SendTemplateMessage.css';

function SendTemplateMessage(props) {

    const template = props.data;

    return (
        <div className="sendTemplateMessage">
            <h4 className="sendTemplateMessage__title">{template.name}</h4>

            {template.components.map((comp, index) =>
                <div key={index} className="sendTemplateMessage__component">

                    {comp.type === "HEADER" &&
                    <div className="sendTemplateMessage__component__header sendTemplateMessage__section">
                        <h6>Header</h6>
                        <div>
                            {comp.format}
                        </div>
                    </div>
                    }

                    {comp.type === "BODY" &&
                    <div className="sendTemplateMessage__component__body sendTemplateMessage__section">
                        <h6>Body</h6>
                        <div>
                            {comp.text}
                        </div>
                    </div>
                    }

                    {comp.buttons &&
                    <div className="sendTemplateMessage__component__buttons sendTemplateMessage__section">
                        <h6>Buttons</h6>
                        {comp.buttons.map((button, buttonIndex) =>
                            <Button color="primary">
                                {button.text}<br/>
                                {/*{button.type}*/}
                            </Button>
                        )}
                    </div>
                    }

                </div>
            )}
        </div>
    )
}

export default SendTemplateMessage;