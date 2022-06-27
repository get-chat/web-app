import { makeStyles } from '@material-ui/styles';

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i) {
    const c = (i & 0x00ffffff).toString(16).toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
}

const prepareStylesObject = () => {
    let obj = {};
    for (let i = 65; i <= 90; i++) {
        const curLetter = String.fromCharCode(i);
        obj[curLetter] = {
            color: '#fff',
            backgroundColor: '#' + intToRGB(hashCode(curLetter.repeat(6))),
        };
    }
    obj['orange'] = { color: '#fff', backgroundColor: '#ff9a10' };

    return obj;
};

const colorsObject = {
    A: { color: '#fff', backgroundColor: '#ff4b29' },
    B: { color: '#fff', backgroundColor: '#ff00f2' },
    C: { color: '#fff', backgroundColor: '#245120' },
    D: { color: '#fff', backgroundColor: '#ff8c12' },
    E: { color: '#fff', backgroundColor: '#b900ff' },
    F: { color: '#fff', backgroundColor: '#6E8A40' },
    G: { color: '#fff', backgroundColor: '#31d5f2' },
    H: { color: '#fff', backgroundColor: '#f55600' },
    I: { color: '#fff', backgroundColor: '#e7ff2d' },
    J: { color: '#fff', backgroundColor: '#7C2BC0' },
    K: { color: '#fff', backgroundColor: '#ff8000' },
    L: { color: '#fff', backgroundColor: '#02fc23' },
    M: { color: '#fff', backgroundColor: '#22ffdc' },
    N: { color: '#fff', backgroundColor: '#8eff11' },
    O: { color: '#fff', backgroundColor: '#13f7ff' },
    P: { color: '#fff', backgroundColor: '#29ff0f' },
    Q: { color: '#fff', backgroundColor: '#ee2a81' },
    R: { color: '#fff', backgroundColor: '#00b9ff' },
    S: { color: '#fff', backgroundColor: '#5AD720' },
    T: { color: '#fff', backgroundColor: '#0d60ff' },
    U: { color: '#fff', backgroundColor: '#E1A7E0' },
    V: { color: '#fff', backgroundColor: '#A51040' },
    W: { color: '#fff', backgroundColor: '#2d67ff' },
    X: { color: '#fff', backgroundColor: '#2BE100' },
    Y: { color: '#fff', backgroundColor: '#ce6bff' },
    Z: { color: '#fff', backgroundColor: '#4be4ff' },
    0: { color: '#fff', backgroundColor: '#6359ff' },
    1: { color: '#fff', backgroundColor: '#0d6d6a' },
    2: { color: '#fff', backgroundColor: '#8c409b' },
    3: { color: '#fff', backgroundColor: '#b6c136' },
    4: { color: '#fff', backgroundColor: '#8f3554' },
    5: { color: '#fff', backgroundColor: '#367aa4' },
    6: { color: '#fff', backgroundColor: '#6b9b4d' },
    7: { color: '#fff', backgroundColor: '#db8254' },
    8: { color: '#fff', backgroundColor: '#ff5c5c' },
    9: { color: '#fff', backgroundColor: '#857708' },
    orange: { color: '#fff', backgroundColor: '#ff9a10' },
};

// In case generating colors is needed again, this can be enabled
//const avatarStyles = makeStyles((theme) => (prepareStylesObject()));

const avatarStyles = makeStyles((theme) => colorsObject);

export { avatarStyles, colorsObject };
