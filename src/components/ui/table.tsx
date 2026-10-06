import * as React from 'react';
import { cn } from '@src/lib/utils';

/*
 * shadcn's table: hairline rows, muted header, numbers right-aligned by the
 * caller (`text-right tabular-nums`). Its outer cells are padded like a
 * Card's content, so put it straight in a Card. Scrolls sideways when narrow.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
	return (
		<div
			data-slot="table-container"
			className="relative w-full overflow-x-auto"
		>
			<table
				data-slot="table"
				className={cn('w-full border-collapse text-[13px]', className)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
	return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
	return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				'border-b border-ink/8 transition-colors last:border-b-0 data-[state=selected]:bg-menu-active',
				className
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				'h-9 px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5',
				className
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				'h-10 px-2 align-middle whitespace-nowrap first:pl-5 last:pr-5',
				className
			)}
			{...props}
		/>
	);
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
