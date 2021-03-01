import React, {useRef, useState} from "react";
import {IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import {displaySeconds} from "../Helpers";
import DoneIcon from "@material-ui/icons/Done";
import '../styles/VoiceRecord.css';
import VoiceRecorder from "../VoiceRecorder";
import {EVENT_TOPIC_REQUEST_MIC_PERMISSION} from "../Constants";
import PubSub from "pubsub-js";

function VoiceRecord(props) {

    const voiceRecorder = useRef(new VoiceRecorder());
    const [timer, setTimer] = useState(0);

    useState(() => {
        const onRequestMicPermission = function (msg, data) {
            requestMicrophonePermission();
        }

        const token = PubSub.subscribe(EVENT_TOPIC_REQUEST_MIC_PERMISSION, onRequestMicPermission);

        return () => {
            PubSub.unsubscribe(token);
        }
    }, []);

    const requestMicrophonePermission = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(function (stream) {
                    startVoiceRecord(stream);
                })
                .catch(function (err) {
                    console.log('Permission denied');
                    // TODO: Display information
                });
        } else {
            console.log('Not supported on your browser.');
        }
    }

    const startVoiceRecord = (stream) => {
        // If it is already recording, return
        if (voiceRecorder.current?.isRecording()) return;

        let intervalId;

        // Start recording
        voiceRecorder.current?.start(
            stream,
            function () {
                props.setRecording(true);

                // Update timer every second
                intervalId = setInterval(function () {
                    setTimer(prevState => prevState + 1);
                }, 1000);
            },
            function (audioURL) {
                props.setRecording(false);

                console.log(audioURL);

                // Stop timer
                clearInterval(intervalId);
                setTimer(0);
            }
        );
    }

    const stopVoiceRecord = () => {
        voiceRecorder.current?.stop();
    }

    const sendVoiceRecord = () => {
        stopVoiceRecord();

        setTimeout(function () {
            const audioURL = voiceRecorder.current.lastAudioURL;
            console.log('Send: ' + audioURL);
        }, 1000);
    }

    return (
        <div className="voiceRecord">
            <IconButton onClick={stopVoiceRecord} className="voiceRecord__cancelButton">
                <CloseIcon />
            </IconButton>

            <FiberManualRecordIcon className="voiceRecord__recordIcon" />
            <span className="voiceRecord__timer">{ displaySeconds(timer) }</span>

            <IconButton onClick={sendVoiceRecord} className="voiceRecord__sendButton">
                <DoneIcon />
            </IconButton>
        </div>
    )
}

export default VoiceRecord;