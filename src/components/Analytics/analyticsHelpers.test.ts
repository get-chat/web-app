import {
	clearFilters,
	DEFAULT_FILTERS,
	formatDateRange,
	formatDuration,
	getChange,
	getPeriodRange,
	toCsv,
	toggleFilter,
} from '@src/components/Analytics/analyticsHelpers';

describe('formatDuration', () => {
	it('shows the two largest units', () => {
		expect(formatDuration(45)).toBe('45s');
		expect(formatDuration(252)).toBe('4m 12s');
		expect(formatDuration(3600)).toBe('1h');
		expect(formatDuration(11100)).toBe('3h 5m');
		expect(formatDuration(2667299.7)).toBe('30d 20h');
	});

	it('shows a dash when there is nothing to average', () => {
		expect(formatDuration(null)).toBe('–');
	});
});

describe('getChange', () => {
	it('is relative to the previous period', () => {
		expect(getChange(15, 10)).toBe(0.5);
		expect(getChange(5, 10)).toBe(-0.5);
	});

	it('is not comparable without a previous value', () => {
		expect(getChange(5, 0)).toBeNull();
		expect(getChange(5, null)).toBeNull();
		expect(getChange(null, 10)).toBeNull();
	});
});

describe('getPeriodRange', () => {
	it('starts presets at midnight, so day buckets match calendar days', () => {
		const { start, end } = getPeriodRange({
			...DEFAULT_FILTERS,
			period: 'last7',
		});
		expect(start.getHours()).toBe(0);
		expect(start.getMinutes()).toBe(0);
		expect(
			Math.round((end.getTime() - start.getTime()) / 864e5)
		).toBeLessThanOrEqual(7);
	});

	it('uses the custom range as given', () => {
		const customRange = {
			start: new Date(2026, 8, 1),
			end: new Date(2026, 9, 1),
		};
		expect(
			getPeriodRange({ ...DEFAULT_FILTERS, period: 'custom', customRange })
		).toBe(customRange);
	});
});

describe('formatDateRange', () => {
	// Intl puts thin spaces around the dash
	const format = (start: Date, end: Date) =>
		formatDateRange({ start, end }, 'en').replace(/\s/g, ' ');

	it('treats the end as exclusive', () => {
		expect(format(new Date(2026, 8, 1), new Date(2026, 9, 1))).toBe(
			'Sep 1 – 30'
		);
		expect(format(new Date(2026, 9, 6), new Date(2026, 9, 6, 15))).toBe(
			'Oct 6'
		);
	});
});

describe('filters', () => {
	it('toggles an agent, group or tag', () => {
		const once = toggleFilter(DEFAULT_FILTERS, 'user', 3);
		expect(once.user).toEqual([3]);
		expect(toggleFilter(once, 'user', 'none').user).toEqual([3, 'none']);
		expect(toggleFilter(once, 'user', 3).user).toEqual([]);
	});

	it('clears everything but the period', () => {
		const filters = {
			...DEFAULT_FILTERS,
			period: 'last30' as const,
			tag: [1],
			status: 'open' as const,
		};
		expect(clearFilters(filters)).toEqual({
			...DEFAULT_FILTERS,
			period: 'last30',
		});
	});
});

describe('toCsv', () => {
	it('quotes cells that need it and leaves nulls empty', () => {
		expect(
			toCsv([
				['Date', 'Name'],
				['2026-10-06', 'Smith, "Jo"'],
				[null, 3],
			])
		).toBe('Date,Name\n2026-10-06,"Smith, ""Jo"""\n,3');
	});
});
