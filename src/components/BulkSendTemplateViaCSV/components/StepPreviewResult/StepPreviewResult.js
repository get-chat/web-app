import React, { useEffect, useState } from 'react';
import ChatMessage from '../../../Main/Chat/ChatMessage/ChatMessage';
import { ErrorBoundary } from '@sentry/react';
import ChatMessageClass from '../../../../ChatMessageClass';

const StepPreviewResult = ({ templates, templateWithParams }) => {
	const [messageData, setMessageData] = useState();

	useEffect(() => {
		const data = { ...templateWithParams };
		data.components = data.params;
		setMessageData(ChatMessageClass.fromTemplate(data));
	}, [templateWithParams]);

	return (
		<div className="stepPreviewResult">
			<div className="stepPreviewResult__wrapper">
				{messageData && (
					<ErrorBoundary>
						<ChatMessage messageData={messageData} templates={templates} />
					</ErrorBoundary>
				)}
			</div>
		</div>
	);
};

export default StepPreviewResult;
