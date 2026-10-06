import React from 'react';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from '@src/components/ui/card';
import { Skeleton } from '@src/components/ui/skeleton';
import { cn } from '@src/lib/utils';

/** A pulsing placeholder shape, light enough for the white cards */
const Bone: React.FC<React.ComponentProps<'div'>> = ({
	className,
	...props
}) => (
	<Skeleton
		variant="rounded"
		className={cn('bg-ink/6', className)}
		{...props}
	/>
);

const ChartHeader: React.FC<{ hasAction?: boolean }> = ({ hasAction }) => (
	<CardHeader>
		<Bone className="h-4 w-44" />
		<Bone className="mt-1 h-3 w-64 max-w-full" />
		{hasAction && (
			<CardAction>
				<Bone className="h-8 w-28 rounded-md" />
			</CardAction>
		)}
	</CardHeader>
);

/** Columns of fixed, varied heights (in %), like a chart about to appear */
const Bars: React.FC<{ heights: number[]; className?: string }> = ({
	heights,
	className,
}) => (
	<CardContent
		className={cn('flex h-56 items-end justify-around gap-3', className)}
	>
		{heights.map((height, index) => (
			<Bone
				key={index}
				className="max-w-6 flex-1 rounded-b-none"
				style={{ height: `${height}%` }}
			/>
		))}
	</CardContent>
);

const TableRows: React.FC<{ count: number }> = ({ count }) => (
	<div className="flex flex-col">
		{Array.from({ length: count }, (_, index) => (
			<div
				key={index}
				className="flex h-10 items-center gap-4 border-b border-ink/8 px-5 last:border-b-0"
			>
				<Bone className="size-2.5 rounded-[3px]" />
				<Bone className="h-3 w-32" />
				<Bone className="ml-auto h-3 w-10" />
				<Bone className="h-3 w-10 max-sm:hidden" />
				<Bone className="h-3 w-14 max-md:hidden" />
			</div>
		))}
	</div>
);

const KpiSkeleton: React.FC = () => (
	<Card className="gap-2 overflow-hidden pb-0">
		<Bone className="mx-5 h-3.5 w-32" />
		<Bone className="mx-5 h-7 w-20" />
		<Bone className="mx-5 h-3 w-36" />
		{/* A faint sparkline: a line over a fill, like the real one */}
		<svg
			viewBox="0 0 100 40"
			preserveAspectRatio="none"
			className="mt-2 h-12 w-full animate-skeleton text-ink/8"
			aria-hidden
		>
			<path
				d="M0 28 L17 18 L33 30 L50 12 L67 24 L83 8 L100 20 V40 H0 Z"
				fill="currentColor"
				opacity={0.4}
			/>
			<path
				d="M0 28 L17 18 L33 30 L50 12 L67 24 L83 8 L100 20"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	</Card>
);

/** The analytics page while its first data loads, in the page's own layout */
const AnalyticsSkeleton: React.FC = () => (
	<>
		<div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
			{[0, 1, 2, 3].map((index) => (
				<KpiSkeleton key={index} />
			))}
		</div>

		<Card>
			<ChartHeader hasAction />
			<Bars heights={[45, 70, 30, 85, 55, 95, 40, 65, 80, 35, 60, 75]} />
			<TableRows count={4} />
		</Card>

		<div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
			<Card>
				<ChartHeader hasAction />
				<CardContent className="flex gap-6">
					{[0, 1, 2, 3].map((index) => (
						<div key={index} className="flex flex-col gap-1.5">
							<Bone className="h-3 w-16" />
							<Bone className="h-4 w-10" />
						</div>
					))}
				</CardContent>
				<Bars heights={[40, 65, 50, 90, 30, 70, 55]} />
			</Card>
			<Card>
				<ChartHeader />
				<Bars heights={[90, 70, 45, 30, 20, 10]} className="justify-around" />
			</Card>
			<Card>
				<ChartHeader />
				<Bars heights={[35, 50, 45, 70, 60, 80, 65]} />
			</Card>
			<Card>
				<ChartHeader />
				<TableRows count={5} />
			</Card>
		</div>
	</>
);

export default AnalyticsSkeleton;
