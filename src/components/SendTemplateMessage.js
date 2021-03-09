import React, {useEffect, useRef, useState} from "react";
import {Button, TextField} from "@material-ui/core";
import '../styles/SendTemplateMessage.css';
import {getConfig, getTemplateParams, templateParamToInteger} from "../Helpers";
import FileInput from "./FileInput";
import axios from "axios";
import {BASE_URL} from "../Constants";

function SendTemplateMessage(props) {

    const template = props.data;

    const [params, setParams] = useState({});
    const [headerImageURL, setHeaderImageURL] = useState('');
    const [isUploading, setUploading] = useState(false);

    const headerImageFileInput = useRef();

    useEffect(() => {
        const preparedParams = {};
        const components = {...template.components};

        Object.entries(components).forEach((paramEntry, paramIndex) => {
            const key = paramEntry[0];
            const component = paramEntry[1];
            const componentType = component.type;

            if (componentType === "HEADER") {
                if (component.format === "IMAGE") {
                    preparedParams[key] = {
                        0: {
                            type: "image",
                            image: {
                                link: ""
                            }
                        }
                    };
                }
            } else if (componentType === "BODY") {
                const paramText = component.text;
                const templateParamsArray = getTemplateParams(paramText);

                templateParamsArray.map((extractedParam, extractedParamIndex) => {
                    if (preparedParams[key] === undefined) {
                        preparedParams[key] = {};
                    }
                    preparedParams[key][templateParamToInteger(extractedParam)] = {
                        type: "text",
                        text: ""
                    };
                });
            }
        });

        setParams(preparedParams);

    }, []);

    useEffect(() => {
        // Update params when header image changes
        setParams(prevState => {
            // TODO: Do this in a better way depends on template headers complexity
            prevState[0][0]['image']['link'] = headerImageURL;

            return prevState;
        });
    }, [headerImageURL, params]);

    const updateParam = (event, index, paramKey) => {
        setParams(prevState => {
            const nextState = prevState;
            nextState[index][paramKey].text = event.target.value;

            return {...nextState};
        })
    }

    const send = () => {
        const preparedParams = {};
        const components = {...template.components};

        Object.entries(components).forEach((paramEntry, paramIndex) => {
            const key = paramEntry[0];
            const component = paramEntry[1];

            if (params[key]) {
                const paramsArray = Object.values(params[key]);

                /*const localizableParams = [];
                paramsArray.forEach((paramArrayItem) => {
                    localizableParams.push({
                        "default": paramArrayItem.text
                    })
                });*/

                preparedParams[component.type] = {
                    type: component.type.toLowerCase(),
                    parameters: paramsArray,
                    //localizable_params: localizableParams
                };
            }
        });

        const finalData = template;
        finalData.params = Object.values(preparedParams);

        // TODO: Change this later
        props.send(finalData);

        /*Object.entries(params).forEach((paramEntry) => {
            finalData.components[paramEntry[0]].params = paramEntry[1];
        });*/
    }

    const handleChosenImage = (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file_encoded", file[0]);

        setUploading(true);

        axios.post(`${BASE_URL}media/`, formData, getConfig())
            .then((response) => {
                console.log(response.data);

                const fileURL = response.data.file;
                setHeaderImageURL(fileURL);

                setUploading(false);

            })
            .catch((error) => {
                // TODO: Handle errors

                setUploading(false);
            });
    }

    return (
        <div className="sendTemplateMessage">
            <h4 className="sendTemplateMessage__title">{template.name}</h4>

            {template.components.map((comp, index) =>
                <div key={index} className="sendTemplateMessage__component">

                    {comp.type === "HEADER" &&
                    <div className="sendTemplateMessage__component__header sendTemplateMessage__section">
                        <h6>Header</h6>
                        <div>
                            {comp.format === "IMAGE"
                                ?
                                <div>
                                    <div>
                                        {headerImageURL &&
                                        <img src={headerImageURL} className="sendTemplateMessage__component__header__preview" alt="Header image preview" />
                                        }
                                    </div>
                                    <FileInput innerRef={headerImageFileInput} multiple={false} accept="image/jpeg, image/png" handleSelectedFiles={handleChosenImage} />
                                    <Button color="primary" onClick={() => headerImageFileInput.current.click()} disabled={isUploading}>Upload an header image</Button>
                                    {headerImageURL &&
                                    <Button color="secondary" onClick={() => setHeaderImageURL('')}>Delete</Button>
                                    }
                                </div>
                                :
                                <span>{comp.format}</span>
                            }
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
                                    <TextField
                                        value={params[index] ? params[index][templateParamToInteger(param)].text : ''}
                                        onChange={(event) => updateParam(event, index, templateParamToInteger(param))}
                                        className="templateMessage__param"
                                        key={paramIndex}
                                        label={templateParamToInteger(param)}
                                        fullWidth={true} />
                                )}
                            </div>
                        </div>
                    </div>
                    }

                    {comp.type === "BUTTONS" &&
                    <div className="sendTemplateMessage__component__buttons sendTemplateMessage__section">
                        <h6>Buttons</h6>
                        {comp.buttons.map((button, buttonIndex) =>
                            <Button key={buttonIndex} color="primary" disabled={true}>
                                {button.text}
                                {/*<br/>{button.type}*/}
                            </Button>
                        )}
                    </div>
                    }

                </div>
            )}

            <Button innerRef={props.sendButtonInnerRef} onClick={send}>Send</Button>
        </div>
    )
}

export default SendTemplateMessage;