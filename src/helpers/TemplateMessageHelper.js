export const getTemplateParams = (text) => {
    const matches = text?.match(/\{{(.*?)\}}/g);
    return matches ? matches : [];
}
export const templateParamToInteger = (templateParam) => {
    return templateParam.match(/\d+/);
}
export const insertTemplateComponentParameters = (component, params) => {
    if (!component) return;

    const type = component.type.toLowerCase();
    const format = component.format ? component.format.toLowerCase() : "text";
    let text = component[format];

    if (!params) return text;

    for (let i = 0; i < params.length; i++) {
        const component = params[i];

        if (component.type === type) {
            component.parameters.forEach((param, index) => {
                const paramType = param.type;

                const paramValue = param[paramType].fallback_value ?? param[paramType];
                text = text.replace(`{{${index + 1}}}`, paramValue);
            });

            break;
        }
    }

    return text;
}