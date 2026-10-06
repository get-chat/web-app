import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@src/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@src/components/ui/table';
import SellIcon from '@src/components/icons/Sell';
import { Analytics, AnalyticsFilterId } from '@src/types/analytics';
import {
	formatDuration,
	formatNumber,
	formatPercent,
	OTHER_COLOR,
	SERIES_COLORS,
} from './analyticsHelpers';
import useDimensionOptions from './useDimensionOptions';

interface Props {
	data: Analytics;
	selected: AnalyticsFilterId[];
	onSelectRow: (id: AnalyticsFilterId) => void;
}

const TagsCard: React.FC<Props> = ({ data, selected, onSelectRow }) => {
	const { t, i18n } = useTranslation();
	const { getOption } = useDimensionOptions();
	const rows = [...data.tags].sort((a, b) => b.count - a.count);
	const max = rows[0]?.count || 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('Conversations per tag')}</CardTitle>
				<CardDescription>
					{t('Conversations in the period, by their current tags')}
				</CardDescription>
			</CardHeader>

			{rows.length ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('Tag')}</TableHead>
							<TableHead className="w-2/5">{t('Conversations')}</TableHead>
							<TableHead className="text-right">{t('Resolved')}</TableHead>
							<TableHead className="text-right">
								{t('Avg. resolution')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => {
							const option = getOption('tag', row.id);
							return (
								<TableRow
									key={String(row.id)}
									className="cursor-pointer hover:bg-menu-hover"
									data-state={
										selected.includes(option.id) ? 'selected' : undefined
									}
									tabIndex={0}
									onClick={() => onSelectRow(option.id)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') onSelectRow(option.id);
									}}
								>
									<TableCell className="max-w-48">
										<div className="flex items-center gap-2">
											<SellIcon
												className="size-4.5"
												style={{ fill: option.color ?? OTHER_COLOR }}
											/>
											<span className="truncate">{option.label}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2.5">
											<div className="h-2 flex-1 rounded-full bg-ink/5">
												<div
													className="h-full rounded-full"
													style={{
														width: `${(row.count / max) * 100}%`,
														background: SERIES_COLORS[0],
													}}
												/>
											</div>
											<span className="w-10 text-right tabular-nums">
												{formatNumber(row.count, i18n.language)}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{formatPercent(row.resolved_share, i18n.language)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{formatDuration(row.avg_resolution)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<p className="m-0 px-5 text-[13px] text-muted-foreground">
					{t('No conversations in this period')}
				</p>
			)}
		</Card>
	);
};

export default TagsCard;
