import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';

const StepPreviewCSVData = ({ csvHeader, csvData }) => {
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
						{csvData?.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{row?.map((column, columnIndex) => (
									<TableCell key={columnIndex} component="th" scope="row">
										{column}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
};

export default StepPreviewCSVData;
