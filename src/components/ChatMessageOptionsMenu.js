import React, {useState} from 'react';
import {Menu, MenuItem} from "@material-ui/core";

function ChatMessageOptionsMenu() {

    const [anchorEl, setAnchorEl] = useState(null);

    const displayMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const hideMenu = () => {
        setAnchorEl(null);
    };

    return (
        <Menu
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={hideMenu}
            elevation={3}>
            <MenuItem>Logout</MenuItem>
        </Menu>
    )
}

export default ChatMessageOptionsMenu;