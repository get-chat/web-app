import React, { useState } from 'react';
import {
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import '../../../../styles/StepSelectParameters.css';

const StepSelectParameters = ({
	t,
	csvHeader,
	template,
	params,
	updateParam,
}) => {
	const [separators, setSeparators] = useState({});

	const convertParameterValue = (compIndex, param) => {
		if (params[compIndex]) {
			const textValue = params[compIndex][templateParamToInteger(param)].text;
			if (textValue && textValue.length > 0) {
				// TODO: Use the chosen separator
				return textValue.split(' ');
			}
		}

		return [];
	};

	const updateSeparator = (event, compIndex, param) => {
		setSeparators((prevState) => {
			if (!prevState[compIndex]) prevState[compIndex] = {};
			prevState[compIndex][templateParamToInteger(param)] = event.target.value;
			return { ...prevState };
		});
	};

	return (
		<div className="template">
			{template?.components.map((comp, compIndex) => (
				<div key={compIndex} className="template__component">
					{comp.text}
					<div>
						{getTemplateParams(comp.text).map((param, paramIndex) => (
							<div key={paramIndex} className="template__component__parameter">
								<Autocomplete
									multiple
									options={csvHeader}
									getOptionLabel={(headerItem) => headerItem}
									value={convertParameterValue(compIndex, param)}
									onChange={(event, value) =>
										updateParam(value, compIndex, templateParamToInteger(param))
									}
									renderInput={(autoCompleteParams) => (
										<TextField
											{...autoCompleteParams}
											variant="standard"
											label={param}
											//placeholder={param}
										/>
									)}
								/>

								<TextField
									value={
										separators[compIndex]?.[templateParamToInteger(param)] ?? ''
									}
									onChange={(event) => updateSeparator(event, compIndex, param)}
									label={t('Separator (leave blank for space)')}
									type="text"
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default StepSelectParameters;
