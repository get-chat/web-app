import React from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart } from 'recharts';
import { Card } from '@src/components/ui/card';
import { ChartContainer } from '@src/components/ui/chart';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import ArrowDownwardIcon from '@src/components/icons/ArrowDownward';
import ArrowUpwardIcon from '@src/components/icons/ArrowUpward';
import InfoIcon from '@src/components/icons/Info';
import { cn } from '@src/lib/utils';
import { Analytics, AnalyticsKpi } from '@src/types/analytics';
import {
	formatDuration,
	formatNumber,
	formatPercent,
	getChange,
	SERIES_COLORS,
} from './analyticsHelpers';

interface KpiProps {
	title: string;
	definition: string;
	kpi: AnalyticsKpi;
	format: (value: number | null) => string;
	/** For times: going down is the good direction */
	isLowerBetter?: boolean;
}

const sparklineConfig = { value: { color: SERIES_COLORS[0] } };

const Kpi: React.FC<KpiProps> = ({
	title,
	definition,
	kpi,
	format,
	isLowerBetter,
}) => {
	const { t, i18n } = useTranslation();
	const change = getChange(kpi.value, kpi.previous);
	const isGood = change !== null && change < 0 === Boolean(isLowerBetter);

	return (
		<Card className="gap-1 overflow-hidden pb-0">
			<div className="flex items-center gap-1 px-5 text-[13px] text-muted-foreground">
				{title}
				<SimpleTooltip title={definition}>
					<span tabIndex={0} className="flex cursor-help">
						<InfoIcon className="size-4 text-ink/30" />
					</span>
				</SimpleTooltip>
			</div>
			<div className="px-5 text-[26px] leading-tight font-semibold tabular-nums">
				{format(kpi.value)}
			</div>
			<div className="flex items-center gap-1 px-5 text-xs text-muted-foreground">
				{change === null ? (
					t('No data for the previous period')
				) : (
					<>
						<span
							className={cn(
								'flex items-center font-medium [&_.app-icon]:size-3.5 [&_.app-icon]:text-current',
								change === 0
									? 'text-muted-foreground'
									: isGood
									? 'text-success'
									: 'text-destructive-dark'
							)}
						>
							{change > 0 && <ArrowUpwardIcon />}
							{change < 0 && <ArrowDownwardIcon />}
							{formatPercent(Math.abs(change), i18n.language)}
						</span>
						{t('vs previous period')}
					</>
				)}
			</div>
			<ChartContainer
				config={sparklineConfig}
				className="mt-2 aspect-auto h-12 w-full"
				aria-hidden
			>
				<AreaChart
					data={kpi.series.map((value) => ({ value }))}
					margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
				>
					<Area
						dataKey="value"
						type="linear"
						stroke="var(--color-value)"
						strokeWidth={2}
						fill="var(--color-value)"
						fillOpacity={0.1}
						connectNulls
						isAnimationActive={false}
					/>
				</AreaChart>
			</ChartContainer>
		</Card>
	);
};

const KpiCards: React.FC<{ kpis: Analytics['kpis'] }> = ({ kpis }) => {
	const { t, i18n } = useTranslation();
	const formatCount = (value: number | null) =>
		formatNumber(value, i18n.language);

	return (
		<div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
			<Kpi
				title={t('Conversations answered')}
				definition={t('Conversations where an agent sent at least one reply')}
				kpi={kpis.conversations_answered}
				format={formatCount}
			/>
			<Kpi
				title={t('Messages sent')}
				definition={t('Outgoing messages, without the ones that failed')}
				kpi={kpis.messages_sent}
				format={formatCount}
			/>
			<Kpi
				title={t('Avg. first response')}
				definition={t(
					"Time from the customer's first message to the first agent reply"
				)}
				kpi={kpis.avg_first_response}
				format={formatDuration}
				isLowerBetter
			/>
			<Kpi
				title={t('Avg. resolution')}
				definition={t('Time from a conversation opening to it being resolved')}
				kpi={kpis.avg_resolution}
				format={formatDuration}
				isLowerBetter
			/>
		</div>
	);
};

export default KpiCards;
