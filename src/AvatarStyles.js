import {makeStyles} from "@material-ui/core/styles";
import {green, orange} from "@material-ui/core/colors";

const avatarStyles = makeStyles((theme) => ({
    green: {
        color: '#fff',
        backgroundColor: green[500],
    },
    orange: {
        color: '#fff',
        backgroundColor: orange[500],
    }
}));

export {avatarStyles}