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
        return (
            getComponentOrderByType(b.type) - getComponentOrderByType(a.type)
        );
    });

    return components;
};
