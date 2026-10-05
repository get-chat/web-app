import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';

/*
 * Replaces MUI's TextField input. Compose the rest from field.tsx: label →
 * FieldLabel, helperText → FieldDescription / FieldError, error →
 * aria-invalid, InputAdornment → InputGroup (input-group.tsx), multiline →
 * Textarea. `variant="underline"` is MUI's "standard" TextField.
 */

/** Border and focus styles shared by inputs, textareas and input groups */
const fieldSurfaceVariants = {
	outline:
		'rounded-md border border-input bg-transparent px-3 shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20',
	underline:
		'rounded-none border-b border-input bg-transparent px-0 focus-visible:border-primary focus-visible:shadow-[inset_0_-1px_0_var(--primary)] aria-invalid:border-destructive aria-invalid:shadow-[inset_0_-1px_0_var(--destructive)]',
};

const inputVariants = cva(
	'w-full min-w-0 text-base transition-[color,border-color,box-shadow] outline-none! selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			variant: fieldSurfaceVariants,
			size: {
				sm: 'h-8 py-1',
				default: 'h-9 py-1',
				lg: 'h-10 py-2',
			},
		},
		defaultVariants: {
			variant: 'outline',
			size: 'default',
		},
	}
);

function Input({
	className,
	type,
	variant,
	size,
	...props
}: Omit<React.ComponentProps<'input'>, 'size'> &
	VariantProps<typeof inputVariants>) {
	return (
		<input
			type={type}
			data-slot="input"
			data-variant={variant ?? 'outline'}
			className={cn(inputVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Input, inputVariants, fieldSurfaceVariants };
