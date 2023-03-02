// @ts-nocheck
// noinspection JSDeprecatedSymbols

import { isEmptyString } from './Helpers';
import { BreakException, InvalidTemplateParamException } from '../Constants';

export const getTemplateParams = (text) => {
	const matches = text?.match(/\{{(.*?)\}}/g);
	return matches ? matches : [];
};
export const templateParamToInteger = (templateParam) => {
	return templateParam.match(/\d+/);
};
export const insertTemplateComponentParameters = (component, params) => {
	if (!component) return;

	const type = component.type.toLowerCase();
	const format = component.format ? component.format.toLowerCase() : 'text';
	let text = component[format];

	if (!params) return text;

	for (let i = 0; i < params.length; i++) {
		const component = params[i];

		if (component.type === type) {
			if (component.parameters) {
				component.parameters.forEach((param, index) => {
					const paramType = param.type;

					const paramValue =
						param[paramType]?.fallback_value ?? param[paramType];
					text = text.replace(`{{${index + 1}}}`, paramValue);
				});
			}

			break;
		}
	}

	return text;
};

export const sortTemplateComponents = (components) => {
	if (!components) return [];

	const getComponentOrderByType = (componentType) => {
		switch (componentType) {
			case 'HEADER':
				return 4;
			case 'BODY':
				return 3;
			case 'FOOTER':
				return 2;
			case 'BUTTONS':
				return 1;
			default:
				return 0;
		}
	};

	components.sort(function (a, b) {
		return getComponentOrderByType(b.type) - getComponentOrderByType(a.type);
	});

	return components;
};

export const generateTemplateParamsByValues = (template, paramValues) => {
	const preparedParams = {};
	const components = { ...template.components };

	let hasHeader = false;

	Object.entries(components).forEach((paramEntry, paramIndex) => {
		const key = paramEntry[0];
		const component = paramEntry[1];
		const componentType = component.type;

		if (componentType === 'HEADER') {
			if (
				component.format === 'IMAGE' ||
				component.format === 'VIDEO' ||
				component.format === 'DOCUMENT'
			) {
				hasHeader = true;

				const format = component.format.toLowerCase();
				preparedParams[key] = {
					0: { type: format },
				};

				preparedParams[key][0][format] = {
					link: paramValues ? paramValues[1] : '',
				};
			}
		}

		if (componentType === 'BUTTONS') {
			component.buttons.forEach((button, buttonIndex) => {
				if (button.type === 'URL') {
					if (preparedParams[key] === undefined) {
						preparedParams[key] = {};
					}

					preparedParams[key][buttonIndex] = {
						type: 'button',
						sub_type: 'url',
						parameters: [
							{
								type: 'text',
								text: paramValues ? paramValues[1] : '',
							},
						],
					};
				}
			});
		}

		const paramText = component.text;
		const templateParamsArray = getTemplateParams(paramText);

		templateParamsArray.map((extractedParam, extractedParamIndex) => {
			if (preparedParams[key] === undefined) {
				preparedParams[key] = {};
			}
			preparedParams[key][templateParamToInteger(extractedParam)] = {
				type: 'text',
				text: paramValues
					? paramValues[extractedParamIndex + (hasHeader ? 2 : 1)]
					: '',
			};
		});
	});

	return preparedParams;
};

export const generateFinalTemplateParams = (
	template,
	params,
	checkInvalidParams,
	onError
) => {
	const preparedParams = {};
	const components = { ...template.components };

	try {
		// noinspection DuplicatedCode
		Object.entries(components).forEach((paramEntry, paramIndex) => {
			const key = paramEntry[0];
			const component = paramEntry[1];

			if (params[key]) {
				const paramsArray = [
					...JSON.parse(JSON.stringify(Object.values(params[key]))),
				];

				// Check if it has empty params and throw BreakException if found
				paramsArray.forEach((param) => {
					// Trim spaces
					if (param.text) {
						// Trim spaces in every line and replace new lines with spaces
						const textParamArray = param.text?.split(/\r?\n/);
						param.text = textParamArray?.map((s) => s.trim())?.join(' ');
					} else if (param.image?.link) {
						param.image.link = param.image.link.trim();
					} else if (param.video?.link) {
						param.video.link = param.video.link.trim();
					} else if (param.document?.link) {
						param.document.link = param.document.link.trim();
					} else if (param.parameters[0]) {
						param.parameters[0].text = param.parameters[0].text.trim();
					}

					const paramText =
						param.text ??
						param.image?.link ??
						param.video?.link ??
						param.document?.link ??
						param.parameters[0]?.text;

					// Check if param is empty
					if (isEmptyString(paramText)) {
						throw BreakException;
					}

					if (checkInvalidParams) {
						// Check new lines, tab and 4 consecutive spaces
						if (/[\r\n\t]/.exec(paramText) || paramText?.match('\\s{4}')) {
							throw InvalidTemplateParamException;
						}
					}
				});

				/*const localizableParams = [];
				paramsArray.forEach((paramArrayItem) => {
					localizableParams.push({
						default: paramArrayItem.text,
					});
				});*/

				preparedParams[component.type] = {
					type:
						component.type.toLowerCase() === 'buttons'
							? 'button'
							: component.type.toLowerCase(),
					parameters: paramsArray,
					//localizable_params: localizableParams
				};
			}
		});
	} catch (error) {
		onError?.(error);
	}

	return preparedParams;
};

export const componentHasMediaFormat = (comp) =>
	comp.format === 'IMAGE' ||
	comp.format === 'VIDEO' ||
	comp.format === 'DOCUMENT';
