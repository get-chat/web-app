import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Button, DialogActions } from '@mui/material';

interface Props {
	open: boolean;
	setOpen: (isOpen: boolean) => void;
}

const DateRangeDialog: React.FC<Props> = ({ open, setOpen }) => {
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(new Date());

	const { t } = useTranslation();

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

	return (
		<Dialog open={open} onClose={close}>
			{/*<DialogTitle>{t('Date')}</DialogTitle>*/}
			<DateRangePicker ranges={[dateRange]} onChange={handleChange} />
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button onClick={close} color="primary">
					{t('Apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DateRangeDialog;
