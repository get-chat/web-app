import React from 'react';
import {
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';

const StepSelectParameters = ({ csvHeader, template, params, updateParam }) => {
	return (
		<div>
			{template?.components.map((comp, compIndex) => (
				<div key={compIndex}>
					{comp.text}
					<div>
						{getTemplateParams(comp.text).map((param, paramIndex) => (
							<FormControl key={paramIndex}>
								<InputLabel>{param}</InputLabel>
								<Select
									value={
										params[compIndex]
											? params[compIndex][templateParamToInteger(param)].text
											: ''
									}
									onChange={(event) =>
										updateParam(event, compIndex, templateParamToInteger(param))
									}
								>
									{csvHeader?.map((headerItem, headerIndex) => (
										<MenuItem key={headerIndex} value={headerItem}>
											{headerItem}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default StepSelectParameters;
