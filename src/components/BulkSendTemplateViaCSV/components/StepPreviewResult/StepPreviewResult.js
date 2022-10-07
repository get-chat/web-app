import React, { useEffect, useState } from 'react';
import ChatMessage from '../../../Main/Chat/ChatMessage/ChatMessage';
import { ErrorBoundary } from '@sentry/react';
import ChatMessageClass from '../../../../ChatMessageClass';

const StepPreviewResult = ({ templates, template, params }) => {
	const [messageData, setMessageData] = useState();

	useEffect(() => {
		// TODO: Inject params
		setMessageData(ChatMessageClass.fromTemplate(template));
	}, [template, params]);

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
