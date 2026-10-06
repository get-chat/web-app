import { isSameDay, startOfDay, startOfMonth, subDays } from 'date-fns';
import {
	Analytics,
	AnalyticsFilterId,
	AnalyticsStatus,
	MessageCategory,
} from '@src/types/analytics';

export type PeriodPreset =
	| 'today'
	| 'last7'
	| 'last30'
	| 'thisMonth'
	| 'custom';

export interface DateRange {
	start: Date;
	end: Date;
}

export interface AnalyticsFilters {
	period: PeriodPreset;
	/** Only for the custom period */
	customRange?: DateRange;
	user: AnalyticsFilterId[];
	group: AnalyticsFilterId[];
	tag: AnalyticsFilterId[];
	status: AnalyticsStatus;
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
	period: 'last7',
	user: [],
	group: [],
	tag: [],
	status: 'all',
};

/** Drops the agent, group, tag and status filters, keeping the period */
export const clearFilters = (filters: AnalyticsFilters): AnalyticsFilters => ({
	...DEFAULT_FILTERS,
	period: filters.period,
	customRange: filters.customRange,
});

/** Adds the agent, group or tag to its filter, or removes it if it's there */
export const toggleFilter = (
	filters: AnalyticsFilters,
	dimension: 'user' | 'group' | 'tag',
	id: AnalyticsFilterId
): AnalyticsFilters => ({
	...filters,
	[dimension]: filters[dimension].includes(id)
		? filters[dimension].filter((item) => item !== id)
		: [...filters[dimension], id],
});

/**
 * Presets start at midnight, so the API's day buckets (counted from `start`)
 * line up with calendar days. They end now.
 */
export const getPeriodRange = ({
	period,
	customRange,
}: AnalyticsFilters): DateRange => {
	const now = new Date();
	switch (period) {
		case 'custom':
			return customRange ?? { start: subDays(startOfDay(now), 6), end: now };
		case 'today':
			return { start: startOfDay(now), end: now };
		case 'last30':
			return { start: subDays(startOfDay(now), 29), end: now };
		case 'thisMonth':
			return { start: startOfMonth(now), end: now };
		default:
			return { start: subDays(startOfDay(now), 6), end: now };
	}
};

export const toUnix = (date: Date) => Math.floor(date.getTime() / 1000);

/** Categorical slots, in a fixed order that stays colour-blind safe */
export const SERIES_COLORS = [
	'#2a78d6',
	'#eb6834',
	'#1baf7a',
	'#eda100',
	'#e87ba4',
	'#008300',
	'#4a3aa7',
	'#e34948',
];
/** Rest of the rows, folded into one series */
export const OTHER_COLOR = '#aab0bf';

export const MESSAGE_CATEGORIES: MessageCategory[] = [
	'marketing',
	'utility',
	'authentication',
	'service',
	'unknown',
];

export const MESSAGE_CATEGORY_COLORS: Record<MessageCategory, string> = {
	marketing: SERIES_COLORS[0],
	utility: SERIES_COLORS[1],
	authentication: SERIES_COLORS[2],
	service: SERIES_COLORS[3],
	unknown: OTHER_COLOR,
};

/** 45s, 4m 12s, 3h 5m, 2d 4h; an en dash when there is nothing to show */
export const formatDuration = (seconds: number | null | undefined) => {
	if (seconds === null || seconds === undefined) return '–';

	const total = Math.round(seconds);
	if (total < 60) return `${total}s`;

	const minutes = Math.floor(total / 60);
	if (minutes < 60) {
		const rest = total % 60;
		return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		const rest = minutes % 60;
		return rest ? `${hours}h ${rest}m` : `${hours}h`;
	}

	const days = Math.floor(hours / 24);
	const rest = hours % 24;
	return rest ? `${days}d ${rest}h` : `${days}d`;
};

/** Only the largest unit, rounded: for axis ticks */
export const formatDurationShort = (seconds: number) => {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
	return `${Math.round(seconds / 86400)}d`;
};

export const formatNumber = (value: number | null | undefined, lang: string) =>
	value === null || value === undefined
		? '–'
		: new Intl.NumberFormat(lang).format(value);

export const formatPercent = (share: number, lang: string) =>
	new Intl.NumberFormat(lang, {
		style: 'percent',
		maximumFractionDigits: 0,
	}).format(share);

export const formatBucket = (
	timestamp: number,
	granularity: Analytics['period']['granularity'],
	lang: string
) =>
	new Intl.DateTimeFormat(
		lang,
		granularity === 'hour'
			? { hour: 'numeric' }
			: { month: 'short', day: 'numeric' }
	).format(timestamp * 1000);

/** The full date of a bucket, for tooltips */
export const formatBucketLabel = (
	timestamp: number,
	granularity: Analytics['period']['granularity'],
	lang: string
) =>
	new Intl.DateTimeFormat(
		lang,
		granularity === 'hour'
			? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
			: { weekday: 'short', month: 'short', day: 'numeric' }
	).format(timestamp * 1000);

/** Shared look of the time axes: no lines, labels thinned out to fit */
export const getTimeAxisProps = (
	period: Analytics['period'],
	lang: string
) => ({
	dataKey: 'bucket',
	tickLine: false,
	axisLine: false,
	tickMargin: 8,
	minTickGap: 16,
	tickFormatter: (value: number) =>
		formatBucket(value, period.granularity, lang),
});

export const VALUE_AXIS_PROPS = {
	tickLine: false,
	axisLine: false,
	width: 44,
} as const;

export const formatDateRange = ({ start, end }: DateRange, lang: string) => {
	// The end is exclusive: a range up to midnight ends the day before
	const last = new Date(end.getTime() - 1);
	const format = new Intl.DateTimeFormat(lang, {
		month: 'short',
		day: 'numeric',
		year: start.getFullYear() !== last.getFullYear() ? 'numeric' : undefined,
	});
	return isSameDay(start, last)
		? format.format(start)
		: format.formatRange(start, last);
};

/** Relative change against the previous period, or null if not comparable */
export const getChange = (value: number | null, previous: number | null) =>
	value === null || !previous ? null : (value - previous) / previous;

const csvCell = (value: string | number | null | undefined) => {
	const text = value === null || value === undefined ? '' : String(value);
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (rows: (string | number | null | undefined)[][]) =>
	rows.map((row) => row.map(csvCell).join(',')).join('\n');
