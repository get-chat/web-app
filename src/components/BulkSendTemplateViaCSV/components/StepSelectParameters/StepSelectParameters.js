import React from 'react';
import {
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

const StepSelectParameters = ({ csvHeader, template, params, updateParam }) => {
	const convertParameterValue = (compIndex, param) => {
		const textValue = params[compIndex][templateParamToInteger(param)].text;
		if (textValue && textValue.length > 0) {
			// TODO: Use the chosen separator
			return textValue.split(' ');
		}

		return [];
	};

	return (
		<div>
			{template?.components.map((comp, compIndex) => (
				<div key={compIndex}>
					{comp.text}
					<div>
						{getTemplateParams(comp.text).map((param, paramIndex) => (
							<Autocomplete
								multiple
								key={paramIndex}
								options={csvHeader}
								getOptionLabel={(headerItem) => headerItem}
								//defaultValue={[values[1]]}
								defaultValue={
									params[compIndex]
										? convertParameterValue(compIndex, param)
										: []
								}
								onChange={(event, value) =>
									updateParam(event, compIndex, templateParamToInteger(param))
								}
								renderInput={(autoCompleteParams) => (
									<TextField
										{...autoCompleteParams}
										variant="standard"
										label="Multiple values"
										placeholder="Favorites"
									/>
								)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default StepSelectParameters;
