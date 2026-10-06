import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addSeconds, min } from 'date-fns';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import DateRangeDialog from '@src/components/DateRangeDialog';
import DateRangeIcon from '@src/components/icons/DateRange';
import GroupIcon from '@src/components/icons/Group';
import KeyboardArrowDownIcon from '@src/components/icons/KeyboardArrowDown';
import PersonIcon from '@src/components/icons/Person';
import SellIcon from '@src/components/icons/Sell';
import { AnalyticsFilterId, AnalyticsStatus } from '@src/types/analytics';
import {
	AnalyticsFilters,
	clearFilters,
	DateRange,
	formatDateRange,
	PeriodPreset,
	toggleFilter,
} from './analyticsHelpers';
import useDimensionOptions, {
	Dimension,
	DimensionOption,
} from './useDimensionOptions';

interface Props {
	filters: AnalyticsFilters;
	range: DateRange;
	onChange: (filters: AnalyticsFilters) => void;
}

const DIMENSION_ICONS: Record<Dimension, React.ReactElement> = {
	user: <PersonIcon />,
	group: <GroupIcon />,
	tag: <SellIcon />,
};

const FilterButton: React.FC<React.ComponentProps<typeof Button>> = (props) => (
	<Button
		variant="outline"
		color="neutral"
		size="sm"
		className="border-ink/15 font-normal hover:border-ink/30 hover:bg-white [&_.app-icon]:size-[18px] [&_.app-icon]:text-menu-icon"
		{...props}
	/>
);

const OptionIcon: React.FC<{
	dimension: Dimension;
	option: DimensionOption;
}> = ({ dimension, option }) =>
	option.color ? (
		<SellIcon style={{ fill: option.color }} />
	) : (
		DIMENSION_ICONS[dimension]
	);

const AnalyticsFilterBar: React.FC<Props> = ({ filters, range, onChange }) => {
	const { t, i18n } = useTranslation();
	const { options, getOption } = useDimensionOptions();
	const [isDateRangeOpen, setDateRangeOpen] = useState(false);

	const periods: { value: PeriodPreset; label: string }[] = [
		{ value: 'today', label: t('Today') },
		{ value: 'last7', label: t('Last 7 days') },
		{ value: 'last30', label: t('Last 30 days') },
		{ value: 'thisMonth', label: t('This month') },
	];

	const dimensions: {
		dimension: Dimension;
		allLabel: string;
		countLabel: (count: number) => string;
	}[] = [
		{
			dimension: 'user',
			allLabel: t('All agents'),
			countLabel: (count) => t('%d agents', count),
		},
		{
			dimension: 'group',
			allLabel: t('All groups'),
			countLabel: (count) => t('%d groups', count),
		},
		{
			dimension: 'tag',
			allLabel: t('All tags'),
			countLabel: (count) => t('%d tags', count),
		},
	];

	const statuses: { value: AnalyticsStatus; label: string }[] = [
		{ value: 'all', label: t('All statuses') },
		{ value: 'open', label: t('Open only') },
		{ value: 'resolved', label: t('Resolved only') },
	];

	const toggle = (dimension: Dimension, id: AnalyticsFilterId) =>
		onChange(toggleFilter(filters, dimension, id));

	const setCustomRange = (start?: Date, end?: Date) => {
		if (!start || !end) return;
		onChange({
			...filters,
			period: 'custom',
			// The dialog ends the range at 23:59:59; the API's end is exclusive
			customRange: { start, end: min([addSeconds(end, 1), new Date()]) },
		});
	};

	const chips = [
		...dimensions.flatMap(({ dimension }) =>
			filters[dimension].map((id) => ({
				key: `${dimension}-${id}`,
				icon: (
					<OptionIcon dimension={dimension} option={getOption(dimension, id)} />
				),
				label: getOption(dimension, id).label,
				onDelete: () => toggle(dimension, id),
			}))
		),
		...(filters.status !== 'all'
			? [
					{
						key: 'status',
						icon: null,
						label: statuses.find((item) => item.value === filters.status)
							?.label,
						onDelete: () => onChange({ ...filters, status: 'all' }),
					},
			  ]
			: []),
	];

	return (
		<div className="flex flex-col gap-2.5 border-b border-ink/8 bg-white px-5 py-3 max-md:px-3">
			{/* One row on phones, scrolled sideways */}
			<div className="flex flex-wrap items-center gap-2 max-md:-mx-3 max-md:flex-nowrap max-md:overflow-x-auto max-md:px-3 max-md:[scrollbar-width:none]">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<FilterButton>
							<DateRangeIcon />
							{filters.period === 'custom'
								? formatDateRange(range, i18n.language)
								: periods.find((item) => item.value === filters.period)?.label}
							<KeyboardArrowDownIcon />
						</FilterButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuRadioGroup
							value={filters.period}
							onValueChange={(value) =>
								onChange({ ...filters, period: value as PeriodPreset })
							}
						>
							{periods.map((item) => (
								<DropdownMenuRadioItem key={item.value} value={item.value}>
									{item.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => setDateRangeOpen(true)}>
							<DateRangeIcon />
							{t('Custom range…')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{dimensions.map(({ dimension, allLabel, countLabel }) => {
					const selected = filters[dimension];
					return (
						<DropdownMenu key={dimension}>
							<DropdownMenuTrigger asChild>
								<FilterButton>
									{DIMENSION_ICONS[dimension]}
									<span className="max-w-40 truncate">
										{selected.length === 0
											? allLabel
											: selected.length === 1
											? getOption(dimension, selected[0]).label
											: countLabel(selected.length)}
									</span>
									<KeyboardArrowDownIcon />
								</FilterButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="max-h-80">
								{options[dimension].map((option) => (
									<DropdownMenuCheckboxItem
										key={option.id}
										checked={selected.includes(option.id)}
										onCheckedChange={() => toggle(dimension, option.id)}
										// Keep the menu open to pick several
										onSelect={(event) => event.preventDefault()}
									>
										{option.color && (
											<SellIcon style={{ fill: option.color }} />
										)}
										<span className="truncate">{option.label}</span>
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				})}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<FilterButton>
							{statuses.find((item) => item.value === filters.status)?.label}
							<KeyboardArrowDownIcon />
						</FilterButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuRadioGroup
							value={filters.status}
							onValueChange={(value) =>
								onChange({ ...filters, status: value as AnalyticsStatus })
							}
						>
							{statuses.map((item) => (
								<DropdownMenuRadioItem key={item.value} value={item.value}>
									{item.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{chips.length > 0 && (
				<div className="flex flex-wrap items-center gap-1.5 text-[13px]">
					<span className="mr-1 text-muted-foreground">{t('Filtered by')}</span>
					{chips.map((chip) => (
						<Badge
							key={chip.key}
							size="lg"
							className="h-7 [&_.app-icon]:size-4"
							onDelete={chip.onDelete}
						>
							{chip.icon}
							{chip.label}
						</Badge>
					))}
					<Button
						variant="link"
						color="neutral"
						size="sm"
						className="ml-1 text-[13px] font-normal"
						onClick={() => onChange(clearFilters(filters))}
					>
						{t('Clear all')}
					</Button>
				</div>
			)}

			<DateRangeDialog
				open={isDateRangeOpen}
				setOpen={setDateRangeOpen}
				onDone={setCustomRange}
			/>
		</div>
	);
};

export default AnalyticsFilterBar;
