import React from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import DoneIcon from '@material-ui/icons/Done';
import Moment from "react-moment";
import {Button} from "@material-ui/core";
import '../styles/InputRange.css';
import '../AvatarStyles';
import {formatMessage, insertTemplateComponentParameters} from "../Helpers";
import NoteIcon from '@material-ui/icons/Note';
import SmsIcon from '@material-ui/icons/Sms';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChatMessageClass from "../ChatMessageClass";
import MessageDateIndicator from "./MessageDateIndicator";
import ContextChatMessage from "./ContextChatMessage";
import ReplyIcon from '@material-ui/icons/Reply';
import ChatMessageVideo from "./ChatMessageVideo";
import ChatMessageImage from "./ChatMessageImage";
import ChatMessageDocument from "./ChatMessageDocument";
import ChatVoice from "./ChatVoice";

const iconStyles = {
    fontSize: '15px'
};

function ChatMessage(props) {

    const data = props.messageData;
    const templateData = data.type === ChatMessageClass.TYPE_TEMPLATE ? props.templates[data.templateName] : undefined;

    const dateFormat = 'H:mm';

    return (
        <div id={'message_' + data.id} className={"chat__message__outer" + (data.isFromUs === true ? " outgoing" : "")}>

            {props.displayDate &&
            <MessageDateIndicator
                timestamp={data.timestamp} />
            }

            {(props.displaySender || props.displayDate) &&
            <span className="chat__name">{data.senderName}</span>
            }

            {data.type === ChatMessageClass.TYPE_STICKER &&
            <img className="chat__media chat__sticker" src={data.generateStickerLink()} alt={data.caption} />
            }

            <div className={"chat__message"
            + (data.hasMediaToPreview() ? " hasMedia" : "")
            + (data.isFromUs === true ? (data.isRead() ? " chat__seen" : "") + " chat__receiver" : "")
            + (!props.displaySender && !props.displayDate ? " hiddenSender" : "")
            + (data.type === ChatMessageClass.TYPE_TEMPLATE ? " chat__templateMsg" : "")}>

                <div className="chat__message__more" onClick={(event => props.onOptionsClick(event, data))}>
                    <ExpandMoreIcon />
                </div>

                {data.isForwarded &&
                <div className="chat__forwarded">
                    <ReplyIcon />
                    <span>Forwarded</span>
                </div>
                }

                {data.contextMessage !== undefined &&
                <ContextChatMessage
                    contextMessage={data.contextMessage}
                    goToMessageId={props.goToMessageId} />
                }

                {data.type === ChatMessageClass.TYPE_IMAGE &&
                <ChatMessageImage data={data} source={data.generateImageLink()} onPreview={() => props.onPreview(data)} />
                }

                {data.type === ChatMessageClass.TYPE_VIDEO &&
                <ChatMessageVideo data={data} source={data.generateVideoLink()} onPreview={() => props.onPreview(data)} />
                }

                {(data.type === ChatMessageClass.TYPE_VOICE || data.type === ChatMessageClass.TYPE_AUDIO) &&
                <ChatVoice data={data} />
                }

                {data.type === ChatMessageClass.TYPE_DOCUMENT &&
                <ChatMessageDocument data={data} />
                }

                {data.type === ChatMessageClass.TYPE_STICKER &&
                <span>
                    <NoteIcon fontSize="small" />
                </span>
                }

                {data.type === ChatMessageClass.TYPE_TEMPLATE &&
                <div className="chat__template">
                    <span className="chat__templateHeader">
                        <SmsIcon />Template message:<br/>
                    </span>

                    <div className="chat__templateContent">
                        {templateData !== undefined
                            ?
                            <div>
                                {Object.values(templateData.components).map((component, index) =>
                                    <div key={index}>
                                        {component.type === "HEADER" &&
                                        <div className="chat__templateContent__header">
                                            {component.format === "IMAGE" &&
                                            <ChatMessageImage data={data} source={data.getHeaderFileLink('image')} onPreview={() => props.onPreview(data)} />
                                            }
                                            {component.format === "VIDEO" &&
                                            <ChatMessageVideo
                                                data={data}
                                                source={data.getHeaderFileLink('video')}
                                                onPreview={() => props.onPreview(data)} />
                                            }
                                            {component.format === "DOCUMENT" &&
                                            <ChatMessageDocument data={data} />
                                            }
                                            {component.format === "TEXT" &&
                                            <div className="bold wordBreak" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                            }
                                        </div>
                                        }

                                        {component.type === "BODY" &&
                                        <div className="wordBreak" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                        }

                                        {component.type === "BUTTONS" &&
                                        <div className="chat__templateContent__buttons">
                                            {component.buttons.map((button, buttonIndex) =>
                                                <Button key={buttonIndex} color="primary" fullWidth={true} disabled={true}>{button.text}</Button>
                                            )}
                                        </div>
                                        }
                                    </div>
                                )}
                            </div>
                            :
                            <div>Missing template</div>
                        }
                    </div>
                </div>
                }

                {(data.text ?? data.caption ?? data.buttonText) ? <span className="wordBreak" dangerouslySetInnerHTML={{__html: formatMessage((data.text ?? data.caption ?? data.buttonText))}} /> : '\u00A0'}

                <span className="chat__message__info">
                    <span className="chat__timestamp">
                        <Moment date={data.timestamp} format={dateFormat} unix />
                    </span>

                    {(data.isFromUs === true && !data.isDeliveredOrRead()) &&
                    <DoneIcon className="chat__iconDone" color="inherit" style={iconStyles} />
                    }

                    {(data.isFromUs === true && data.isDeliveredOrRead()) &&
                    <DoneAll className="chat__iconDoneAll" color="inherit" style={iconStyles} />
                    }
                </span>

                <div style={{clear: "both"}} />
            </div>
        </div>
    )
}

export default ChatMessage