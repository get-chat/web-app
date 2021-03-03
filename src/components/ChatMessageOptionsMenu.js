import React from 'react';
import {Menu, MenuItem} from "@material-ui/core";

function ChatMessageOptionsMenu(props) {

    const hideMenu = () => {
        props.setMenuAnchorEl(null);
    };

    return (
        <Menu
            anchorEl={props.menuAnchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            open={Boolean(props.menuAnchorEl)}
            onClose={hideMenu}
            elevation={3}
            disableAutoFocusItem={true}>

            <MenuItem>Delete</MenuItem>

            {(props.optionsChatMessage && props.optionsChatMessage.isFromUs) &&
            <MenuItem>Another option for outgoing messages</MenuItem>
            }

        </Menu>
    )
}

export default ChatMessageOptionsMenu;