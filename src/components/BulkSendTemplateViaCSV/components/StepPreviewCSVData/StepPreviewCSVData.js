import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const StepPreviewCSVData = ({ csvHeader, csvData }) => {
	const { t } = useTranslation();

	const PREVIEW_LIMIT = 5;

	return (
		<>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							{csvHeader?.map((headerItem, headerIndex) => (
								<TableCell key={headerIndex}>{headerItem}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{csvData?.slice(0, PREVIEW_LIMIT)?.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{Object.values(row)?.map((column, columnIndex) => (
									<TableCell key={columnIndex} component="th" scope="row">
										{column}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{(csvData?.length ?? 0) > PREVIEW_LIMIT && (
				<div className="mt-3">
					{t('There are %d more row(s)...', csvData.length - PREVIEW_LIMIT)}
				</div>
			)}
		</>
	);
};

export default StepPreviewCSVData;
