import React, { useEffect, useState } from 'react';
import ChatMessage from '../../../Main/Chat/ChatMessage/ChatMessage';
import { ErrorBoundary } from '@sentry/react';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import { generateFinalTemplateParams } from '../../../../helpers/TemplateMessageHelper';
import style from './StepPreviewResult.module.css';
import { useSelector } from 'react-redux';

const StepPreviewResult = ({ template, params, csvData }) => {
	const [messageData, setMessageData] = useState();

	const templates = useSelector((state) => state.templates.value);

	const replaceGetChatParamWithRealData = (string) => {
		return string.replace(/\{{(.*?)\}}/g, function (match) {
			const column = match
				.replace('{{ GET_CHAT_CUSTOM.', '')
				.replace(' }}', '');
			return csvData[0]?.[column];
		});
	};

	const replaceGetChatParams = () => {
		// Create a copy without reference
		let replacedParams = { ...JSON.parse(JSON.stringify(params)) };

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

		const replacedParams = replaceGetChatParams();

		const preparedParams = generateFinalTemplateParams(
			template,
			replacedParams,
			false
		);

		if (!preparedParams) return;

		const data = { ...template };
		data.components = Object.values(preparedParams);

		setMessageData(ChatMessageModel.fromTemplate(data));
	}, [templates, template, params, csvData]);

	return (
		<div className="stepPreviewResult">
			<div className={style.stepPreviewResult__wrapper}>
				{messageData && (
					<ErrorBoundary>
						<ChatMessage
							data={messageData}
							templateData={templates[messageData.templateName]}
							disableMediaPreview
						/>
					</ErrorBoundary>
				)}
			</div>
		</div>
	);
};

export default StepPreviewResult;
