import ChosenFileClass from "./ChosenFileClass";
import {
    ATTACHMENT_TYPE_AUDIO,
    ATTACHMENT_TYPE_DOCUMENT,
    ATTACHMENT_TYPE_IMAGE,
    ATTACHMENT_TYPE_VIDEO
} from "./Constants";
import {stringContainsAnyInArray} from "./Helpers";
import * as musicMetadata from "music-metadata-browser";

export const prepareSelectedFiles = (selectedFiles) => {
    const preparedFiles = {};
    Object.entries(selectedFiles).forEach((file) => {
        preparedFiles[file[0]] = new ChosenFileClass(file[0], file[1], true);
    });

    return preparedFiles;
}

export const getDroppedFiles = (event) => {
    event.preventDefault();

    /*let i;
    if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (i = 0; i < event.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (event.dataTransfer.items[i].kind === 'file') {
                const file = event.dataTransfer.items[i].getAsFile();
                console.log('... file[' + i + '].name = ' + file.name);
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (i = 0; i < event.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + event.dataTransfer.files[i].name);
        }
    }*/

    return {...event.dataTransfer.files};
}

export const getAttachmentTypeByFile = (file, callback) => {
    const mimeType = file.type;
    if (mimeType.includes('image')) {
        const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (stringContainsAnyInArray(mimeType, supportedImageTypes)) {
            return ATTACHMENT_TYPE_IMAGE;
        }
    } else if (mimeType.includes('video')) {
        const supportedVideoTypes = ['video/mp4', 'video/3gpp'];
        if (stringContainsAnyInArray(mimeType, supportedVideoTypes)) {
            return ATTACHMENT_TYPE_VIDEO;
        }
    } else if (mimeType.includes('audio')) {
        // OGG is an exception
        if (mimeType.includes('audio/ogg')) {

            // This will be skipped for voice recording, we know what is type
            if (callback !== undefined) {

                // Get codec information async
                musicMetadata.parseBlob(file).then(metadata => {
                    const codec = metadata?.format?.codec;
                    // OGG files with Opus codec are supported
                    if (codec && codec.toLowerCase().includes('opus')) {
                        callback(ATTACHMENT_TYPE_AUDIO);
                    } else {
                        // Base OGG files are not supported
                        callback(ATTACHMENT_TYPE_DOCUMENT);
                    }
                })
            }

            return ATTACHMENT_TYPE_DOCUMENT;

        } else {
            // If not OGG
            const supportedAudioTypes = ['audio/aac', 'audio/mp4', 'audio/amr', 'audio/mpeg'];
            if (stringContainsAnyInArray(mimeType, supportedAudioTypes)) {
                return ATTACHMENT_TYPE_AUDIO;
            }
        }
    }

    return ATTACHMENT_TYPE_DOCUMENT;
}

export const convertToBase64 = (file, callback) => {
    const fileReader = new FileReader();
    let base64;

    fileReader.onload = function(fileLoadedEvent) {
        base64 = fileLoadedEvent.target.result;

        callback(base64);
    };

    fileReader.readAsDataURL(file);
}

export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}

export const handleDragOver = (event) => {
    event.preventDefault();
}

const getVideoCover = (file, seekTo = 0.0) => {
    console.log("getting video cover for file: ", file);
    return new Promise((resolve, reject) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // seek to user defined timestamp (in seconds) if possible
            if (videoPlayer.duration < seekTo) {
                reject("video is too short.");
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
                videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                console.log('video is now paused at %ss.', seekTo);
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                // return the canvas image as a blob
                ctx.canvas.toBlob(
                    blob => {
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.75 /* quality */
                );
            });
        });
    });
}