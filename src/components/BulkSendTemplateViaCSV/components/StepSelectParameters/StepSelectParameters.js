import React, { useEffect, useState } from 'react';
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
	const [rawValues, setRawValues] = useState({});
	const [separators, setSeparators] = useState({});

	useEffect(() => {
		// Reset state when template changes
		setRawValues({});
		setSeparators({});
	}, [template]);

	const updateRawValue = (valuesArray, compIndex, param) => {
		const paramInt = templateParamToInteger(param);

		setRawValues((prevState) => {
			if (!prevState[compIndex]) prevState[compIndex] = {};
			prevState[compIndex][paramInt] = valuesArray;
			return { ...prevState };
		});

		updateFinalParams(valuesArray, compIndex, param);
	};

	const updateSeparator = (event, compIndex, param) => {
		const paramInt = templateParamToInteger(param);

		setSeparators((prevState) => {
			if (!prevState[compIndex]) prevState[compIndex] = {};
			prevState[compIndex][paramInt] = event.target.value;
			return { ...prevState };
		});

		const valuesArray = rawValues[compIndex]?.[paramInt] ?? [];

		updateFinalParams(valuesArray, compIndex, param);
	};

	const updateFinalParams = (valuesArray, compIndex, param) => {
		const paramInt = templateParamToInteger(param);

		// Update final params
		updateParam(
			valuesArray.join(separators[compIndex]?.[paramInt] ?? ' '),
			compIndex,
			paramInt
		);
	};

	return (
		<div className="template">
			<div>{JSON.stringify(params)}</div>

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
									value={
										rawValues[compIndex]?.[templateParamToInteger(param)] ?? []
									}
									onChange={(event, value) =>
										updateRawValue(value, compIndex, param)
									}
									renderInput={(autoCompleteParams) => (
										<TextField
											{...autoCompleteParams}
											variant="standard"
											label={param}
											//placeholder={t('More')}
										/>
									)}
								/>

								{rawValues[compIndex]?.[templateParamToInteger(param)]?.length >
									1 && (
									<TextField
										value={
											separators[compIndex]?.[templateParamToInteger(param)] ??
											''
										}
										onChange={(event) =>
											updateSeparator(event, compIndex, param)
										}
										label={t('Separator (leave blank for space)')}
										type="text"
									/>
								)}
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default StepSelectParameters;
