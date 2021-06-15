import React, {useState} from "react";
import {Checkbox} from "@material-ui/core";
import LabelIcon from "@material-ui/icons/Label";

function SelectableChatTag(props) {
    const [isSelected, setSelected] = useState(false);

    return (
        <div className="sidebarTag">
            <Checkbox className="sidebarTag__selection" checked={isSelected} color="primary"/>
            <div className="sidebarTag__selection__tag">
                <LabelIcon style={{fill: props.data.web_inbox_color}} />
                {props.data.name}
            </div>
        </div>
    )
}

export default SelectableChatTag;