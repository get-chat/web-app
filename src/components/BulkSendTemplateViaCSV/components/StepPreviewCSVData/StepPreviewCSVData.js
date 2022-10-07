import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';

const StepPreviewCSVData = ({ t, csvHeader, csvData }) => {
	const previewLimit = 5;

	return (
		<div>
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
						{csvData?.slice(0, previewLimit)?.map((row, rowIndex) => (
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

			{(csvData?.length ?? 0) > previewLimit && (
				<div className="mt-3">
					{t('There are %d more row(s)...', csvData.length - previewLimit)}
				</div>
			)}
		</div>
	);
};

export default StepPreviewCSVData;
