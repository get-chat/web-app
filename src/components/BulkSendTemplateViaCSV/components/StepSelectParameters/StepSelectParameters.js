import React, { useEffect, useState } from 'react';
import {
	componentHasMediaFormat,
	getTemplateParams,
	templateParamToInteger,
} from '../../../../helpers/TemplateMessageHelper';
import { Button, TextField } from '@material-ui/core';
import { Alert, AlertTitle, Autocomplete } from '@material-ui/lab';
import '../../../../styles/StepSelectParameters.css';

const StepSelectParameters = ({
	t,
	csvHeader,
	template,
	params,
	paramsError,
	updateHeaderMediaParam,
	updateParam,
}) => {
	const isSeparatorEnabled = false;

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

	const convertToGetChatCustomParam = (str) => {
		return `{{ GET_CHAT_CUSTOM.${str} }}`;
	};

	const updateFinalParams = (valuesArray, compIndex, param) => {
		const paramInt = templateParamToInteger(param);

		// Update final params
		updateParam(
			valuesArray
				.map((value) => convertToGetChatCustomParam(value))
				.join(separators[compIndex]?.[paramInt] ?? ' '),
			compIndex,
			paramInt
		);
	};

	return (
		<div className="template">
			{template?.components.map((comp, compIndex) => (
				<div key={compIndex} className="template__component">
					<h6>{comp.type}</h6>
					{componentHasMediaFormat(comp) && (
						<>
							<Autocomplete
								options={csvHeader}
								getOptionLabel={(headerItem) => headerItem}
								//value={}
								onChange={(event, value) =>
									updateHeaderMediaParam(
										convertToGetChatCustomParam(value),
										compIndex,
										comp.format
									)
								}
								renderInput={(autoCompleteParams) => (
									<TextField
										{...autoCompleteParams}
										variant="standard"
										label={comp.format}
									/>
								)}
							/>
						</>
					)}

					{comp.text && (
						<>
							{comp.text}
							{getTemplateParams(comp.text).map((param, paramIndex) => (
								<div
									key={paramIndex}
									className="template__component__parameter"
								>
									<Autocomplete
										multiple
										options={csvHeader}
										getOptionLabel={(headerItem) => headerItem}
										value={
											rawValues[compIndex]?.[templateParamToInteger(param)] ??
											[]
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

									{isSeparatorEnabled &&
										rawValues[compIndex]?.[templateParamToInteger(param)]
											?.length > 1 && (
											<TextField
												value={
													separators[compIndex]?.[
														templateParamToInteger(param)
													] ?? ''
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
						</>
					)}

					{comp.type === 'BUTTONS' && (
						<div>
							{comp.buttons.map((button, buttonIndex) => (
								<Button key={buttonIndex} color="primary" disabled={true}>
									{button.text}
								</Button>
							))}
						</div>
					)}
				</div>
			))}

			{paramsError && (
				<div className="mt-3">
					<Alert severity="error">
						<AlertTitle>{paramsError.title}</AlertTitle>
						{paramsError.details}
					</Alert>
				</div>
			)}
		</div>
	);
};

export default StepSelectParameters;
