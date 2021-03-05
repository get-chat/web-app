import React, {useEffect, useState} from "react";
import {Button, TextField} from "@material-ui/core";
import '../styles/SendTemplateMessage.css';
import {getTemplateParams, templateParamToInteger} from "../Helpers";

function SendTemplateMessage(props) {

    const template = props.data;

    const [params, setParams] = useState({});

    useEffect(() => {
        const prepared = {};
        const components = {...template.components};

        // TODO: Complete
        Object.entries(components).forEach((param, paramIndex) => {

        });
    }, []);

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
                            <div>
                                {getTemplateParams(comp.text).map((param, paramIndex) =>
                                <TextField className="templateMessage__param" key={paramIndex} label={templateParamToInteger(param)} fullWidth={true} />
                                )}
                            </div>
                        </div>
                    </div>
                    }

                    {comp.type === "BUTTONS" &&
                    <div className="sendTemplateMessage__component__buttons sendTemplateMessage__section">
                        <h6>Buttons</h6>
                        {comp.buttons.map((button, buttonIndex) =>
                            <Button key={buttonIndex} color="primary">
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