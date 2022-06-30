import React from 'react';
import '../styles/FileInput.css';

function FileInput(props) {
	return (
		<input
			className="fileInput"
			ref={props.innerRef}
			type="file"
			onChange={(e) => props.handleSelectedFiles(e.target.files)}
			multiple={props.multiple !== undefined ? props.multiple : true}
			onClick={(event) => {
				event.target.value = null;
			}}
			accept={props.accept}
		/>
	);
}

export default FileInput;
