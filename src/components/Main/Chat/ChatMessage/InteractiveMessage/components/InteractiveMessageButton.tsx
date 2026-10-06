import React from 'react';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';

/*
 * The full-width, centred text button (MUI's `<Button fullWidth>`) shown in
 * interactive message bubbles. `!` on the colours: the bubble colours every
 * link light blue.
 *
 * With an `href` it is a link, as with MUI. A link can't be `disabled`, so a
 * disabled one gets aria-disabled and the disabled look by hand, like MUI's.
 */
interface Props {
	href?: string;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	className?: string;
	children?: React.ReactNode;
}

const InteractiveMessageButton: React.FC<Props> = ({
	href,
	disabled,
	onClick,
	className,
	children,
}) => {
	const classes = cn(
		// Long labels wrap, as with MUI
		'h-auto min-h-9 w-full py-1.5 text-center font-semibold whitespace-normal text-(color:--btn)! [&_svg]:size-5! [&_svg]:text-current!',
		className
	);

	if (href) {
		return (
			<Button
				asChild
				variant="ghost"
				color="primary"
				className={cn(classes, disabled && 'pointer-events-none opacity-40')}
			>
				<a
					href={href}
					aria-disabled={disabled || undefined}
					tabIndex={disabled ? -1 : undefined}
				>
					{children}
				</a>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant="ghost"
			color="primary"
			disabled={disabled}
			onClick={onClick}
			className={classes}
		>
			{children}
		</Button>
	);
};

export default InteractiveMessageButton;
