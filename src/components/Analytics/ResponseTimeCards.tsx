import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@src/components/ui/card';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@src/components/ui/chart';
import { Analytics } from '@src/types/analytics';
import {
	formatBucketLabel,
	formatDuration,
	formatDurationShort,
	getTimeAxisProps,
	SERIES_COLORS,
	VALUE_AXIS_PROPS,
} from './analyticsHelpers';

/** The average and median of a card, at its top right */
const Averages: React.FC<{
	average: number | null;
	median: number | null;
}> = ({ average, median }) => {
	const { t } = useTranslation();
	return (
		<CardAction className="gap-4 text-right">
			{[
				{ label: t('Average'), value: average },
				{ label: t('Median'), value: median },
			].map(({ label, value }) => (
				<div key={label}>
					<div className="text-xs text-muted-foreground">{label}</div>
					<div className="text-[15px] font-semibold tabular-nums">
						{formatDuration(value)}
					</div>
				</div>
			))}
		</CardAction>
	);
};

export const FirstResponseCard: React.FC<{ data: Analytics }> = ({ data }) => {
	const { t } = useTranslation();
	const { average, median, distribution } = data.first_response;
	const config = {
		count: { label: t('Conversations'), color: SERIES_COLORS[0] },
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('First response time')}</CardTitle>
				<CardDescription>
					{t('How long customers waited for the first reply')}
				</CardDescription>
				<Averages average={average} median={median} />
			</CardHeader>
			<CardContent>
				<ChartContainer config={config} className="aspect-auto h-56 w-full">
					<BarChart data={distribution} margin={{ left: -12, right: 4 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<YAxis {...VALUE_AXIS_PROPS} allowDecimals={false} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(label) => t('Waited %s', label)}
								/>
							}
						/>
						<Bar
							dataKey="count"
							fill="var(--color-count)"
							radius={[4, 4, 0, 0]}
							maxBarSize={40}
							isAnimationActive={false}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};

export const ResolutionCard: React.FC<{ data: Analytics }> = ({ data }) => {
	const { t, i18n } = useTranslation();
	const { average, median, series } = data.resolution;
	const config = {
		average: { label: t('Average'), color: SERIES_COLORS[0] },
		median: { label: t('Median'), color: SERIES_COLORS[1] },
	};
	const chartData = data.period.buckets.map((bucket, index) => ({
		bucket,
		...series[index],
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Resolution time')}</CardTitle>
				<CardDescription>
					{data.period.granularity === 'hour'
						? t('Time from open to resolved, per hour')
						: t('Time from open to resolved, per day')}
				</CardDescription>
				<Averages average={average} median={median} />
			</CardHeader>
			<CardContent>
				<ChartContainer config={config} className="aspect-auto h-56 w-full">
					<LineChart data={chartData} margin={{ left: 0, right: 8, top: 4 }}>
						<CartesianGrid vertical={false} />
						<XAxis {...getTimeAxisProps(data.period, i18n.language)} />
						<YAxis {...VALUE_AXIS_PROPS} tickFormatter={formatDurationShort} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									valueFormatter={formatDuration}
									labelFormatter={(_, payload) =>
										formatBucketLabel(
											payload[0]?.payload.bucket,
											data.period.granularity,
											i18n.language
										)
									}
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						{(['average', 'median'] as const).map((key) => (
							<Line
								key={key}
								dataKey={key}
								type="monotone"
								stroke={`var(--color-${key})`}
								strokeWidth={2}
								dot={{ r: 3, fill: `var(--color-${key})`, strokeWidth: 2 }}
								activeDot={{ r: 4 }}
								connectNulls
								isAnimationActive={false}
							/>
						))}
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};
