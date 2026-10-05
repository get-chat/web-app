import React, { useState } from 'react';
import '../styles/CreateTemplate.css';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import { Textarea } from '@src/components/ui/textarea';

function CreateTemplate() {
	const [language, setLanguage] = useState('en_US');
	const [category, setCategory] = useState('AUTO_REPLY');

	const createTemplate = () => {};

	const handleLanguageChange = (value: string) => {
		setLanguage(value);
	};

	const handleCategoryChange = (value: string) => {
		setCategory(value);
	};

	return (
		<div className="createTemplate">
			<h3>Create a template</h3>

			{/* mb-[15px]: CreateTemplate.css spaced MUI's FormControls */}
			<Field className="mb-[15px]">
				<FieldLabel htmlFor="create-template-name">Name</FieldLabel>
				<Input id="create-template-name" size="lg" />
			</Field>

			<Field className="mb-[15px]">
				<FieldLabel htmlFor="create-template-language">Language</FieldLabel>
				<Select value={language} onValueChange={handleLanguageChange}>
					<SelectTrigger
						id="create-template-language"
						variant="underline"
						className="w-full"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en_US">en_US</SelectItem>
					</SelectContent>
				</Select>
			</Field>

			<Field className="mb-[15px]">
				<FieldLabel htmlFor="create-template-category">Category</FieldLabel>
				<Select value={category} onValueChange={handleCategoryChange}>
					<SelectTrigger
						id="create-template-category"
						variant="underline"
						className="w-full"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="AUTO_REPLY">AUTO_REPLY</SelectItem>
					</SelectContent>
				</Select>
			</Field>

			<Field className="mb-[15px]">
				<FieldLabel htmlFor="create-template-body">Body</FieldLabel>
				<Textarea id="create-template-body" />
			</Field>

			<Button
				variant="ghost"
				color="primary"
				className="w-full"
				onClick={createTemplate}
			>
				Create
			</Button>
		</div>
	);
}

export default CreateTemplate;
