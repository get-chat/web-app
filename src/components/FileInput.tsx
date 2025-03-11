import React, { MutableRefObject, Ref } from 'react';
import '../styles/FileInput.css';

interface Props {
	innerRef: Ref<HTMLInputElement | undefined>;
	handleSelectedFiles: (files: FileList) => void;
	multiple?: boolean | undefined;
	accept?: string | undefined;
}

const FileInput: React.FC<Props> = ({
	innerRef,
	handleSelectedFiles,
	multiple,
	accept,
}) => {
	return (
		<input
			className="fileInput"
			// @ts-ignore
			ref={innerRef}
			type="file"
			onChange={(e) =>
				e.target.files ? handleSelectedFiles(e.target.files) : undefined
			}
			multiple={multiple !== undefined ? multiple : true}
			onClick={(event) => {
				// @ts-ignore
				event.target.value = null;
			}}
			accept={accept}
		/>
	);
};

export default FileInput;
