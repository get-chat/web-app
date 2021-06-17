import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../helpers/Helpers";

export const bulkSend = (body, callback) => {
    axios.post( `${BASE_URL}messages/`, body, getConfig())
        .then((response) => {

            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}