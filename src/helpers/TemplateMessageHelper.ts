import { isEmptyString } from './Helpers';
import {
	FORM_VALIDATION_ERROR,
	InvalidTemplateParamException,
} from '../Constants';
import {
	Template,
	TemplateComponent,
	TemplateParameter,
} from '@src/types/templates';

/**
 * Extracts all template parameter placeholders from a template text string.
 *
 * @param {string | undefined} text - The template text containing placeholders (e.g., "Hello {{1}}, welcome to {{company_name}}")
 * @returns {string[]} Array of matched placeholder strings (e.g., ["{{1}}", "{{company_name}}"])
 *
 * @example
 * getTemplateParams("Hello {{1}}, welcome to {{company_name}}")
 * // Returns: ["{{1}}", "{{company_name}}"]
 *
 * @example
 * getTemplateParams("Text with no placeholders")
 * // Returns: []
 *
 * @example
 * getTemplateParams(undefined)
 * // Returns: []
 */
export const getTemplateParams = (text: string | undefined): string[] => {
	const matches = text?.match(/\{{(.*?)\}}/g);
	return matches ? matches : [];
};

/**
 * Extracts the inner key from a template parameter placeholder.
 *
 * @param {string} templateParam - The full parameter placeholder (e.g., "{{1}}", "{{ customer_name }}")
 * @returns {string | null} The extracted key (e.g., "1", "customer_name") or null if no match found
 *
 * @remarks
 * - Trims whitespace from the extracted key
 * - Returns null for malformed placeholders
 * - Handles both numeric and string-based placeholders
 *
 * @example
 * extractParameterKey("{{1}}")
 * // Returns: "1"
 *
 * @example
 * extractParameterKey("{{ customer_name }}")
 * // Returns: "customer_name"
 *
 * @example
 * extractParameterKey("invalid{pattern")
 * // Returns: null
 */
export const extractParameterKey = (templateParam: string) => {
	const match = templateParam.match(/\{\{(.+?)\}\}/);
	return match ? match[1].trim() : null;
};

export const insertTemplateComponentParameters = (
	component: TemplateComponent,
	params: any[]
) => {
	if (!component) return;

	const type = component.type.toLowerCase();
	const format = component.format ? component.format.toLowerCase() : 'text';
	// @ts-ignore
	let text = component[format];

	if (!text) {
		console.warn('Variable text is empty!', format, component, params);
		return text;
	}

	if (!params) return text;

	console.log(params);

	for (let i = 0; i < params.length; i++) {
		const component = params[i];

		if (component.type === type) {
			component.parameters?.forEach(
				(param: TemplateParameter, index: number) => {
					const paramType = param.type;

					const paramValue =
						// @ts-ignore
						param[paramType]?.fallback_value ?? param[paramType];
					const paramKey = (param.parameter_name ?? index + 1).toString();
					text = safeReplaceParam(text, paramKey, paramValue);
				}
			);

			break;
		}
	}

	return text;
};

/**
 * Safely replaces all occurrences of a template parameter in text,
 * regardless of whitespace variations inside the placeholders.
 *
 * @param {string} text - The template text containing placeholders
 * @param {string} paramKey - The parameter name/key (without braces)
 * @param {string} paramValue - The value to insert
 * @returns {string} The text with all matching placeholders replaced
 *
 * @example
 * safeReplaceParam("Hello {{ name }}", "name", "Berkay") // "Hello Berkay"
 * @example
 * safeReplaceParam("Hello {{name}}", "name", "Berkay")  // "Hello Berkay"
 * @example
 * safeReplaceParam("Hello {{ name}}", "name", "Berkay") // "Hello Berkay"
 */
export const safeReplaceParam = (
	text: string,
	paramKey: string,
	paramValue: string
): string => {
	// Create regex pattern that matches any whitespace variations
	const pattern = new RegExp(
		`\\{\\{\\s*${escapeRegExp(paramKey)}\\s*\\}\\}`,
		'g'
	);
	return text.replace(pattern, paramValue);
};

/**
 * Escapes special regex characters in a string
 */
const escapeRegExp = (string: string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const sortTemplateComponents = (components: TemplateComponent[]) => {
	if (!components) return [];
	// Make components mutable
	components = [...components];

	const getComponentOrderByType = (componentType: string) => {
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
	hasHeader: boolean,
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
		const paramPlaceholder = extractParameterKey(extractedParam);
		if (paramPlaceholder) {
			preparedParams[key][paramPlaceholder] = {
				type: 'text',
				text: paramValues
					? paramValues[extractedParamIndex + (hasHeader ? 2 : 1)]
					: '',
			};
		}
	});
};

export const generateTemplateParamsByValues = (
	template: Template,
	paramValues: any
) => {
	const preparedParams: { [key: string]: any } = {};
	const components = { ...template.components };

	let hasHeader = false;

	Object.entries(components).forEach((paramEntry) => {
		const key = paramEntry[0];
		const component = paramEntry[1] as TemplateComponent;
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
			generateParamsForComponent(
				hasHeader,
				preparedParams,
				paramValues,
				key,
				it,
				'url'
			);
		});

		// Generate params for other components
		generateParamsForComponent(
			hasHeader,
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
	template: Template,
	params: any,
	checkInvalidParams: boolean,
	onError?: (error: Error | any) => void
) => {
	const preparedParams: { [key: string]: any } = {};
	const components: { [key: number]: TemplateComponent } = {
		...template.components,
	};

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
						param.text = textParamArray
							?.map((s: string) => s.trim())
							?.join(' ');
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

				buttonsComponents?.forEach(
					(buttonComponent: any, buttonComponentIndex: number) => {
						if (buttonComponent.type?.toLowerCase() === 'url') {
							preparedParams[component.type]['sub_type'] = 'url';
							preparedParams[component.type]['index'] = buttonComponentIndex;
						}
					}
				);
			}
		});
	} catch (error: Error | any) {
		onError?.(error);
	}

	return preparedParams;
};

export const componentHasMediaFormat = (comp: TemplateComponent) =>
	comp &&
	(comp.format === 'IMAGE' ||
		comp.format === 'VIDEO' ||
		comp.format === 'DOCUMENT');
