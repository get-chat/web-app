import { useTranslation } from 'react-i18next';
import {
	addDays,
	addMonths,
	endOfDay,
	endOfMonth,
	endOfWeek,
	previousSaturday,
	previousSunday,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from 'date-fns';
import { createStaticRanges } from 'react-date-range';
import { useMemo } from 'react';

interface Props {
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const useDateRanges = ({ weekStartsOn = 0 }: Props) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => ({
			weekStartsOn: weekStartsOn,
		}),
		[weekStartsOn]
	);

	const defineds = useMemo(() => {
		if (!open) {
			return {};
		}

		const now = new Date();
		return {
			startOfWeek: startOfWeek(now, options),
			endOfWeek: endOfWeek(now, options),
			startOfLastWeek: startOfWeek(addDays(now, -7), options),
			endOfLastWeek: endOfWeek(addDays(now, -7), options),
			startOfToday: startOfDay(now),
			endOfToday: endOfDay(now),
			startOfYesterday: startOfDay(addDays(now, -1)),
			endOfYesterday: endOfDay(addDays(now, -1)),
			startOfMonth: startOfMonth(now),
			endOfMonth: endOfMonth(now),
			startOfLastMonth: startOfMonth(addMonths(now, -1)),
			endOfLastMonth: endOfMonth(addMonths(now, -1)),
			previousSaturday: previousSaturday(now),
			previousSunday: previousSunday(now),
		};
	}, [open, options]);

	const customStaticRanges = createStaticRanges([
		{
			label: t('Today'),
			range: () => ({
				startDate: defineds.startOfToday,
				endDate: defineds.endOfToday,
			}),
			isSelected: () => false,
		},
		{
			label: t('Yesterday'),
			range: () => ({
				startDate: defineds.startOfYesterday,
				endDate: defineds.endOfYesterday,
			}),
			isSelected: () => false,
		},
		{
			label: t('Last Sunday'),
			range: () => ({
				startDate: defineds.previousSunday,
				endDate: defineds.previousSunday,
			}),
			isSelected: () => false,
		},
		{
			label: t('Last Saturday'),
			range: () => ({
				startDate: defineds.previousSaturday,
				endDate: defineds.previousSaturday,
			}),
			isSelected: () => false,
		},
		{
			label: t('This week'),
			range: () => ({
				startDate: defineds.startOfWeek,
				endDate: defineds.endOfWeek,
			}),
			isSelected: () => false,
		},
		{
			label: t('Last week'),
			range: () => ({
				startDate: defineds.startOfLastWeek,
				endDate: defineds.endOfLastWeek,
			}),
			isSelected: () => false,
		},
		{
			label: t('This month'),
			range: () => ({
				startDate: defineds.startOfMonth,
				endDate: defineds.endOfMonth,
			}),
			isSelected: () => false,
		},
		{
			label: t('Last month'),
			range: () => ({
				startDate: defineds.startOfLastMonth,
				endDate: defineds.endOfLastMonth,
			}),
			isSelected: () => false,
		},
	]);

	return {
		customStaticRanges,
	};
};

export default useDateRanges;
