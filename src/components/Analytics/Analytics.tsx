import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import fileDownload from 'js-file-download';
import { Alert } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { Skeleton } from '@src/components/ui/skeleton';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import ArrowBackIcon from '@src/components/icons/ArrowBack';
import BarChartIcon from '@src/components/icons/BarChart';
import DownloadIcon from '@src/components/icons/Download';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { cn } from '@src/lib/utils';
import {
	Analytics as AnalyticsData,
	AnalyticsFilterId,
} from '@src/types/analytics';
import {
	AnalyticsFilters,
	clearFilters,
	DEFAULT_FILTERS,
	formatDateRange,
	getPeriodRange,
	MESSAGE_CATEGORIES,
	toCsv,
	toggleFilter,
	toUnix,
} from './analyticsHelpers';
import AnalyticsFilterBar from './AnalyticsFilterBar';
import ConversationsCard from './ConversationsCard';
import KpiCards from './KpiCards';
import MessagesCard from './MessagesCard';
import { FirstResponseCard, ResolutionCard } from './ResponseTimeCards';
import TagsCard from './TagsCard';
import useAnalytics from './useAnalytics';
import { Dimension } from './useDimensionOptions';

interface Props extends PanelTransitionProps {
	onClose: () => void;
}

/** One row per bucket, with times in seconds */
const exportCsv = (data: AnalyticsData) => {
	const { period, kpis, messages, resolution } = data;
	const dateFormat =
		period.granularity === 'hour' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';

	const csv = toCsv([
		[
			'Date',
			'Conversations answered',
			'Messages sent',
			...MESSAGE_CATEGORIES.map((category) => `Messages: ${category}`),
			'Avg. first response (s)',
			'Avg. resolution (s)',
			'Median resolution (s)',
		],
		...period.buckets.map((bucket, index) => [
			format(bucket * 1000, dateFormat),
			kpis.conversations_answered.series[index],
			kpis.messages_sent.series[index],
			...MESSAGE_CATEGORIES.map((category) => messages.series[category][index]),
			kpis.avg_first_response.series[index],
			resolution.series[index]?.average,
			resolution.series[index]?.median,
		]),
	]);

	fileDownload(
		csv,
		`analytics_${format(period.start * 1000, 'yyyy-MM-dd')}_${format(
			period.end * 1000 - 1,
			'yyyy-MM-dd'
		)}.csv`,
		'text/csv'
	);
};

const Analytics: React.FC<Props> = ({ onClose, isExiting, onAnimationEnd }) => {
	const { t, i18n } = useTranslation();
	const rootRef = useRef<HTMLDivElement>(null);
	const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);
	const [isInboxOnly, setInboxOnly] = useState(false);
	const range = useMemo(() => getPeriodRange(filters), [filters]);

	const { data, isLoading, error, reload } = useAnalytics({
		start: toUnix(range.start),
		end: toUnix(range.end),
		user: filters.user,
		group: filters.group,
		tag: filters.tag,
		status: filters.status,
		inbox_only: isInboxOnly,
	});

	const isFiltered =
		filters.user.length + filters.group.length + filters.tag.length > 0 ||
		filters.status !== 'all';

	// Not with "Inbox only" on: the empty state would hide its switch
	const isEmpty =
		data &&
		!isInboxOnly &&
		!data.kpis.conversations_answered.value &&
		!data.kpis.messages_sent.value &&
		data.tags.length === 0;

	const toggleRow = (dimension: Dimension, id: AnalyticsFilterId) =>
		setFilters(toggleFilter(filters, dimension, id));

	// Take focus from the menu button that opened the view, so its tooltip
	// closes and the keyboard starts here
	useEffect(() => rootRef.current?.focus(), []);

	return (
		<div
			ref={rootRef}
			tabIndex={-1}
			className={cn(
				// Covers the whole inbox, which stays mounted underneath: above its
				// overlays (up to z-999) and below the portals (z-[1300])
				'absolute inset-0 z-[1000] flex flex-col bg-gray-lighter outline-none!',
				isExiting ? 'pointer-events-none animate-fade-out' : 'animate-fade-in'
			)}
			onAnimationEnd={onAnimationEnd}
		>
			<div className="flex h-(--header-height) shrink-0 items-center gap-2 bg-gray-light px-3.75 py-1 max-md:px-2.5">
				<SimpleTooltip title={t('Back to inbox')} disableHoverableContent>
					<Button
						variant="ghost"
						color="neutral"
						size="icon-xl"
						onClick={onClose}
					>
						<ArrowBackIcon />
					</Button>
				</SimpleTooltip>
				<div className="min-w-0 flex-1">
					<h1 className="m-0 text-[18px] leading-tight font-normal">
						{t('Analytics')}
					</h1>
					<div className="truncate text-xs text-muted-foreground">
						{formatDateRange(range, i18n.language)}
					</div>
				</div>
				<Button
					variant="outline"
					color="neutral"
					size="sm"
					className="border-ink/15 bg-white hover:border-ink/30 hover:bg-white [&_.app-icon]:size-[18px]"
					disabled={!data}
					onClick={() => data && exportCsv(data)}
				>
					<DownloadIcon />
					{t('Export CSV')}
				</Button>
			</div>

			<AnalyticsFilterBar
				filters={filters}
				range={range}
				onChange={setFilters}
			/>

			<div className="flex-1 overflow-y-auto">
				<div
					className={cn(
						'mx-auto flex max-w-[1280px] flex-col gap-4 p-5 transition-opacity max-md:p-3',
						isLoading && data && 'opacity-60'
					)}
					aria-busy={isLoading}
				>
					{error ? (
						<Alert
							severity="error"
							action={
								<Button
									variant="ghost"
									color="destructive"
									size="sm"
									onClick={reload}
								>
									{t('Retry')}
								</Button>
							}
						>
							{t('Analytics could not be loaded.')}
						</Alert>
					) : !data ? (
						<>
							<div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
								{[0, 1, 2, 3].map((index) => (
									<Skeleton
										key={index}
										variant="rounded"
										className="h-36 rounded-xl"
									/>
								))}
							</div>
							<Skeleton variant="rounded" className="h-96 rounded-xl" />
						</>
					) : isEmpty ? (
						<div className="flex flex-col items-center gap-2 rounded-xl bg-white px-5 py-16 text-center shadow-sm">
							<BarChartIcon className="size-12 text-ink/20" />
							<div className="text-[15px] font-semibold">
								{t('No conversations in this period')}
							</div>
							<div className="text-[13px] text-muted-foreground">
								{isFiltered
									? t(
											'Nothing matches these filters. Try a longer period or fewer filters.'
									  )
									: t('Try a longer period.')}
							</div>
							<div className="mt-2 flex gap-2">
								{filters.period !== 'last30' && (
									<Button
										variant="outline"
										color="neutral"
										size="sm"
										onClick={() => setFilters({ ...filters, period: 'last30' })}
									>
										{t('Show last 30 days')}
									</Button>
								)}
								{isFiltered && (
									<Button
										variant="ghost"
										color="neutral"
										size="sm"
										onClick={() => setFilters(clearFilters(filters))}
									>
										{t('Reset filters')}
									</Button>
								)}
							</div>
						</div>
					) : (
						<>
							<KpiCards kpis={data.kpis} />
							<ConversationsCard
								data={data}
								selected={filters}
								onSelectRow={toggleRow}
							/>
							<div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
								<MessagesCard
									data={data}
									isInboxOnly={isInboxOnly}
									onInboxOnlyChange={setInboxOnly}
								/>
								<FirstResponseCard data={data} />
								<ResolutionCard data={data} />
								<TagsCard
									data={data}
									selected={filters.tag}
									onSelectRow={(id) => toggleRow('tag', id)}
								/>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Analytics;
