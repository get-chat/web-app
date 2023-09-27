// @ts-nocheck
// noinspection JSDeprecatedSymbols

import { isEmptyString } from './Helpers';
import {
	FORM_VALIDATION_ERROR,
	InvalidTemplateParamException,
} from '../Constants';

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

	if (!text) {
		console.warn('Variable text is empty!', format, component, params);
		return text;
	}

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

const generateParamsForComponent = (
	preparedParams: any,
	paramValues: any,
	key: string,
	component: any,
	propertyName: string
) => {
	const paramText = component[propertyName];
	const templateParamsArray = getTemplateParams(paramText);

	templateParamsArray.forEach((extractedParam, extractedParamIndex) => {
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

		// Generate params for URL buttons
		component.buttons?.forEach((it) => {
			generateParamsForComponent(preparedParams, paramValues, key, it, 'url');
		});

		// Generate params for other components
		generateParamsForComponent(
			preparedParams,
			paramValues,
			key,
			component,
			'text'
		);
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
		Object.entries(components).forEach((paramEntry) => {
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
					}

					const paramText =
						param.text ??
						param.image?.link ??
						param.video?.link ??
						param.document?.link ??
						param.button?.text;

					// Check if param is empty
					if (isEmptyString(paramText)) {
						throw {
							type: FORM_VALIDATION_ERROR,
							message: `You need to fill the ${component.type} section`,
						};
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

				const buttonsComponents = component['buttons'];

				buttonsComponents?.forEach((buttonComponent, buttonComponentIndex) => {
					if (buttonComponent.type?.toLowerCase() === 'url') {
						preparedParams[component.type]['sub_type'] = 'url';
						preparedParams[component.type]['index'] = buttonComponentIndex;
					}
				});
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
