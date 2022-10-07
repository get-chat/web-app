import React, { useEffect, useState } from 'react';
import ChatMessage from '../../../Main/Chat/ChatMessage/ChatMessage';
import { ErrorBoundary } from '@sentry/react';
import ChatMessageClass from '../../../../ChatMessageClass';
import { generateFinalTemplateParams } from '../../../../helpers/TemplateMessageHelper';

const StepPreviewResult = ({ t, templates, template, params, csvData }) => {
	const [messageData, setMessageData] = useState();

	const replaceGetChatParamWithRealData = (string) => {
		return string.replace(/\{{(.*?)\}}/g, function (match) {
			const column = match
				.replace('{{ GET_CHAT_CUSTOM.', '')
				.replace(' }}', '');
			return csvData[0]?.[column];
		});
	};

	const replaceGetChatParams = () => {
		let replacedParams = { ...params };

		for (const compIndex in replacedParams) {
			for (const paramIndex in params[compIndex]) {
				const type = replacedParams[compIndex][paramIndex].type;
				if (typeof replacedParams[compIndex][paramIndex][type] === 'object') {
					// Media object
					replacedParams[compIndex][paramIndex][type].link =
						replaceGetChatParamWithRealData(
							replacedParams[compIndex][paramIndex][type].link
						);
				} else {
					// Text
					replacedParams[compIndex][paramIndex][type] =
						replaceGetChatParamWithRealData(
							replacedParams[compIndex][paramIndex][type]
						);
				}
			}
		}

		return replacedParams;
	};

	useEffect(() => {
		if (!template) return;

		console.log(csvData);

		const replacedParams = replaceGetChatParams();

		const preparedParams = generateFinalTemplateParams(
			template,
			replacedParams
		);

		if (!preparedParams) return;

		const data = { ...template };
		data.components = Object.values(preparedParams);

		setMessageData(ChatMessageClass.fromTemplate(data));
	}, [templates, template, params, csvData]);

	return (
		<div className="stepPreviewResult">
			<h4>{t('Preview')}</h4>
			<div className="stepPreviewResult__wrapper mt-1">
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
