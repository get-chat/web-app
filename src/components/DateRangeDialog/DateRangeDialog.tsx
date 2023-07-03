import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
	Button,
	DialogActions,
	FormControl,
	InputLabel,
	Menu,
	MenuItem,
	Select,
	SelectChangeEvent,
} from '@mui/material';
// @ts-ignore
import * as rdrLocales from 'react-date-range/dist/locale';
import i18next from 'i18next';
import useDateRanges from '@src/components/DateRangeDialog/useDateRanges';
import { useAppSelector } from '@src/store/hooks';
import { setUserPreference } from '@src/helpers/StorageHelper';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import styles from './DateRangeDialog.module.css';

interface Props {
	open: boolean;
	setOpen: (isOpen: boolean) => void;
	onDone: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

const DateRangeDialog: React.FC<Props> = ({ open, setOpen, onDone }) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);

	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(new Date());
	const [minDate, setMinDate] = useState<Date | undefined>();
	const [maxDate, setMaxDate] = useState<Date | undefined>();

	const getWeekStartsOnFromPreferences = () =>
		currentUser?.getPreferences()?.weekStartsOn ?? 1;

	const [weekStartsOn, setWeekStartsOn] = useState(
		getWeekStartsOnFromPreferences()
	);

	const { t } = useTranslation();

	const { customStaticRanges } = useDateRanges({ weekStartsOn: weekStartsOn });

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

		// Copy date without reference
		let finalEndDate: Date | undefined = new Date(endDate?.getTime() ?? 0);
		// Check if end date is after max date
		if (endDate) {
			if (endDate.getTime() > (maxDate?.getTime() ?? 0)) {
				finalEndDate = maxDate;
			}
		}

		// Set time for start and end dates
		finalStartDate?.setHours(0, 0, 0, 0);
		finalEndDate?.setHours(23, 59, 59, 0);

		onDone(finalStartDate, finalEndDate);
	};

	const handleWeekStartDayChange = (event: SelectChangeEvent) => {
		const day = parseInt(event.target.value ?? '1');
		if (currentUser) {
			const currentPreferences = currentUser.getPreferences();
			currentPreferences.weekStartsOn = day;
			setUserPreference(currentUser.id, currentPreferences);
		}

		setWeekStartsOn(day);
	};

	return (
		<Dialog open={open} onClose={close}>
			<div className={styles.calendarContainer}>
				<DateRangePicker
					ranges={[dateRange]}
					onChange={handleChange}
					minDate={minDate}
					maxDate={maxDate}
					locale={rdrLocales[i18next.resolvedLanguage]}
					staticRanges={customStaticRanges}
					inputRanges={[]}
				/>
			</div>

			<div className={styles.weekStartDaySelectorContainer}>
				<FormControl className={styles.formControl}>
					<InputLabel id="select-label">{t('Start week on')}</InputLabel>
					<Select
						labelId="select-label"
						value={weekStartsOn.toString()}
						onChange={handleWeekStartDayChange}
					>
						<MenuItem value="6">{t('Saturday')}</MenuItem>
						<MenuItem value="0">{t('Sunday')}</MenuItem>
						<MenuItem value="1">{t('Monday')}</MenuItem>
					</Select>
				</FormControl>
			</div>

			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button onClick={apply} color="primary">
					{t('Done')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DateRangeDialog;
