// @ts-nocheck
import { useTranslation } from 'react-i18next';
import {
	addDays,
	addMonths,
	differenceInCalendarDays,
	endOfDay,
	endOfMonth,
	endOfWeek,
	isSameDay,
	previousSaturday,
	previousSunday,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from 'date-fns';
import { createStaticRanges } from 'react-date-range';
import { useMemo } from 'react';

const useDateRanges = () => {
	const { t } = useTranslation();

	const defineds = useMemo(() => {
		if (!open) {
			return {};
		}

		const now = new Date();
		return {
			startOfWeek: startOfWeek(now),
			endOfWeek: endOfWeek(now),
			startOfLastWeek: startOfWeek(addDays(now, -7)),
			endOfLastWeek: endOfWeek(addDays(now, -7)),
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
	}, [open]);

	const customStaticRanges = createStaticRanges([
		{
			label: t('Today'),
			range: () => ({
				startDate: defineds.startOfToday,
				endDate: defineds.endOfToday,
			}),
		},
		{
			label: t('Yesterday'),
			range: () => ({
				startDate: defineds.startOfYesterday,
				endDate: defineds.endOfYesterday,
			}),
		},

		{
			label: t('This week'),
			range: () => ({
				startDate: defineds.startOfWeek,
				endDate: defineds.endOfWeek,
			}),
		},
		{
			label: t('Last week'),
			range: () => ({
				startDate: defineds.startOfLastWeek,
				endDate: defineds.endOfLastWeek,
			}),
		},
		{
			label: t('This month'),
			range: () => ({
				startDate: defineds.startOfMonth,
				endDate: defineds.endOfMonth,
			}),
		},
		{
			label: t('Last month'),
			range: () => ({
				startDate: defineds.startOfLastMonth,
				endDate: defineds.endOfLastMonth,
			}),
		},
		{
			label: t('Last Saturday'),
			range: () => ({
				startDate: defineds.previousSaturday,
				endDate: defineds.previousSaturday,
			}),
		},
		{
			label: t('Last Sunday'),
			range: () => ({
				startDate: defineds.previousSunday,
				endDate: defineds.previousSunday,
			}),
		},
	]);

	const customInputRanges = [
		{
			label: 'days up to today',
			range(value) {
				return {
					startDate: addDays(
						defineds.startOfToday,
						(Math.max(Number(value), 1) - 1) * -1
					),
					endDate: defineds.endOfToday,
				};
			},
			getCurrentValue(range) {
				if (!isSameDay(range.endDate, defineds.endOfToday)) return '-';
				if (!range.startDate) return '∞';
				return (
					differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1
				);
			},
		},
		{
			label: 'days starting today',
			range(value) {
				const today = new Date();
				return {
					startDate: today,
					endDate: addDays(today, Math.max(Number(value), 1) - 1),
				};
			},
			getCurrentValue(range) {
				if (!isSameDay(range.startDate, defineds.startOfToday)) return '-';
				if (!range.endDate) return '∞';
				return (
					differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1
				);
			},
		},
	];

	return {
		customStaticRanges,
		customInputRanges,
	};
};

export default useDateRanges;
