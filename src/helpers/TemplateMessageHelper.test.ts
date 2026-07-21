import {
	findTemplate,
	generateTemplateKey,
	getTemplateLanguageCode,
	isTemplateApproved,
	insertTemplateComponentParameters,
	sortTemplateComponents,
} from '@src/helpers/TemplateMessageHelper';
import { Template, TemplateList } from '@src/types/templates';

// Meta Graph format as returned by /api/v1/templates/
const buildTemplate = (overrides: Partial<Template> = {}): Template =>
	({
		name: 'sample_issue_resolution',
		previous_category: 'ISSUE_RESOLUTION',
		parameter_format: 'POSITIONAL',
		components: [
			{
				type: 'BODY',
				text: 'Hi {{1}}, were we able to solve the issue that you were facing?',
			},
			{
				type: 'FOOTER',
				text: 'This message is from an unverified business.',
			},
			{
				type: 'BUTTONS',
				buttons: [
					{ type: 'QUICK_REPLY', text: 'Yes' },
					{ type: 'QUICK_REPLY', text: 'No' },
				],
			},
		],
		language: 'en_US',
		status: 'APPROVED',
		category: 'UTILITY',
		id: '401188998558286',
		...overrides,
	} as Template);

describe('getTemplateLanguageCode', () => {
	it('returns plain string languages as-is (Meta format)', () => {
		expect(getTemplateLanguageCode('en_US')).toBe('en_US');
	});

	it('extracts code from object languages (message payload format)', () => {
		expect(getTemplateLanguageCode({ code: 'es' })).toBe('es');
	});

	it('returns undefined for missing language', () => {
		expect(getTemplateLanguageCode(undefined)).toBeUndefined();
	});
});

describe('isTemplateApproved', () => {
	it('accepts Meta format uppercase status', () => {
		expect(isTemplateApproved(buildTemplate({ status: 'APPROVED' }))).toBe(
			true
		);
	});

	it('accepts legacy lowercase status', () => {
		expect(isTemplateApproved(buildTemplate({ status: 'approved' }))).toBe(
			true
		);
	});

	it('rejects other statuses', () => {
		expect(isTemplateApproved(buildTemplate({ status: 'PENDING' }))).toBe(
			false
		);
		expect(isTemplateApproved(buildTemplate({ status: 'REJECTED' }))).toBe(
			false
		);
	});
});

describe('generateTemplateKey', () => {
	it('keys templates by name and language', () => {
		expect(generateTemplateKey(buildTemplate())).toBe(
			'sample_issue_resolution@en_US'
		);
	});

	it('keeps templates with the same name but different languages distinct', () => {
		const enTemplate = buildTemplate({ language: 'en_US' });
		const esTemplate = buildTemplate({ language: 'es' });
		expect(generateTemplateKey(enTemplate)).not.toBe(
			generateTemplateKey(esTemplate)
		);
	});
});

describe('findTemplate', () => {
	const enTemplate = buildTemplate({ language: 'en_US' });
	const esTemplate = buildTemplate({
		language: 'es',
		id: '332870205593882',
		components: [
			{
				type: 'BODY',
				text: 'Hola, {{1}}. ¿Pudiste solucionar el problema que tenías?',
			},
		],
	});
	const templates: TemplateList = {
		[generateTemplateKey(enTemplate)]: enTemplate,
		[generateTemplateKey(esTemplate)]: esTemplate,
	};

	it('finds the exact language variant when language is provided', () => {
		expect(findTemplate(templates, 'sample_issue_resolution', 'es')).toBe(
			esTemplate
		);
	});

	it('accepts message payload language objects', () => {
		expect(
			findTemplate(templates, 'sample_issue_resolution', { code: 'en_US' })
		).toBe(enTemplate);
	});

	it('falls back to any variant matching the name', () => {
		expect(findTemplate(templates, 'sample_issue_resolution')).toBeDefined();
		expect(
			findTemplate(templates, 'sample_issue_resolution', 'pt_BR')?.name
		).toBe('sample_issue_resolution');
	});

	it('returns undefined for unknown names', () => {
		expect(findTemplate(templates, 'nonexistent')).toBeUndefined();
		expect(findTemplate(templates, undefined)).toBeUndefined();
	});
});

describe('Meta format component rendering', () => {
	it('sorts header, body, footer and buttons into display order', () => {
		const template = buildTemplate({
			components: [
				{ type: 'BODY', text: 'Body {{1}}' },
				{ type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Yes' }] },
				{ type: 'FOOTER', text: 'Footer' },
				{ type: 'HEADER', format: 'IMAGE' },
			],
		});
		const sorted = sortTemplateComponents(template.components ?? []);
		expect(sorted.map((component) => component.type)).toEqual([
			'HEADER',
			'BODY',
			'FOOTER',
			'BUTTONS',
		]);
	});

	it('inserts positional parameters into Meta format body text', () => {
		const bodyComponent = {
			type: 'BODY' as const,
			text: 'Hi {{1}}, your order is being processed!',
		};
		const result = insertTemplateComponentParameters(bodyComponent, [
			{
				type: 'body',
				parameters: [{ type: 'text', text: 'Berkay' }],
			},
		]);
		expect(result).toBe('Hi Berkay, your order is being processed!');
	});
});
