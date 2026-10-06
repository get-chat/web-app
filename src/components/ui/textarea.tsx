import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { fieldSurfaceVariants } from '@src/components/ui/input';

/** Replaces MUI's multiline TextField; grows with its content */
const textareaVariants = cva(
	'flex field-sizing-content min-h-16 w-full py-2 text-base transition-[color,border-color,box-shadow] outline-none! placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			variant: fieldSurfaceVariants,
		},
		defaultVariants: {
			variant: 'outline',
		},
	}
);

function Textarea({
	className,
	variant,
	...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
	return (
		<textarea
			data-slot="textarea"
			data-variant={variant ?? 'outline'}
			className={cn(textareaVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Textarea, textareaVariants };
