import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';

// Same variants and look as MUI's Skeleton, which the rest of the app still uses
const skeletonVariants = cva('block animate-skeleton bg-black/11', {
	variants: {
		variant: {
			// One line of text at the current font size, like MUI's default
			text: "h-auto origin-[0_55%] scale-y-60 rounded-[4px/6.7px] empty:before:content-['\\00a0']",
			circular: 'rounded-full',
			rectangular: '',
			rounded: 'rounded-[4px]',
		},
	},
	defaultVariants: {
		variant: 'text',
	},
});

function Skeleton({
	className,
	variant,
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>) {
	return (
		<div
			data-slot="skeleton"
			className={cn(skeletonVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Skeleton };
