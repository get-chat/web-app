import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Button, DialogActions } from '@mui/material';

interface Props {
	open: boolean;
	setOpen: (isOpen: boolean) => void;
	onDone: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

const DateRangeDialog: React.FC<Props> = ({ open, setOpen, onDone }) => {
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(new Date());
	const [minDate, setMinDate] = useState<Date | undefined>();
	const [maxDate, setMaxDate] = useState<Date | undefined>();

	const { t } = useTranslation();

	useEffect(() => {
		if (open) {
			const now = new Date();
			setStartDate(now);
			setEndDate(now);
			setMinDate(new Date(2021, 0, 1));
			setMaxDate(now);
		}
	}, [open]);

	const close = () => {
		setOpen(false);
	};

	const dateRange = {
		startDate: startDate,
		endDate: endDate,
		key: 'selection',
	};

	const handleChange = (rangesByKey: RangeKeyDict) => {
		setStartDate(rangesByKey.selection.startDate);
		setEndDate(rangesByKey.selection.endDate);
	};

	const apply = () => {
		let finalStartDate = startDate;
		// Check if start date is before min date
		if (startDate) {
			if (startDate.getTime() < (minDate?.getTime() ?? 0)) {
				finalStartDate = minDate;
			}
		}

		let finalEndDate = endDate;
		// Check if end date is after max date
		if (endDate) {
			if (endDate.getTime() > (maxDate?.getTime() ?? 0)) {
				finalEndDate = maxDate;
			}
		}

		onDone(finalStartDate, finalEndDate);
		close();
	};

	return (
		<Dialog open={open} onClose={close}>
			{/*<DialogTitle>{t('Date')}</DialogTitle>*/}
			<DateRangePicker
				ranges={[dateRange]}
				onChange={handleChange}
				minDate={minDate}
				maxDate={maxDate}
			/>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button onClick={apply} color="primary">
					{t('Apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DateRangeDialog;
