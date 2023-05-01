import React from 'react';
// @ts-ignore
import DOMPurify from 'dompurify';
import { PrintMessageComponentProps } from '@src/components/PrintMessage/components/PrintMessageComponentProps';

const HighlightText: React.FC<PrintMessageComponentProps> = ({
	data: { text },
}) => {
	return (
		<span
			dangerouslySetInnerHTML={{
				__html: DOMPurify.sanitize(text, { USE_PROFILES: { html: true } }),
			}}
		/>
	);
};

export default HighlightText;
