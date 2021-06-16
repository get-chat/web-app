import React, {useState} from "react";
import {Checkbox, ListItem} from "@material-ui/core";
import LabelIcon from "@material-ui/icons/Label";
import '../styles/SelectableChatTag.css';

function SelectableChatTag(props) {
    const [isSelected, setSelected] = useState(false);

    const handleClick = () => {

    }

    return (
        <ListItem className="sidebarTagListItem" button onClick={handleClick}>
            <div className="sidebarTag">
                <Checkbox className="sidebarTag__selection" checked={isSelected} color="primary"/>
                <div className="sidebarTag__selection__tag">
                    <LabelIcon style={{fill: props.data.web_inbox_color}} />
                    {props.data.name}
                </div>
            </div>
        </ListItem>
    )
}

export default SelectableChatTag;