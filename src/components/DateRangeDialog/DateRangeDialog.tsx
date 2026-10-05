import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from '@src/components/ui/dialog';
import { FieldLabel } from '@src/components/ui/field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
// @ts-ignore
import * as rdrLocales from 'react-date-range/dist/locale';
import i18next from 'i18next';
import useDateRanges from '@src/components/DateRangeDialog/useDateRanges';
import { useAppSelector } from '@src/store/hooks';
import {
	getUserPreferences,
	storeUserPreference,
} from '@src/helpers/StorageHelper';
import * as Styled from './DateRangeDialog.styles';

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
		getUserPreferences()?.[currentUser?.id ?? 0]?.weekStartsOn ?? 1;

	const [weekStartsOn, setWeekStartsOn] = useState(
		getWeekStartsOnFromPreferences()
	);

	const { t } = useTranslation();

	// @ts-ignore
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
		close();
	};

	const handleWeekStartDayChange = (value: string) => {
		const day = parseInt(value ?? '1');
		if (currentUser) {
			const currentPreferences = getUserPreferences()?.[currentUser.id];
			currentPreferences.weekStartsOn = day;
			storeUserPreference(currentUser.id, currentPreferences);
		}

		setWeekStartsOn(day);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent aria-describedby={undefined} className="w-auto">
				<DialogTitle className="sr-only">{t('Export by date')}</DialogTitle>
				<DialogBody className="p-0">
					<Styled.CalendarContainer>
						<DateRangePicker
							ranges={[dateRange]}
							onChange={handleChange}
							minDate={minDate}
							maxDate={maxDate}
							locale={rdrLocales[i18next.resolvedLanguage]}
							staticRanges={customStaticRanges}
							inputRanges={[]}
						/>
					</Styled.CalendarContainer>

					<Styled.WeekStartDaySelectorContainer>
						<Styled.FormControlStyled>
							<FieldLabel htmlFor="week-start-day-select">
								{t('Start week on')}
							</FieldLabel>
							<Select
								value={weekStartsOn.toString()}
								onValueChange={handleWeekStartDayChange}
							>
								<SelectTrigger id="week-start-day-select" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="6">{t('Saturday')}</SelectItem>
									<SelectItem value="0">{t('Sunday')}</SelectItem>
									<SelectItem value="1">{t('Monday')}</SelectItem>
								</SelectContent>
							</Select>
						</Styled.FormControlStyled>
					</Styled.WeekStartDaySelectorContainer>
				</DialogBody>

				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
					<Button variant="ghost" color="primary" onClick={apply}>
						{t('Done')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DateRangeDialog;
