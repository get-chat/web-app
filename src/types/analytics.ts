/** `none` selects unassigned or untagged chats */
export type AnalyticsFilterId = number | 'none';

export type AnalyticsStatus = 'all' | 'open' | 'resolved';

export interface AnalyticsParams {
	/** Unix timestamps in seconds; `end` is exclusive */
	start: number;
	end: number;
	user?: AnalyticsFilterId[];
	group?: AnalyticsFilterId[];
	tag?: AnalyticsFilterId[];
	status?: AnalyticsStatus;
	inbox_only?: boolean;
}

export interface AnalyticsKpi {
	value: number | null;
	previous: number | null;
	series: (number | null)[];
}

/** Answered conversations credited to one user, group, tag or status */
export interface AnalyticsBreakdownRow {
	/** null for unassigned or untagged chats */
	id: number | string | null;
	count: number;
	share: number;
	avg_first_response: number | null;
	avg_resolution: number | null;
	series: number[];
}

export type MessageCategory =
	| 'marketing'
	| 'utility'
	| 'authentication'
	| 'service'
	| 'unknown';

/** All durations are in seconds */
export interface Analytics {
	period: {
		start: number;
		end: number;
		previous_start: number;
		granularity: 'hour' | 'day';
		buckets: number[];
	};
	kpis: {
		conversations_answered: AnalyticsKpi;
		messages_sent: AnalyticsKpi;
		avg_first_response: AnalyticsKpi;
		avg_resolution: AnalyticsKpi;
	};
	conversations: {
		user: AnalyticsBreakdownRow[];
		group: AnalyticsBreakdownRow[];
		tag: AnalyticsBreakdownRow[];
		status: AnalyticsBreakdownRow[];
	};
	messages: {
		totals: Record<MessageCategory, number>;
		series: Record<MessageCategory, number[]>;
	};
	first_response: {
		average: number | null;
		median: number | null;
		distribution: {
			label: string;
			min: number;
			max: number | null;
			count: number;
		}[];
	};
	resolution: {
		average: number | null;
		median: number | null;
		series: { average: number | null; median: number | null }[];
	};
	tags: {
		id: number | null;
		count: number;
		resolved_share: number;
		avg_resolution: number | null;
	}[];
}
