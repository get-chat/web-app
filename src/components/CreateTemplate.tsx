import React, { useState } from 'react';
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import '../styles/CreateTemplate.css';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

function CreateTemplate() {
	const [language, setLanguage] = useState('en_US');
	const [category, setCategory] = useState('AUTO_REPLY');

	const createTemplate = () => {};

	const handleLanguageChange = (event: SelectChangeEvent) => {
		setLanguage(event.target.value);
	};

	const handleCategoryChange = (event: SelectChangeEvent) => {
		setCategory(event.target.value);
	};

	return (
		<div className="createTemplate">
			<h3>Create a template</h3>

			<TextField
				label="Name"
				variant="outlined"
				size="medium"
				fullWidth={true}
			/>

			<FormControl variant="outlined" fullWidth={true}>
				<InputLabel>Language</InputLabel>
				<Select
					variant="standard"
					onChange={handleLanguageChange}
					label="Language"
					value={language}
				>
					<MenuItem value={'en_US'}>en_US</MenuItem>
				</Select>
			</FormControl>

			<FormControl variant="outlined" fullWidth={true}>
				<InputLabel>Category</InputLabel>
				<Select
					variant="standard"
					onChange={handleCategoryChange}
					label="Category"
					value={category}
				>
					<MenuItem value={'AUTO_REPLY'}>AUTO_REPLY</MenuItem>
				</Select>
			</FormControl>

			<TextField
				label="Body"
				multiline
				variant="outlined"
				size="medium"
				fullWidth={true}
			/>

			<Button fullWidth={true} onClick={createTemplate}>
				Create
			</Button>
		</div>
	);
}

export default CreateTemplate;
