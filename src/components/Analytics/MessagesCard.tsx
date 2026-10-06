import React from 'react';
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
	ChartTooltip,
	ChartTooltipContent,
} from '@src/components/ui/chart';
import { Switch } from '@src/components/ui/switch';
import { Analytics, MessageCategory } from '@src/types/analytics';
import {
	formatBucketLabel,
	formatNumber,
	formatPercent,
	getTimeAxisProps,
	MESSAGE_CATEGORIES,
	MESSAGE_CATEGORY_COLORS,
	VALUE_AXIS_PROPS,
} from './analyticsHelpers';

interface Props {
	data: Analytics;
	isInboxOnly: boolean;
	onInboxOnlyChange: (isInboxOnly: boolean) => void;
}

const MessagesCard: React.FC<Props> = ({
	data,
	isInboxOnly,
	onInboxOnlyChange,
}) => {
	const { t, i18n } = useTranslation();
	const { totals, series } = data.messages;

	const labels: Record<MessageCategory, string> = {
		marketing: t('Marketing'),
		utility: t('Utility'),
		authentication: t('Authentication'),
		service: t('Service'),
		unknown: t('Deleted templates'),
	};

	// Messages of templates deleted since can't be categorised; only show
	// them when there are some
	const categories = MESSAGE_CATEGORIES.filter(
		(category) => category !== 'unknown' || totals.unknown > 0
	);
	const total = categories.reduce((sum, category) => sum + totals[category], 0);

	const config: ChartConfig = Object.fromEntries(
		categories.map((category) => [
			category,
			{ label: labels[category], color: MESSAGE_CATEGORY_COLORS[category] },
		])
	);

	const chartData = data.period.buckets.map((bucket, index) => ({
		bucket,
		...Object.fromEntries(
			categories.map((category) => [category, series[category][index]])
		),
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Messages sent by category')}</CardTitle>
				<CardDescription>
					{t('Outgoing messages, by WhatsApp conversation category')}
				</CardDescription>
				<CardAction>
					<label className="flex cursor-pointer items-center gap-2 text-[13px] whitespace-nowrap">
						<Switch
							size="sm"
							checked={isInboxOnly}
							onCheckedChange={onInboxOnlyChange}
						/>
						{t('Inbox only')}
					</label>
				</CardAction>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					{categories.map((category) => (
						<div key={category} className="flex items-start gap-2">
							<span
								className="mt-1 size-2.5 shrink-0 rounded-[3px]"
								style={{ background: MESSAGE_CATEGORY_COLORS[category] }}
							/>
							<div>
								<div className="text-xs text-muted-foreground">
									{labels[category]}
								</div>
								<div className="text-[15px] font-semibold tabular-nums">
									{formatNumber(totals[category], i18n.language)}
									<span className="ml-1.5 text-xs font-normal text-muted-foreground">
										{total
											? formatPercent(totals[category] / total, i18n.language)
											: ''}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				<ChartContainer config={config} className="aspect-auto h-56 w-full">
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
						{categories.map((category) => (
							<Bar
								key={category}
								dataKey={category}
								stackId="messages"
								fill={`var(--color-${category})`}
								stroke="#fff"
								strokeWidth={1}
								maxBarSize={24}
								isAnimationActive={false}
							/>
						))}
					</BarChart>
				</ChartContainer>

				<p className="m-0 text-xs text-muted-foreground">
					{t(
						'Marketing, Utility and Authentication messages are templates; Service messages are free-form replies within the 24-hour window.'
					)}
				</p>
			</CardContent>
		</Card>
	);
};

export default MessagesCard;
