import {makeStyles} from "@material-ui/core/styles";

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i) {
    const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

const prepareStylesObject = () => {
    let obj = {};
    for (let i = 65; i <= 90; i++) {
        const curLetter = String.fromCharCode(i);
        obj[curLetter] = {
            color: '#fff',
            backgroundColor: '#' + intToRGB(hashCode(curLetter.repeat(6)))
        };
    }

    return obj;
}

const avatarStyles = makeStyles((theme) => (prepareStylesObject()));

export {avatarStyles}