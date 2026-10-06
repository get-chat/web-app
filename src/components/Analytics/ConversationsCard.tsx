import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@src/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@src/components/ui/chart';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@src/components/ui/table';
import { Analytics, AnalyticsFilterId } from '@src/types/analytics';
import {
	formatBucketLabel,
	formatDuration,
	formatNumber,
	formatPercent,
	getTimeAxisProps,
	OTHER_COLOR,
	SERIES_COLORS,
	VALUE_AXIS_PROPS,
} from './analyticsHelpers';
import useDimensionOptions, { Dimension } from './useDimensionOptions';

interface Props {
	data: Analytics;
	/** The rows that the page is filtered by, per dimension */
	selected: Record<Dimension, AnalyticsFilterId[]>;
	onSelectRow: (dimension: Dimension, id: AnalyticsFilterId) => void;
}

// The rest is folded into "Other", so the colours stay distinguishable
const MAX_SERIES = 6;

const ConversationsCard: React.FC<Props> = ({
	data,
	selected,
	onSelectRow,
}) => {
	const { t, i18n } = useTranslation();
	const { getOption } = useDimensionOptions();
	const [dimension, setDimension] = useState<Dimension>('user');

	const dimensionNames: Record<Dimension, string> = {
		user: t('Agent'),
		group: t('Group'),
		tag: t('Tag'),
	};

	const rows = useMemo(
		() => [...data.conversations[dimension]].sort((a, b) => b.count - a.count),
		[data, dimension]
	);

	const { config, chartData } = useMemo(() => {
		const shown = rows.slice(0, MAX_SERIES);
		const rest = rows.slice(MAX_SERIES);

		const config: ChartConfig = {};
		shown.forEach((row, index) => {
			config[`s${index}`] = {
				label: getOption(dimension, row.id).label,
				color: SERIES_COLORS[index],
			};
		});
		if (rest.length) {
			config.other = { label: t('Other'), color: OTHER_COLOR };
		}

		const chartData = data.period.buckets.map((bucket, index) => ({
			bucket,
			...Object.fromEntries(
				shown.map((row, rowIndex) => [`s${rowIndex}`, row.series[index]])
			),
			...(rest.length && {
				other: rest.reduce((sum, row) => sum + row.series[index], 0),
			}),
		}));

		return { config, chartData };
	}, [rows, data, dimension, getOption, t]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Conversations answered')}</CardTitle>
				<CardDescription>
					{t('Conversations where an agent sent at least one reply')}
				</CardDescription>
				<CardAction>
					<Select
						value={dimension}
						onValueChange={(value) => setDimension(value as Dimension)}
					>
						<SelectTrigger size="sm" aria-label={t('Split by')}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem value="user">{t('By agent')}</SelectItem>
							<SelectItem value="group">{t('By group')}</SelectItem>
							<SelectItem value="tag">{t('By tag')}</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>

			<CardContent>
				<ChartContainer config={config} className="aspect-auto h-64 w-full">
					<BarChart data={chartData} margin={{ left: -12, right: 4 }}>
						<CartesianGrid vertical={false} />
						<XAxis {...getTimeAxisProps(data.period, i18n.language)} />
						<YAxis {...VALUE_AXIS_PROPS} allowDecimals={false} />
						<ChartTooltip
							content={
								<ChartTooltipContent
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
						{Object.keys(config).map((key) => (
							<Bar
								key={key}
								dataKey={key}
								stackId="conversations"
								fill={`var(--color-${key})`}
								stroke="#fff"
								strokeWidth={1}
								maxBarSize={24}
								isAnimationActive={false}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{dimensionNames[dimension]}</TableHead>
						<TableHead className="text-right">{t('Conversations')}</TableHead>
						<TableHead className="text-right">{t('Share of total')}</TableHead>
						<TableHead className="text-right">
							{t('Avg. first response')}
						</TableHead>
						<TableHead className="text-right">{t('Avg. resolution')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, index) => {
						const option = getOption(dimension, row.id);
						return (
							<TableRow
								key={String(row.id)}
								className="cursor-pointer hover:bg-menu-hover"
								data-state={
									selected[dimension].includes(option.id)
										? 'selected'
										: undefined
								}
								tabIndex={0}
								onClick={() => onSelectRow(dimension, option.id)}
								onKeyDown={(event) => {
									if (event.key === 'Enter') onSelectRow(dimension, option.id);
								}}
							>
								<TableCell className="max-w-64">
									<div className="flex items-center gap-2.5">
										<span
											className="size-2.5 shrink-0 rounded-[3px]"
											style={{
												background:
													index < MAX_SERIES
														? SERIES_COLORS[index]
														: OTHER_COLOR,
											}}
										/>
										<span className="truncate">{option.label}</span>
									</div>
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatNumber(row.count, i18n.language)}
								</TableCell>
								<TableCell className="text-right text-muted-foreground tabular-nums">
									{formatPercent(row.share, i18n.language)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatDuration(row.avg_first_response)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatDuration(row.avg_resolution)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			<p className="m-0 px-5 text-xs text-muted-foreground">
				{rows.length
					? t('Click a row to filter the whole page.')
					: t('No conversations were answered in this period.')}
			</p>
		</Card>
	);
};

export default ConversationsCard;
