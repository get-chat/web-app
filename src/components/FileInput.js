import React, {useState} from "react";

function FileInput(props) {

    return (
        <input
            ref={props.innerRef}
            type="file"
            onChange={(e) => props.setSelectedFile(prevState => {return {...prevState, ...e.target.files}} )}
            multiple={true}
            onClick={(event)=> {
                event.target.value = null
            }}
            accept={props.accept}
        />
    )
}

export default FileInput;