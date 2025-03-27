import React, { useEffect, useState } from 'react';
import ChatMessage from '../../../Main/Chat/ChatMessage/ChatMessage';
import { ErrorBoundary } from '@sentry/react';
import { generateFinalTemplateParams } from '@src/helpers/TemplateMessageHelper';
import styles from './StepPreviewResult.module.css';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';
import { Message } from '@src/types/messages';
import { fromTemplate } from '@src/helpers/MessageHelper';

interface Props {
	template: Template;
	params: any;
	csvData: any;
}

const StepPreviewResult: React.FC<Props> = ({ template, params, csvData }) => {
	const [messageData, setMessageData] = useState<Message>();

	const templates = useAppSelector((state) => state.templates.value);

	const replaceGetChatParamWithRealData = (string: string) => {
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

		setMessageData(fromTemplate(data));
	}, [templates, template, params, csvData]);

	return (
		<div className="stepPreviewResult">
			<div className={styles.stepPreviewResult__wrapper}>
				{messageData && (
					<ErrorBoundary>
						<ChatMessage
							data={messageData}
							templateData={
								templates[messageData.waba_payload?.template?.name ?? '']
							}
							disableMediaPreview
							isInfoClickable={false}
						/>
					</ErrorBoundary>
				)}
			</div>
		</div>
	);
};

export default StepPreviewResult;
